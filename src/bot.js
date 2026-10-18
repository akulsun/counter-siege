import * as THREE from 'three';
import { buildThirdPersonRifle } from './weapons.js';

/**
 * Tactical Offline 1v1 Bot AI
 * Complete overhaul:
 * - Dynamic Tactical Leaning (corner-peeking, jiggle-peeking, lean-strafing)
 * - Human-like Ballistics & Accuracy (realistic dispersion, true hitbox intersection, near-miss whiz sounds)
 * - Smarter Tactical FSM (PATROL, INVESTIGATE, COMBAT, RETREAT_TO_COVER)
 * - Sound Awareness (hears player footsteps and gunfire)
 * - Tactical Crouch-spraying and dynamic cover utilization
 */

export class Bot {
  constructor(scene, gameMap, player, soundSystem) {
    this.scene = scene;
    this.map = gameMap;
    this.player = player;
    this.sound = soundSystem;

    // Bot Vitals
    this.health = 100;
    this.armor = 100;
    this.isDead = false;

    // FSM States: 'PATROL' | 'INVESTIGATE' | 'COMBAT' | 'RETREAT'
    this.state = 'PATROL';
    this.position = new THREE.Vector3().copy(this.map.botSpawn);
    this.velocity = new THREE.Vector3();
    this.yaw = Math.PI;
    this.pitch = 0;

    // Speeds & Movement Parameters
    this.walkSpeed = 4.4;
    this.sprintSpeed = 5.2;
    this.strafeSpeed = 3.6;
    this.aimSpeed = 5.2; // Smooth human-like tracking

    // Tactical Leaning Parameters
    this.targetLean = 0.0;    // -1 (Left), 0 (Center), +1 (Right)
    this.currentLean = 0.0;   // Lerped lean state
    this.maxLeanOffset = 0.42; // Local horizontal shift
    this.maxLeanRoll = THREE.MathUtils.degToRad(14); // ~14 deg tactical roll
    this.leanTimer = 0.0;
    this.leanDecisionTimer = 0.0;

    // Stance
    this.isCrouching = false;
    this.crouchTimer = 0.0;

    // Perception & Reaction
    this.hasLineOfSight = false;
    this.reactionTimer = 0.0;    // Human reaction delay (~220ms) before shooting on sight
    this.reactionDelay = 0.24;
    this.lostSightTimer = 0.0;   // Memory of player after breaking LoS
    this.lastSeenPos = null;
    this.lastSeenVelocity = new THREE.Vector3();
    this.investigatePos = null;

    // Combat & Ballistics Parameters
    this.fireCooldown = 0;
    this.burstCount = 0;
    this.burstMax = 3;
    this.burstCadence = 0.11; // Time between shots in burst
    this.strafeDir = 1;
    this.strafeTimer = 0;
    this.retreatTimer = 0;
    this.coverCheckTimer = 0;

    // Tactical Waypoints & Route Networks
    const uY = this.map.upperLevelY || 1.6;
    this.routes = {
      westFlank: [
        new THREE.Vector3(-6.475, uY, -11.0),
        new THREE.Vector3(-7.2, uY, -3.0),
        new THREE.Vector3(-7.2, uY, 3.0),
        new THREE.Vector3(-6.475, uY, 11.0),
        new THREE.Vector3(0, uY, 19.5)
      ],
      eastFlank: [
        new THREE.Vector3(6.475, uY, -11.0),
        new THREE.Vector3(7.2, uY, -3.0),
        new THREE.Vector3(7.2, uY, 3.0),
        new THREE.Vector3(6.475, uY, 11.0),
        new THREE.Vector3(0, uY, 19.5)
      ],
      centerPit: [
        new THREE.Vector3(0, uY, -7.5),
        new THREE.Vector3(-1.8, 0.0, -2.5),
        new THREE.Vector3(1.8, 0.0, 2.5),
        new THREE.Vector3(0, uY, 7.5),
        new THREE.Vector3(0, uY, 19.5)
      ]
    };

    this.activeRoute = this.routes.westFlank;
    this.currentWaypointIndex = 0;
    this.pauseAtWaypointTimer = 0;

    // Physical Dimensions & Bounding Box
    this.radius = 0.38;
    this.height = 1.7;
    this.boundingBox = new THREE.Box3();

    // Visual Hierarchy & Hitboxes
    this.hitMeshes = [];
    this.headMesh = null;
    this.flashTimer = 0;
    this.root = this.buildBeanModel();
    this.scene.add(this.root);

    // Shared reusable Raycaster & LoS timer (prevents thousands of Raycaster allocations)
    this.raycaster = new THREE.Raycaster();
    this.losTimer = 0;

    // Pre-allocated bullet tracer pool for bot
    this.tracerPoolSize = 6;
    this.tracerIndex = 0;
    this.tracerPool = [];
    const tracerMat = new THREE.LineBasicMaterial({
      color: 0xffe680,
      transparent: true,
      opacity: 0.85
    });
    for (let i = 0; i < this.tracerPoolSize; i++) {
      const geo = new THREE.BufferGeometry();
      const posArray = new Float32Array(6);
      geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const line = new THREE.Line(geo, tracerMat);
      line.visible = false;
      this.scene.add(line);
      this.tracerPool.push({ line, timer: 0 });
    }

    // Pre-allocated impact spark pool for bot
    this.sparkPoolSize = 8;
    this.sparkIndex = 0;
    this.sparkGeo = new THREE.SphereGeometry(0.04, 4, 4);
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xffe680 });
    this.sparkPool = [];
    for (let i = 0; i < this.sparkPoolSize; i++) {
      const spark = new THREE.Mesh(this.sparkGeo, this.sparkMat);
      spark.visible = false;
      this.scene.add(spark);
      this.sparkPool.push({ mesh: spark, timer: 0 });
    }

    this.onDeath = null;
    this.updateAABB();
  }

  // =========================================================================
  // 3D MODEL ASSEMBLY WITH ARTICULATED TACTICAL LEAN & CROUCH
  // =========================================================================
  buildBeanModel() {
    const root = new THREE.Group();

    // Palette & Materials
    const crimsonMat = new THREE.MeshStandardMaterial({
      color: 0xd92b2b,
      roughness: 0.45,
      metalness: 0.15
    });

    const darkVisorMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.2,
      metalness: 0.8
    });

    const gunMat = new THREE.MeshStandardMaterial({
      color: 0x1f2326,
      metalness: 0.85,
      roughness: 0.35
    });

    // 1. Crouch Group (handles height lowering)
    this.crouchGroup = new THREE.Group();
    root.add(this.crouchGroup);

    // 2. Bean Body (Capsule)
    const beanGeo = new THREE.CapsuleGeometry(0.32, 0.65, 8, 16);
    this.beanMesh = new THREE.Mesh(beanGeo, crimsonMat);
    this.beanMesh.position.y = 0.65;
    this.beanMesh.castShadow = true;
    this.beanMesh.receiveShadow = true;
    this.crouchGroup.add(this.beanMesh);
    this.hitMeshes.push(this.beanMesh);

    // 3. Lean Group (articulates head and weapon tilt/displacement)
    this.leanGroup = new THREE.Group();
    this.crouchGroup.add(this.leanGroup);

    // 4. Spherical Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.34, 0);

    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, crimsonMat);
    headMesh.userData.isHead = true;
    headMesh.castShadow = true;
    headGroup.add(headMesh);
    this.hitMeshes.push(headMesh);

    // Tactical Visor
    const visorGeo = new THREE.BoxGeometry(0.22, 0.08, 0.12);
    const visorMesh = new THREE.Mesh(visorGeo, darkVisorMat);
    visorMesh.position.set(0, 0.02, 0.16);
    visorMesh.userData.isHead = true;
    headGroup.add(visorMesh);
    this.hitMeshes.push(visorMesh);

    this.leanGroup.add(headGroup);
    this.headMesh = headGroup;

    // 5. Tactical Rifle
    const botGun = buildThirdPersonRifle();

    // Muzzle Flash Effect Group
    this.muzzleFlash = this.createMuzzleFlash();
    this.muzzleFlash.position.set(0, 0.02, -0.5);
    botGun.add(this.muzzleFlash);

    botGun.position.set(0.28, 0.78, 0.28);
    botGun.rotation.x = -0.1;
    this.leanGroup.add(botGun);
    this.botGun = botGun;

    root.position.copy(this.position);
    return root;
  }

  createMuzzleFlash() {
    const flashGroup = new THREE.Group();
    flashGroup.visible = false;

    const geo = new THREE.OctahedronGeometry(0.07, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    flashGroup.add(new THREE.Mesh(geo, mat));

    const light = new THREE.PointLight(0xffaa33, 2.0, 3.5);
    flashGroup.add(light);
    return flashGroup;
  }

  getHitMeshes() {
    return this.hitMeshes;
  }

  // =========================================================================
  // AUDIO PERCEPTION HOOKS (HEARING)
  // =========================================================================
  onPlayerGunfire(playerPos) {
    if (this.isDead || !playerPos) return;

    // Gunfire is loud and instantly alerts the bot across the arena
    this.investigatePos = playerPos.clone();
    if (this.state !== 'COMBAT') {
      this.state = 'INVESTIGATE';
      // Snap attention towards source of gunshot
      const toGunfire = this.investigatePos.clone().sub(this.position);
      toGunfire.y = 0;
      this.yaw = Math.atan2(-toGunfire.x, -toGunfire.z);
    }
  }

  onPlayerFootstep(playerPos, isCrouching) {
    if (this.isDead || isCrouching || !playerPos) return;

    // Running footsteps audible within 17m
    const dist = this.position.distanceTo(playerPos);
    if (dist < 17.0) {
      this.investigatePos = playerPos.clone();
      if (this.state === 'PATROL') {
        this.state = 'INVESTIGATE';
      }
    }
  }

  // =========================================================================
  // MAIN AI LOGIC LOOP
  // =========================================================================
  update(dt) {
    if (this.isDead) return;
    dt = Math.min(dt, 0.05);

    // 1. Tactical Leaning Evaluation (only leans when behind an object and peering at player)
    this.evaluateTacticalLeaning(dt);
    this.updateLeaningTransform(dt);

    // 2. Line-of-sight analysis (throttled to 20Hz check to save heavy raycasting overhead)
    this.losTimer -= dt;
    if (this.losTimer <= 0) {
      this.losTimer = 0.05;
      this.checkLineOfSight();
    }

    // 3. FSM State Transition Management
    if (this.hasLineOfSight && !this.player.isDead) {
      if (this.state !== 'COMBAT' && this.state !== 'RETREAT') {
        this.state = 'COMBAT';
        this.reactionTimer = this.reactionDelay; // Human reaction delay
      }
      this.lastSeenPos = this.player.position.clone();
      this.lastSeenVelocity.copy(this.player.velocity);
      this.lostSightTimer = 0.0;
    } else {
      if (this.state === 'COMBAT') {
        this.lostSightTimer += dt;
        if (this.lostSightTimer > 3.0) {
          // Lost sight for too long: switch to cautious investigation
          this.state = 'INVESTIGATE';
          if (this.lastSeenPos) {
            this.investigatePos = this.lastSeenPos.clone();
          }
        }
      }
    }

    // 4. FSM Execution
    switch (this.state) {
      case 'PATROL':
        this.updatePatrol(dt);
        break;
      case 'INVESTIGATE':
        this.updateInvestigate(dt);
        break;
      case 'COMBAT':
        this.updateCombat(dt);
        break;
      case 'RETREAT':
        this.updateRetreat(dt);
        break;
    }

    // 5. Weapon Elevation Tracking (tilt gun vertically towards player)
    if (this.botGun && this.player && !this.player.isDead) {
      const muzzlePos = this.getMuzzlePosition();
      const toPlayerY = (this.player.position.y + (this.player.currentEyeHeight || 1.62) * 0.7) - muzzlePos.y;
      const distHoriz = Math.hypot(this.player.position.x - muzzlePos.x, this.player.position.z - muzzlePos.z);
      const targetPitch = -Math.atan2(toPlayerY, Math.max(distHoriz, 1.0));
      this.botGun.rotation.x = THREE.MathUtils.lerp(this.botGun.rotation.x, targetPitch, 8.0 * dt);
    }

    // 6. Cooldowns & Muzzle Flash
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.reactionTimer > 0) this.reactionTimer -= dt;

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0 && this.muzzleFlash) {
        this.muzzleFlash.visible = false;
      }
    }

    // Update Tracer & Spark Pool timers
    if (this.tracerPool) {
      for (let i = 0; i < this.tracerPoolSize; i++) {
        const item = this.tracerPool[i];
        if (item.timer > 0) {
          item.timer -= dt;
          if (item.timer <= 0) {
            item.line.visible = false;
          }
        }
      }
    }

    if (this.sparkPool) {
      for (let i = 0; i < this.sparkPoolSize; i++) {
        const item = this.sparkPool[i];
        if (item.timer > 0) {
          item.timer -= dt;
          if (item.timer <= 0) {
            item.mesh.visible = false;
          }
        }
      }
    }

    // 7. Swept Collision & Map Physics
    this.resolveMovement(dt);
    this.updateAABB();

    // 8. Sync Root Transform
    this.root.position.copy(this.position);
    this.root.rotation.y = this.yaw;
  }

  // =========================================================================
  // LEANING & SIGHTLINE GEOMETRY
  // =========================================================================
  getCenterEyePosition() {
    const eyeY = this.isCrouching ? 0.95 : 1.35;
    return this.position.clone().add(new THREE.Vector3(0, eyeY, 0));
  }

  getLeanedEyePosition(leanAmount) {
    const eyeY = this.isCrouching ? 0.95 : 1.35;
    const eye = this.position.clone().add(new THREE.Vector3(0, eyeY, 0));
    const localRight = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    eye.add(localRight.multiplyScalar(leanAmount * this.maxLeanOffset));
    return eye;
  }

  getEyePosition() {
    const eyeY = this.isCrouching ? 0.95 : 1.35;
    const eye = this.position.clone().add(new THREE.Vector3(0, eyeY, 0));
    const localRight = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    eye.add(localRight.multiplyScalar(this.currentLean * this.maxLeanOffset));
    return eye;
  }

  getMuzzlePosition() {
    const eyeY = this.isCrouching ? 0.72 : 1.05;
    const muzzle = this.position.clone().add(new THREE.Vector3(0, eyeY, 0));
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const localRight = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    muzzle.add(forward.multiplyScalar(0.45));
    muzzle.add(localRight.multiplyScalar(0.25 + this.currentLean * this.maxLeanOffset));
    return muzzle;
  }

  checkLineOfSight() {
    if (this.player.isDead) {
      this.hasLineOfSight = false;
      return;
    }

    const botEye = this.getEyePosition();
    const playerEye = this.player.position.clone().add(new THREE.Vector3(0, this.player.currentEyeHeight || 1.62, 0));
    const playerChest = this.player.position.clone().add(new THREE.Vector3(0, (this.player.currentEyeHeight || 1.62) * 0.65, 0));

    const distHead = botEye.distanceTo(playerEye);
    if (distHead > 65.0) {
      this.hasLineOfSight = false;
      return;
    }

    const occluders = (this.map.occluderMeshes && this.map.occluderMeshes.length > 0) ? this.map.occluderMeshes : this.map.colliderMeshes;

    // 1. Check head visibility
    const dirHead = playerEye.clone().sub(botEye).normalize();
    this.raycaster.set(botEye, dirHead);
    this.raycaster.near = 0.15;
    this.raycaster.far = distHead;
    const hitsHead = this.raycaster.intersectObjects(occluders, false);
    if (hitsHead.length === 0 || hitsHead[0].distance >= distHead - 0.25) {
      this.hasLineOfSight = true;
      return;
    }

    // 2. Check chest visibility
    const distChest = botEye.distanceTo(playerChest);
    const dirChest = playerChest.clone().sub(botEye).normalize();
    this.raycaster.set(botEye, dirChest);
    this.raycaster.near = 0.15;
    this.raycaster.far = distChest;
    const hitsChest = this.raycaster.intersectObjects(occluders, false);
    this.hasLineOfSight = (hitsChest.length === 0 || hitsChest[0].distance >= distChest - 0.25);
  }

  evaluateTacticalLeaning(dt) {
    this.leanDecisionTimer -= dt;
    if (this.leanDecisionTimer > 0) return;
    this.leanDecisionTimer = 0.1; // 10 Hz check for responsive peeking

    if (this.player.isDead) {
      this.targetLean = 0.0;
      return;
    }

    const centerEye = this.getCenterEyePosition();
    const playerEye = this.player.position.clone().add(
      new THREE.Vector3(0, this.player.currentEyeHeight || 1.62, 0)
    );
    const playerChest = this.player.position.clone().add(
      new THREE.Vector3(0, (this.player.currentEyeHeight || 1.62) * 0.65, 0)
    );

    const distToPlayer = centerEye.distanceTo(playerEye);
    if (distToPlayer > 55.0) {
      this.targetLean = 0.0;
      return;
    }

    const dirCenter = playerEye.clone().sub(centerEye).normalize();

    // In PATROL, only evaluate leaning if player is in front of bot
    if (this.state === 'PATROL') {
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      if (forward.dot(dirCenter) < 0.2) {
        this.targetLean = 0.0;
        return;
      }
    }

    const occluders = (this.map.occluderMeshes && this.map.occluderMeshes.length > 0) ? this.map.occluderMeshes : this.map.colliderMeshes;

    // Check if bot's center body is blocked by a nearby object/cover
    this.raycaster.set(centerEye, dirCenter);
    this.raycaster.near = 0.15;
    this.raycaster.far = distToPlayer;
    const centerHits = this.raycaster.intersectObjects(occluders, false);
    const centerBlocked = (centerHits.length > 0 && centerHits[0].distance < distToPlayer - 0.25);
    const behindNearbyObject = centerBlocked && (centerHits[0].distance < 5.5);

    // If NOT behind an object: MUST NOT LEAN! Keep upright posture in open areas!
    if (!behindNearbyObject) {
      this.targetLean = 0.0;
      return;
    }

    // The bot IS behind an object. Test if leaning left or right allows him to see the player:
    const canSeePlayer = (fromEye) => {
      // Check head
      const dHead = fromEye.distanceTo(playerEye);
      const dirH = playerEye.clone().sub(fromEye).normalize();
      this.raycaster.set(fromEye, dirH);
      this.raycaster.near = 0.15;
      this.raycaster.far = dHead;
      const hH = this.raycaster.intersectObjects(occluders, false);
      if (hH.length === 0 || hH[0].distance >= dHead - 0.25) return true;

      // Check chest
      const dChest = fromEye.distanceTo(playerChest);
      const dirC = playerChest.clone().sub(fromEye).normalize();
      this.raycaster.set(fromEye, dirC);
      this.raycaster.near = 0.15;
      this.raycaster.far = dChest;
      const hC = this.raycaster.intersectObjects(occluders, false);
      if (hC.length === 0 || hC[0].distance >= dChest - 0.25) return true;

      return false;
    };

    const leftEye = this.getLeanedEyePosition(-1.0);
    const rightEye = this.getLeanedEyePosition(1.0);

    const canSeeLeft = canSeePlayer(leftEye);
    const canSeeRight = canSeePlayer(rightEye);

    if (canSeeLeft && !canSeeRight) {
      this.targetLean = -1.0; // Peek left around object to see player
    } else if (canSeeRight && !canSeeLeft) {
      this.targetLean = 1.0;  // Peek right around object to see player
    } else if (canSeeLeft && canSeeRight) {
      // Both sides clear: hold current lean if already leaning, or default right
      if (this.targetLean !== -1.0 && this.targetLean !== 1.0) {
        this.targetLean = 1.0;
      }
    } else {
      // Completely behind a wall/obstacle where neither lean can see the player
      this.targetLean = 0.0;
    }
  }

  updateLeaningTransform(dt) {
    this.currentLean = THREE.MathUtils.lerp(this.currentLean, this.targetLean, 10.0 * dt);

    if (this.leanGroup) {
      this.leanGroup.position.x = this.currentLean * this.maxLeanOffset;
      this.leanGroup.rotation.z = -this.currentLean * this.maxLeanRoll;
    }

    if (this.beanMesh) {
      this.beanMesh.rotation.z = -this.currentLean * 0.08;
      this.beanMesh.position.x = this.currentLean * 0.12;
    }

    if (this.crouchGroup) {
      const targetCrouchY = this.isCrouching ? -0.36 : 0.0;
      this.crouchGroup.position.y = THREE.MathUtils.lerp(this.crouchGroup.position.y, targetCrouchY, 10.0 * dt);
    }
  }

  // =========================================================================
  // FSM BEHAVIORS
  // =========================================================================
  updatePatrol(dt) {
    this.isCrouching = false;

    // Handle tactical pause at vantage point (peeking before pushing)
    if (this.pauseAtWaypointTimer > 0) {
      this.pauseAtWaypointTimer -= dt;
      this.velocity.set(0, 0, 0);
      return;
    }

    const targetWp = this.activeRoute[this.currentWaypointIndex];
    const toWp = targetWp.clone().sub(this.position);
    toWp.y = 0;
    const dist = toWp.length();

    if (dist < 1.4) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.activeRoute.length) {
        // Switch between dynamic routes for unpredictable patrol
        const routeKeys = Object.keys(this.routes);
        const randomKey = routeKeys[Math.floor(Math.random() * routeKeys.length)];
        this.activeRoute = this.routes[randomKey];
        this.currentWaypointIndex = 0;
      }

      // 40% chance to pause at key chokepoints and hold angle for 1.2s
      if (Math.random() < 0.4) {
        this.pauseAtWaypointTimer = 1.2 + Math.random() * 0.8;
      }
    } else {
      toWp.normalize();
      const targetYaw = Math.atan2(-toWp.x, -toWp.z);
      this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw, 4.5 * dt);
      this.velocity.x = toWp.x * this.walkSpeed;
      this.velocity.z = toWp.z * this.walkSpeed;
    }
  }

  updateInvestigate(dt) {
    this.isCrouching = false;
    const target = this.investigatePos || this.lastSeenPos;
    if (!target) {
      this.state = 'PATROL';
      return;
    }

    const toTarget = target.clone().sub(this.position);
    toTarget.y = 0;
    const dist = toTarget.length();

    if (dist < 1.8) {
      this.investigatePos = null;
      this.lastSeenPos = null;
      this.state = 'PATROL';
    } else {
      toTarget.normalize();
      const targetYaw = Math.atan2(-toTarget.x, -toTarget.z);
      this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw, 6.0 * dt);
      this.velocity.x = toTarget.x * this.sprintSpeed;
      this.velocity.z = toTarget.z * this.sprintSpeed;
    }
  }

  updateCombat(dt) {
    // 1. Aim Tracking
    const toPlayer = this.player.position.clone().sub(this.position);
    const playerDist = toPlayer.length();
    toPlayer.y = 0;
    toPlayer.normalize();

    const targetYaw = Math.atan2(-toPlayer.x, -toPlayer.z);
    this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw, this.aimSpeed * dt);

    // 2. Health & Cover Retreat Evaluation
    if (this.health < 35 && playerDist > 8.0) {
      this.state = 'RETREAT';
      this.retreatTimer = 2.4;
      return;
    }

    // 3. Tactical Movement (Distance Management & Strafing)
    this.strafeTimer -= dt;
    if (this.strafeTimer <= 0) {
      this.strafeDir *= -1;
      this.strafeTimer = 0.7 + Math.random() * 0.8;
      // 30% chance to drop into tactical crouch during spray
      this.isCrouching = (Math.random() < 0.35);
    }

    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));

    // Dynamic distance control
    let pushMult = 0;
    if (playerDist > 22.0) {
      pushMult = 0.7; // Advance if too far
    } else if (playerDist < 6.0) {
      pushMult = -0.8; // Backpedal if too close
    }

    if (this.targetLean !== 0.0) {
      // Behind cover holding peek: hold ground and don't run into obstacles
      this.velocity.x = 0;
      this.velocity.z = 0;
    } else {
      const curSpeed = this.isCrouching ? (this.strafeSpeed * 0.5) : this.strafeSpeed;
      this.velocity.x = (right.x * (curSpeed * this.strafeDir)) + (forward.x * (this.walkSpeed * pushMult));
      this.velocity.z = (right.z * (curSpeed * this.strafeDir)) + (forward.z * (this.walkSpeed * pushMult));
    }

    // 4. Ballistics Firing
    if (this.fireCooldown <= 0 && this.reactionTimer <= 0) {
      // Only fire if crosshair is reasonably aligned and we have clear sight
      const yawDelta = Math.abs(this.yaw - targetYaw);
      if (yawDelta < 0.45 && this.hasLineOfSight) {
        this.fireBurst();
      }
    }
  }

  updateRetreat(dt) {
    this.retreatTimer -= dt;
    this.isCrouching = false;

    if (this.retreatTimer <= 0 || !this.lastSeenPos) {
      this.state = 'COMBAT';
      return;
    }

    // Run away from player's last known location toward safety
    const away = this.position.clone().sub(this.lastSeenPos);
    away.y = 0;
    away.normalize();

    const targetYaw = Math.atan2(-away.x, -away.z);
    this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw, 5.0 * dt);

    this.velocity.x = away.x * this.sprintSpeed;
    this.velocity.z = away.z * this.sprintSpeed;
  }

  // =========================================================================
  // REALISTIC BALLISTICS (TUNED TO ~75% ACCURACY)
  // =========================================================================
  fireBurst() {
    this.sound.playGunshot('ak47');

    if (this.muzzleFlash) {
      this.muzzleFlash.visible = true;
      this.flashTimer = 0.05;
    }

    const botMuzzle = this.getMuzzlePosition();

    // 1. Target positions on player
    const playerHead = this.player.position.clone().add(
      new THREE.Vector3(0, this.player.currentEyeHeight || 1.62, 0)
    );
    const playerLeanOffset = new THREE.Vector3(
      Math.cos(this.player.yaw || 0),
      0,
      -Math.sin(this.player.yaw || 0)
    ).multiplyScalar((this.player.currentLean || 0) * (this.player.maxLeanOffset || 0.44));
    playerHead.add(playerLeanOffset);

    const playerChest = this.player.position.clone().add(
      new THREE.Vector3(0, (this.player.currentEyeHeight || 1.62) * 0.65, 0)
    );

    // 2. Check visibility of player head and chest from muzzle
    const distHead = botMuzzle.distanceTo(playerHead);
    const dirHead = playerHead.clone().sub(botMuzzle).normalize();
    const rayHead = new THREE.Raycaster(botMuzzle, dirHead, 0.1, distHead);
    const hitsHead = rayHead.intersectObjects(this.map.colliderMeshes, false);
    const headVisible = (hitsHead.length === 0 || hitsHead[0].distance >= distHead - 0.25);

    const distChest = botMuzzle.distanceTo(playerChest);
    const dirChest = playerChest.clone().sub(botMuzzle).normalize();
    const rayChest = new THREE.Raycaster(botMuzzle, dirChest, 0.1, distChest);
    const hitsChest = rayChest.intersectObjects(this.map.colliderMeshes, false);
    const chestVisible = (hitsChest.length === 0 || hitsChest[0].distance >= distChest - 0.25);

    // 3. ~75% Target Accuracy
    const willHit = Math.random() < 0.75;

    let targetPos;
    if (willHit && (headVisible || chestVisible)) {
      // 75% ACCURATE HIT: Target visible parts of player with slight natural jitter inside hitbox
      let targetHead = false;
      if (headVisible && !chestVisible) {
        targetHead = true;
      } else if (headVisible && chestVisible) {
        targetHead = (Math.random() < 0.22); // 22% headshot chance
      }

      if (targetHead) {
        targetPos = playerHead.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.16,
          (Math.random() - 0.5) * 0.16,
          (Math.random() - 0.5) * 0.16
        ));
      } else {
        targetPos = playerChest.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.20,
          (Math.random() - 0.5) * 0.20,
          (Math.random() - 0.5) * 0.20
        ));
      }
    } else {
      // 25% MISS (or obstructed by wall):
      // Intentionally offset aim vector by 0.55m - 0.85m to narrowly miss player
      const baseTarget = headVisible ? playerHead : playerChest;
      const toTarget = baseTarget.clone().sub(botMuzzle).normalize();
      const perp = new THREE.Vector3(-toTarget.z, 0, toTarget.x).normalize();
      const missSide = (Math.random() < 0.5 ? 1 : -1);
      const missDist = 0.55 + Math.random() * 0.30; // Just outside the 0.38m body radius
      targetPos = baseTarget.clone().add(perp.multiplyScalar(missSide * missDist));
      targetPos.y += (Math.random() - 0.5) * 0.35;
    }

    const aimDir = targetPos.clone().sub(botMuzzle).normalize();

    // 4. Raycast against map colliders
    const raycaster = new THREE.Raycaster(botMuzzle, aimDir, 0.1, 100);
    const mapHits = raycaster.intersectObjects(this.map.colliderMeshes, false);
    const mapDist = mapHits.length > 0 ? mapHits[0].distance : Infinity;

    // 5. Mathematical hit test against player capsule and head
    const hitResult = this.checkBulletHitPlayer(botMuzzle, aimDir, this.player);

    let tracerEnd = botMuzzle.clone().add(aimDir.clone().multiplyScalar(Math.min(mapDist, 40)));

    if (hitResult.hit && hitResult.distance < mapDist) {
      // BULLET HIT PLAYER!
      tracerEnd = hitResult.hitPoint;
      const damage = hitResult.isHeadshot
        ? 52
        : (16 + Math.floor(Math.random() * 8));

      this.player.takeDamage(damage, this.position);
    } else {
      // BULLET MISSED PLAYER!
      if (mapHits.length > 0) {
        tracerEnd = mapHits[0].point;
        this.spawnImpactSparks(mapHits[0].point);
      }

      // Check for near-miss supersonic bullet whiz
      const toPlayerHead = playerHead.clone().sub(botMuzzle);
      const proj = toPlayerHead.dot(aimDir);
      if (proj > 0) {
        const closestOnRay = botMuzzle.clone().add(aimDir.clone().multiplyScalar(proj));
        if (closestOnRay.distanceTo(playerHead) < 1.6) {
          if (this.sound && this.sound.playBulletWhiz) {
            this.sound.playBulletWhiz();
          }
        }
      }
    }

    // Spawn visible bullet tracer line
    this.spawnTracer(botMuzzle, tracerEnd);

    // Burst cadence management
    this.burstCount++;
    if (this.burstCount >= this.burstMax) {
      this.burstCount = 0;
      this.fireCooldown = 0.50 + Math.random() * 0.30; // Pause between bursts
    } else {
      this.fireCooldown = this.burstCadence;
    }
  }

  checkBulletHitPlayer(rayOrigin, rayDir, player) {
    if (player.isDead) return { hit: false };

    // 1. Player Head Sphere (incorporates player crouch & tactical lean)
    const playerLeanOffset = new THREE.Vector3(
      Math.cos(player.yaw || 0),
      0,
      -Math.sin(player.yaw || 0)
    ).multiplyScalar((player.currentLean || 0) * (player.maxLeanOffset || 0.44));

    const headCenter = player.position.clone()
      .add(new THREE.Vector3(0, player.currentEyeHeight || 1.62, 0))
      .add(playerLeanOffset);
    const headRadius = 0.25;

    const toHead = headCenter.clone().sub(rayOrigin);
    const projHead = toHead.dot(rayDir);
    if (projHead > 0) {
      const closestOnRay = rayOrigin.clone().add(rayDir.clone().multiplyScalar(projHead));
      if (closestOnRay.distanceTo(headCenter) <= headRadius) {
        return { hit: true, isHeadshot: true, hitPoint: closestOnRay, distance: projHead };
      }
    }

    // 2. Player Body Capsule (Ray vs Vertical Segment)
    const bodyBottom = player.position.clone();
    bodyBottom.y += 0.15;
    const bodyTop = player.position.clone();
    bodyTop.y += Math.max(0.4, (player.currentHeight || 1.8) - 0.2);
    const bodyRadius = player.radius || 0.38;

    const seg = bodyTop.clone().sub(bodyBottom);
    const segLen = seg.length();
    const segDir = seg.clone().normalize();

    const diff = rayOrigin.clone().sub(bodyBottom);
    const a = rayDir.dot(rayDir) - Math.pow(rayDir.dot(segDir), 2);
    const b = 2 * (rayDir.dot(diff) - rayDir.dot(segDir) * diff.dot(segDir));
    const c = diff.dot(diff) - Math.pow(diff.dot(segDir), 2) - bodyRadius * bodyRadius;

    const discr = b * b - 4 * a * c;
    if (discr >= 0) {
      const t = (-b - Math.sqrt(discr)) / (2 * a);
      if (t > 0) {
        const hitPt = rayOrigin.clone().add(rayDir.clone().multiplyScalar(t));
        const segDist = hitPt.clone().sub(bodyBottom).dot(segDir);
        if (segDist >= 0 && segDist <= segLen) {
          return { hit: true, isHeadshot: false, hitPoint: hitPt, distance: t };
        }
      }
    }

    return { hit: false };
  }

  spawnTracer(start, end) {
    if (!this.tracerPool || this.tracerPool.length === 0) return;
    const item = this.tracerPool[this.tracerIndex];
    this.tracerIndex = (this.tracerIndex + 1) % this.tracerPoolSize;
    const pos = item.line.geometry.attributes.position.array;
    pos[0] = start.x; pos[1] = start.y; pos[2] = start.z;
    pos[3] = end.x;   pos[4] = end.y;   pos[5] = end.z;
    item.line.geometry.attributes.position.needsUpdate = true;
    item.line.visible = true;
    item.timer = 0.05;
  }

  spawnImpactSparks(point) {
    if (!this.sparkPool || this.sparkPool.length === 0) return;
    const item = this.sparkPool[this.sparkIndex];
    this.sparkIndex = (this.sparkIndex + 1) % this.sparkPoolSize;
    item.mesh.position.copy(point);
    item.mesh.visible = true;
    item.timer = 0.07;
  }

  // =========================================================================
  // COLLISION & MOVEMENT RESOLUTION
  // =========================================================================
  resolveMovement(dt) {
    const r = this.radius;
    const stepHeight = 0.4;
    const currentH = this.height;

    // 1. Move X
    const dx = this.velocity.x * dt;
    if (Math.abs(dx) > 0.00001) {
      let targetX = this.position.x + dx;
      const minZ = this.position.z - r * 0.85;
      const maxZ = this.position.z + r * 0.85;
      const feetY = this.position.y;
      const headY = feetY + currentH;

      for (let i = 0; i < this.map.colliders.length; i++) {
        const box = this.map.colliders[i];
        if (box.max.y <= feetY + stepHeight || box.min.y >= headY - 0.05) continue;
        if (box.max.z <= minZ || box.min.z >= maxZ) continue;

        if (dx > 0) {
          if (this.position.x + r <= box.min.x + 0.1 && targetX + r > box.min.x) {
            targetX = box.min.x - r;
            this.strafeDir *= -1;
          }
        } else if (dx < 0) {
          if (this.position.x - r >= box.max.x - 0.1 && targetX - r < box.max.x) {
            targetX = box.max.x + r;
            this.strafeDir *= -1;
          }
        }
      }
      this.position.x = targetX;
    }

    // 2. Move Z
    const dz = this.velocity.z * dt;
    if (Math.abs(dz) > 0.00001) {
      let targetZ = this.position.z + dz;
      const minX = this.position.x - r * 0.85;
      const maxX = this.position.x + r * 0.85;
      const feetY = this.position.y;
      const headY = feetY + currentH;

      for (let i = 0; i < this.map.colliders.length; i++) {
        const box = this.map.colliders[i];
        if (box.max.y <= feetY + stepHeight || box.min.y >= headY - 0.05) continue;
        if (box.max.x <= minX || box.min.x >= maxX) continue;

        if (dz > 0) {
          if (this.position.z + r <= box.min.z + 0.1 && targetZ + r > box.min.z) {
            targetZ = box.min.z - r;
            this.strafeDir *= -1;
          }
        } else if (dz < 0) {
          if (this.position.z - r >= box.max.z - 0.1 && targetZ - r < box.max.z) {
            targetZ = box.max.z + r;
            this.strafeDir *= -1;
          }
        }
      }
      this.position.z = targetZ;
    }

    // 3. Ground support
    let groundY = 0.0;
    const footMinX = this.position.x - r * 0.75;
    const footMaxX = this.position.x + r * 0.75;
    const footMinZ = this.position.z - r * 0.75;
    const footMaxZ = this.position.z + r * 0.75;

    for (let i = 0; i < this.map.colliders.length; i++) {
      const box = this.map.colliders[i];
      if (box.max.x > footMinX && box.min.x < footMaxX && box.max.z > footMinZ && box.min.z < footMaxZ) {
        if (box.max.y <= this.position.y + stepHeight + 0.1) {
          if (box.max.y > groundY) groundY = box.max.y;
        }
      }
    }

    this.position.y = groundY;

    // Arena bounds clamp
    this.position.x = Math.max(-25, Math.min(25, this.position.x));
    this.position.z = Math.max(-25, Math.min(25, this.position.z));
  }

  updateAABB() {
    this.boundingBox.min.set(this.position.x - this.radius, this.position.y, this.position.z - this.radius);
    this.boundingBox.max.set(this.position.x + this.radius, this.position.y + this.height, this.position.z + this.radius);
  }

  // =========================================================================
  // DAMAGE, DEATH & RESPAWN
  // =========================================================================
  takeDamage(amount, attackerPosition = null, isHeadshot = false) {
    if (this.isDead) return;

    // Armor absorbs damage first
    if (this.armor > 0) {
      if (this.armor >= amount) {
        this.armor -= amount;
        amount = 0;
      } else {
        amount -= this.armor;
        this.armor = 0;
      }
    }

    if (amount > 0) {
      this.health = Math.max(0, this.health - amount);
    }

    if (attackerPosition) {
      this.lastSeenPos = attackerPosition.clone();
      this.state = 'COMBAT';
      // Snap aim toward attacker
      const toAttacker = attackerPosition.clone().sub(this.position);
      toAttacker.y = 0;
      this.yaw = Math.atan2(-toAttacker.x, -toAttacker.z);
    }

    // Flinch effect
    this.root.position.y += 0.08;
    setTimeout(() => { if (!this.isDead) this.root.position.y = this.position.y; }, 60);

    if (this.health <= 0) {
      this.die(isHeadshot);
    }
  }

  die(isHeadshot = false) {
    this.isDead = true;
    this.velocity.set(0, 0, 0);

    // Tip over ragdoll effect
    this.root.rotation.z = Math.PI / 2;
    this.root.position.y = this.position.y + 0.3;

    if (this.onDeath) {
      this.onDeath(isHeadshot);
    }
  }

  respawn() {
    this.position.copy(this.map.botSpawn);
    this.velocity.set(0, 0, 0);
    this.health = 100;
    this.armor = 100;
    this.isDead = false;
    this.state = 'PATROL';
    this.lastSeenPos = null;
    this.investigatePos = null;
    this.hasLineOfSight = false;
    this.targetLean = 0.0;
    this.currentLean = 0.0;
    this.isCrouching = false;
    this.yaw = Math.PI;

    this.root.rotation.set(0, this.yaw, 0);
    this.root.position.copy(this.position);
    this.updateAABB();
  }
}
