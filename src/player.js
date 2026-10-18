import * as THREE from 'three';
import { settingsManager } from './settings.js';

export class Player {
  constructor(camera, domElement, gameMap) {
    this.camera = camera;
    this.domElement = domElement;
    this.gameMap = gameMap;

    // Player State
    this.health = 100;
    this.armor = 100;
    this.isDead = false;

    // Movement Parameters (Counter-Strike feel)
    this.maxSpeed = 7.2;
    this.crouchSpeedMultiplier = 0.45;
    this.acceleration = 65.0;
    this.airAcceleration = 12.0;
    this.friction = 14.0;
    this.jumpForce = 6.4;
    this.gravity = 21.0;

    // Dimensions
    this.radius = 0.38;
    this.standHeight = 1.8;
    this.crouchHeight = 1.1;
    this.standEyeHeight = 1.62;
    this.crouchEyeHeight = 0.95;

    this.currentHeight = this.standHeight;
    this.currentEyeHeight = this.standEyeHeight;

    // Position & Physics Vectors
    this.currentSpawnPos = new THREE.Vector3().copy(this.gameMap.playerSpawn);
    this.currentSpawnYaw = 0;
    this.position = new THREE.Vector3().copy(this.currentSpawnPos);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isGrounded = false;
    this.isCrouching = false;

    // Rainbow Six Siege Tactical Leaning
    // Q = Left lean (-1), E = Right lean (+1), None = 0
    this.targetLean = 0;
    this.currentLean = 0; // Lerps between -1 and 1
    this.maxLeanOffset = 0.44; // Local X displacement
    this.maxLeanRoll = THREE.MathUtils.degToRad(12); // ~12 degrees roll

    // Base sensitivity & look settings
    this.baseSensitivity = 0.0022;
    this.sensitivityMultiplier = 1.0;
    this.mouseSensitivity = this.baseSensitivity * this.sensitivityMultiplier;
    this.aimSmoothing = 45; // 0 to 100%
    this.scopedSensitivityMultiplier = 0.80;
    this.invertY = false;
    this.isScoped = false;
    this.defaultFov = 78;
    this.cameraFov = 78;

    // Look rotation (Euler angles)
    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;

    // Listen to tactical settings changes
    settingsManager.onChange((s) => this.applySettings(s));

    // Hierarchical Camera Assembly
    // this.root -> this.eyeGroup -> this.leanGroup -> this.pitchGroup -> this.camera
    this.root = new THREE.Group();
    this.eyeGroup = new THREE.Group();
    this.leanGroup = new THREE.Group();
    this.pitchGroup = new THREE.Group();

    this.root.add(this.eyeGroup);
    this.eyeGroup.add(this.leanGroup);
    this.leanGroup.add(this.pitchGroup);
    this.pitchGroup.add(this.camera);

    this.gameMap.scene.add(this.root);
    this.root.position.copy(this.position);
    this.eyeGroup.position.y = this.currentEyeHeight;

    // Input States
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      crouch: false,
      leanLeft: false,
      leanRight: false
    };

    this.isPointerLocked = false;

    // Footstep distance accumulator
    this.stepDistance = 0;
    this.stepInterval = 1.9;
    this.onFootstep = null;
    this.onDamage = null;

    // Bounding Box Helper for AABB collisions
    this.boundingBox = new THREE.Box3();

    this.setupPointerLock();
    this.setupKeyboard();
  }

  setupPointerLock() {
    this.canLock = false;
    this.domElement.addEventListener('click', () => {
      if (!this.canLock) return;
      if (!this.isPointerLocked && !this.isDead) {
        try {
          const lock = this.domElement.requestPointerLock();
          if (lock && typeof lock.catch === 'function') lock.catch(() => {});
        } catch (_) {}
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === this.domElement);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked || this.isDead) return;

      const sens = this.getEffectiveSensitivity();
      const invertMult = this.invertY ? -1 : 1;

      // Accumulate into target look rotation
      this.targetYaw -= e.movementX * sens;
      this.targetPitch -= e.movementY * sens * invertMult;

      // Clamp vertical pitch to avoid gimbal flip (-89 to +89 degrees)
      const maxPitch = Math.PI / 2 - 0.01;
      this.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, this.targetPitch));

      // If aim smoothing is completely off (0%), update current yaw & pitch immediately
      if (this.aimSmoothing <= 0) {
        this.yaw = this.targetYaw;
        this.pitch = this.targetPitch;
      }
    });
  }

  getEffectiveSensitivity() {
    let sens = this.baseSensitivity * (this.sensitivityMultiplier || 1.0);
    if (this.isScoped) {
      // Scale down sensitivity proportionally to zoom ratio, adjusted by user's scoped multiplier
      const zoomRatio = Math.max(0.15, (this.cameraFov || 24) / (this.defaultFov || 78));
      sens *= zoomRatio * (this.scopedSensitivityMultiplier || 0.80);
    }
    return sens;
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.handleKey(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKey(e.code, false);
    });
  }

  handleKey(code, isPressed) {
    if (this.isDead) return;

    if (isPressed) {
      // Toggle Crouch (Ctrl or C)
      if (code === 'ControlLeft' || code === 'ControlRight' || code === 'KeyC') {
        this.isCrouching = !this.isCrouching;
        this.keys.crouch = this.isCrouching;
        return;
      }

      // Toggle Lean Left (Q)
      if (code === 'KeyQ') {
        this.targetLean = (this.targetLean === -1) ? 0 : -1;
        this.keys.leanLeft = (this.targetLean === -1);
        this.keys.leanRight = false;
        return;
      }

      // Toggle Lean Right (E)
      if (code === 'KeyE') {
        this.targetLean = (this.targetLean === 1) ? 0 : 1;
        this.keys.leanRight = (this.targetLean === 1);
        this.keys.leanLeft = false;
        return;
      }
    } else {
      // On keyup, ignore toggle keys so crouching and leaning remain active
      if (
        code === 'ControlLeft' ||
        code === 'ControlRight' ||
        code === 'KeyC' ||
        code === 'KeyQ' ||
        code === 'KeyE'
      ) {
        return;
      }
    }

    // Standard hold-to-act movement keys
    switch (code) {
      case 'KeyW': this.keys.forward = isPressed; break;
      case 'KeyS': this.keys.backward = isPressed; break;
      case 'KeyA': this.keys.left = isPressed; break;
      case 'KeyD': this.keys.right = isPressed; break;
      case 'Space': this.keys.jump = isPressed; break;
    }
  }

  update(dt) {
    if (this.isDead) {
      // Smooth death cam collapse towards the ground with tilt
      this.currentEyeHeight = THREE.MathUtils.lerp(this.currentEyeHeight, 0.35, 6 * dt);
      this.eyeGroup.position.y = this.currentEyeHeight;
      this.pitchGroup.rotation.z = THREE.MathUtils.lerp(this.pitchGroup.rotation.z, 0.38, 5 * dt);
      this.updateCameraTransform();
      return;
    }
    dt = Math.min(dt, 0.05); // Prevent tunneling on tab lag

    this.updateAim(dt);
    this.updateCrouch(dt);
    this.updateLean(dt);
    this.updateMovement(dt);
    this.updateCameraTransform();
  }

  updateAim(dt) {
    if (this.aimSmoothing <= 0) {
      this.yaw = this.targetYaw;
      this.pitch = this.targetPitch;
      return;
    }

    // Exponential decay interpolation (frame-rate independent):
    // 0% = raw instant input (handled above)
    // 1% to 100% maps to smoothing rates between 130 (very crisp) down to 22 (buttery smooth)
    const smoothingRate = THREE.MathUtils.lerp(130, 22, this.aimSmoothing / 100);
    const factor = 1.0 - Math.exp(-smoothingRate * dt);

    this.yaw = THREE.MathUtils.lerp(this.yaw, this.targetYaw, factor);
    this.pitch = THREE.MathUtils.lerp(this.pitch, this.targetPitch, factor);

    if (Math.abs(this.targetYaw - this.yaw) < 0.00001) this.yaw = this.targetYaw;
    if (Math.abs(this.targetPitch - this.pitch) < 0.00001) this.pitch = this.targetPitch;
  }

  updateCrouch(dt) {
    const targetHeight = this.isCrouching ? this.crouchHeight : this.standHeight;
    const targetEyeHeight = this.isCrouching ? this.crouchEyeHeight : this.standEyeHeight;

    // Smooth crouch lerp
    this.currentHeight = THREE.MathUtils.lerp(this.currentHeight, targetHeight, 14 * dt);
    this.currentEyeHeight = THREE.MathUtils.lerp(this.currentEyeHeight, targetEyeHeight, 14 * dt);
    this.eyeGroup.position.y = this.currentEyeHeight;
  }

  updateLean(dt) {
    // Rainbow Six Siege smooth lean interpolation
    this.currentLean = THREE.MathUtils.lerp(this.currentLean, this.targetLean, 12 * dt);

    // Apply local X offset and Z roll
    this.leanGroup.position.x = this.currentLean * this.maxLeanOffset;
    this.leanGroup.rotation.z = -this.currentLean * this.maxLeanRoll;
  }

  updateMovement(dt) {
    // 1. Calculate desired movement direction relative to camera yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const wishDir = new THREE.Vector3();
    if (this.keys.forward) wishDir.add(forward);
    if (this.keys.backward) wishDir.sub(forward);
    if (this.keys.right) wishDir.add(right);
    if (this.keys.left) wishDir.sub(right);

    const hasInput = wishDir.lengthSq() > 0.001;
    if (hasInput) wishDir.normalize();

    // Max speed modulation (crouch slows down)
    const currentMaxSpeed = this.isCrouching ? (this.maxSpeed * this.crouchSpeedMultiplier) : this.maxSpeed;

    // 2. Ground vs Air Physics
    if (this.isGrounded) {
      // Counter-Strike Counter-Strafing & Friction
      const horizVel = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
      const currentSpeed = horizVel.length();

      if (currentSpeed > 0.001) {
        // Friction deceleration
        const drop = currentSpeed * this.friction * dt;
        const newSpeed = Math.max(0, currentSpeed - drop);
        horizVel.multiplyScalar(newSpeed / currentSpeed);
        this.velocity.x = horizVel.x;
        this.velocity.z = horizVel.z;
      }

      // Snappy Ground Acceleration
      if (hasInput) {
        const currentProjection = horizVel.dot(wishDir);
        const addSpeed = currentMaxSpeed - currentProjection;

        if (addSpeed > 0) {
          const accelSpeed = Math.min(this.acceleration * dt * currentMaxSpeed, addSpeed);
          this.velocity.x += wishDir.x * accelSpeed;
          this.velocity.z += wishDir.z * accelSpeed;
        }
      }

      // Jump Impulse
      if (this.keys.jump) {
        this.velocity.y = this.jumpForce;
        this.isGrounded = false;
      }
    } else {
      // Counter-Strike Air Acceleration (enables strafe-jumping & bunnyhop direction control)
      if (hasInput) {
        const horizVel = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
        const currentProjection = horizVel.dot(wishDir);
        const addSpeed = currentMaxSpeed - currentProjection;

        if (addSpeed > 0) {
          const accelSpeed = Math.min(this.airAcceleration * dt * currentMaxSpeed, addSpeed);
          this.velocity.x += wishDir.x * accelSpeed;
          this.velocity.z += wishDir.z * accelSpeed;
        }
      }

      // Gravity
      this.velocity.y -= this.gravity * dt;
    }

    // 3. Collision Resolution via AABB Swept Tests
    this.resolveCollisions(dt);

    // 4. Footstep Audio Trigger
    if (this.isGrounded && hasInput) {
      const hSpeed = Math.hypot(this.velocity.x, this.velocity.z);
      this.stepDistance += hSpeed * dt;
      const threshold = this.isCrouching ? (this.stepInterval * 1.3) : this.stepInterval;
      if (this.stepDistance >= threshold) {
        this.stepDistance = 0;
        if (this.onFootstep) this.onFootstep();
      }
    }
  }

  resolveCollisions(dt) {
    const r = this.radius;
    const stepHeight = 0.4;
    const currentH = this.currentHeight;

    // 1. Horizontal X Movement & Collision
    const dx = this.velocity.x * dt;
    if (Math.abs(dx) > 0.00001) {
      let targetX = this.position.x + dx;
      const minZ = this.position.z - r * 0.85;
      const maxZ = this.position.z + r * 0.85;
      const feetY = this.position.y;
      const headY = feetY + currentH;

      for (let i = 0; i < this.gameMap.colliders.length; i++) {
        const box = this.gameMap.colliders[i];

        // Only block if vertically within player body (above step height)
        if (box.max.y <= feetY + stepHeight || box.min.y >= headY - 0.05) continue;
        // Check Z overlap
        if (box.max.z <= minZ || box.min.z >= maxZ) continue;

        if (dx > 0) {
          // Moving +X: colliding with box min.x
          if (this.position.x + r <= box.min.x + 0.1 && targetX + r > box.min.x) {
            targetX = box.min.x - r;
            this.velocity.x = 0;
          }
        } else if (dx < 0) {
          // Moving -X: colliding with box max.x
          if (this.position.x - r >= box.max.x - 0.1 && targetX - r < box.max.x) {
            targetX = box.max.x + r;
            this.velocity.x = 0;
          }
        }
      }
      this.position.x = targetX;
    }

    // 2. Horizontal Z Movement & Collision
    const dz = this.velocity.z * dt;
    if (Math.abs(dz) > 0.00001) {
      let targetZ = this.position.z + dz;
      const minX = this.position.x - r * 0.85;
      const maxX = this.position.x + r * 0.85;
      const feetY = this.position.y;
      const headY = feetY + currentH;

      for (let i = 0; i < this.gameMap.colliders.length; i++) {
        const box = this.gameMap.colliders[i];

        // Only block if vertically within player body (above step height)
        if (box.max.y <= feetY + stepHeight || box.min.y >= headY - 0.05) continue;
        // Check X overlap
        if (box.max.x <= minX || box.min.x >= maxX) continue;

        if (dz > 0) {
          // Moving +Z: colliding with box min.z
          if (this.position.z + r <= box.min.z + 0.1 && targetZ + r > box.min.z) {
            targetZ = box.min.z - r;
            this.velocity.z = 0;
          }
        } else if (dz < 0) {
          // Moving -Z: colliding with box max.z
          if (this.position.z - r >= box.max.z - 0.1 && targetZ - r < box.max.z) {
            targetZ = box.max.z + r;
            this.velocity.z = 0;
          }
        }
      }
      this.position.z = targetZ;
    }

    // 3. Vertical Y Ground & Platform Detection
    let groundY = 0.0;
    const footMinX = this.position.x - r * 0.75;
    const footMaxX = this.position.x + r * 0.75;
    const footMinZ = this.position.z - r * 0.75;
    const footMaxZ = this.position.z + r * 0.75;

    for (let i = 0; i < this.gameMap.colliders.length; i++) {
      const box = this.gameMap.colliders[i];
      if (box.max.x > footMinX && box.min.x < footMaxX && box.max.z > footMinZ && box.min.z < footMaxZ) {
        if (box.max.y <= this.position.y + stepHeight + 0.1) {
          if (box.max.y > groundY) {
            groundY = box.max.y;
          }
        }
      }
    }

    // Integrate vertical velocity
    this.position.y += this.velocity.y * dt;

    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      // Step snapping if walking on stairs/curbs
      if (this.isGrounded && (this.position.y - groundY) <= stepHeight) {
        this.position.y = groundY;
        this.velocity.y = 0;
      } else {
        this.isGrounded = false;
      }
    }

    // Ceiling check
    if (this.velocity.y > 0) {
      const headY = this.position.y + currentH;
      for (let i = 0; i < this.gameMap.colliders.length; i++) {
        const box = this.gameMap.colliders[i];
        if (box.max.x > footMinX && box.min.x < footMaxX && box.max.z > footMinZ && box.min.z < footMaxZ) {
          if (headY >= box.min.y && this.position.y < box.min.y) {
            this.position.y = box.min.y - currentH;
            this.velocity.y = 0;
            break;
          }
        }
      }
    }

    // Map boundary guard (-25.5 to +25.5)
    const arenaLimit = 25.5;
    this.position.x = Math.max(-arenaLimit, Math.min(arenaLimit, this.position.x));
    this.position.z = Math.max(-arenaLimit, Math.min(arenaLimit, this.position.z));

    if (this.position.y < -2) {
      this.respawn();
    }
  }

  updateAABB() {
    this.boundingBox.min.set(
      this.position.x - this.radius,
      this.position.y,
      this.position.z - this.radius
    );
    this.boundingBox.max.set(
      this.position.x + this.radius,
      this.position.y + this.currentHeight,
      this.position.z + this.radius
    );
  }

  updateCameraTransform() {
    this.root.position.copy(this.position);
    this.root.rotation.y = this.yaw;
    this.pitchGroup.rotation.x = this.pitch;
  }

  getShootOriginAndDirection() {
    const origin = new THREE.Vector3();
    this.camera.getWorldPosition(origin);
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return { origin, direction };
  }

  takeDamage(amount, attackerPosition = null) {
    if (this.isDead) return;

    let shieldDamage = 0;
    let healthDamage = 0;
    const hadShield = (this.armor > 0);

    // Shield absorbs incoming damage FIRST until depleted
    if (this.armor > 0) {
      if (this.armor >= amount) {
        shieldDamage = amount;
        this.armor -= amount;
        amount = 0;
      } else {
        shieldDamage = this.armor;
        amount -= this.armor;
        this.armor = 0;
      }
    }

    // Only leftover damage reduces Health
    if (amount > 0) {
      healthDamage = amount;
      this.health = Math.max(0, this.health - amount);
    }

    const shieldBroken = hadShield && (this.armor <= 0);

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }

    if (this.onDamage) {
      this.onDamage(this.health, this.armor, attackerPosition, { shieldDamage, healthDamage, shieldBroken });
    }
  }

  respawn(spawnPos = null, yaw = null) {
    if (spawnPos) {
      this.currentSpawnPos.copy(spawnPos);
    }
    if (yaw !== null && yaw !== undefined) {
      this.currentSpawnYaw = yaw;
    }

    this.position.copy(this.currentSpawnPos);
    this.velocity.set(0, 0, 0);
    this.health = 100;
    this.armor = 100;
    this.isDead = false;
    this.yaw = this.currentSpawnYaw;
    this.targetYaw = this.currentSpawnYaw;
    this.pitch = 0;
    this.targetPitch = 0;
    this.targetLean = 0;
    this.currentLean = 0;
    this.isCrouching = false;
    this.currentHeight = this.standHeight;
    this.currentEyeHeight = this.standEyeHeight;
    this.eyeGroup.position.y = this.standEyeHeight;
    this.pitchGroup.rotation.z = 0;
    this.leanGroup.rotation.z = 0;
    this.leanGroup.position.x = 0;
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.jump = false;
    this.keys.crouch = false;
    this.keys.leanLeft = false;
    this.keys.leanRight = false;
    this.updateCameraTransform();
  }

  setScoped(isScoped, cameraFov = 78) {
    this.isScoped = isScoped;
    this.cameraFov = cameraFov;
  }

  applySettings(settings) {
    if (!settings) return;
    if (typeof settings.sensitivity === 'number') {
      this.sensitivityMultiplier = settings.sensitivity;
      this.mouseSensitivity = this.baseSensitivity * this.sensitivityMultiplier;
    }
    if (typeof settings.aimSmoothing === 'number') {
      this.aimSmoothing = settings.aimSmoothing;
    }
    if (typeof settings.scopedSensitivity === 'number') {
      this.scopedSensitivityMultiplier = settings.scopedSensitivity;
    }
    if (typeof settings.invertY === 'boolean') {
      this.invertY = settings.invertY;
    }
  }
}
