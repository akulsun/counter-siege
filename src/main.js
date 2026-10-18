import * as THREE from 'three';
import { GameMap } from './map.js';
import { Player } from './player.js';
import { SoundSystem } from './audio.js';
import { WeaponSystem } from './weapons.js';
import { Bot } from './bot.js';
import { UIController } from './ui.js';
import { NetworkManager } from './network.js';
import { settingsManager } from './settings.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.initRenderer();
    this.initScene();

    // UI Controller
    this.ui = new UIController();

    // Audio & Systems
    this.sound = new SoundSystem();
    this.map = new GameMap(this.scene);
    this.player = new Player(this.camera, this.canvas, this.map);
    this.weapons = new WeaponSystem(this.camera, this.scene, this.player, this.sound, this.map);

    // 1v1 Bot AI (Active by default for solo practice)
    this.bot = new Bot(this.scene, this.map, this.player, this.sound);
    this.weapons.targets = [this.bot];

    // Serverless WebRTC Network Manager
    this.network = new NetworkManager(this);

    // Scores & Round State
    this.playerScore = 0;
    this.enemyScore = 0;
    this.matchTime = 105;
    this.isRunning = false;
    this.roundOver = false;
    this.myRematchConfirmed = false;
    this.peerRematchConfirmed = false;

    // Loadout State
    this.selectedPrimary = 'ak47';
    this.selectedSecondary = 'pistol';
    this.localLoadoutReady = false;
    this.peerLoadoutReady = false;

    // Real-Time FPS & Performance Monitor Tracking
    this.fpsFrames = 0;
    this.lastFpsUpdate = performance.now();
    this.currentFps = 60;
    this.currentFrameMs = 16.6;

    // Connect Callbacks & Events
    this.setupGameEvents();
    this.setupUIBindings();
    this.setupResizeListener();

    // Listen to tactical graphics / performance settings
    settingsManager.onChange((s) => this.applySettings(s));

    // Explicitly initialize UI and game state
    this.ui.showMainMenu(true);
    this.ui.showHUD(false);
    this.ui.showWeaponSelect(false);
    this.ui.showPauseMenu(false);
    this.ui.hideOptionsModal();
    this.ui.hideGameOver();
    this.weapons.viewmodelHolder.visible = false;
    this.player.canLock = false;

    // Render loop
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
  }

  applySettings(settings) {
    if (!this.renderer) return;

    const quality = settings.graphicsQuality || 'medium';
    let targetPixelRatio = 1.0;

    if (quality === 'low') {
      // Maximum framerate optimization: cap resolution at 1.0, disable heavy shadows
      targetPixelRatio = Math.min(window.devicePixelRatio, 1.0);
      this.renderer.shadowMap.enabled = false;
    } else if (quality === 'medium') {
      // Balanced: 1.0x native, fast PCF shadows
      targetPixelRatio = Math.min(window.devicePixelRatio, 1.0);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
    } else { // high
      // Quality: up to 1.5x pixel ratio, soft PCF shadows
      targetPixelRatio = Math.min(window.devicePixelRatio, 1.5);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.renderer.setPixelRatio(targetPixelRatio);

    if (this.map && this.map.applyGraphicsQuality) {
      this.map.applyGraphicsQuality(quality);
    }
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa7c2de);
    this.scene.fog = new THREE.FogExp2(0xd1c1a5, 0.012);

    this.camera = new THREE.PerspectiveCamera(
      78,
      window.innerWidth / window.innerHeight,
      0.05,
      500
    );
  }

  setupGameEvents() {
    // Player Footsteps
    this.player.onFootstep = () => {
      this.sound.playFootstep();
      if (this.bot && !this.bot.isDead) {
        this.bot.onPlayerFootstep(this.player.position, this.player.isCrouching);
      }
    };

    // Weapon Network Broadcasts & Bot Audio Alert
    this.weapons.onFire = (weaponId) => {
      if (this.network.isConnected) {
        this.network.sendPacket({ type: 'fire', weaponId });
      }
      if (this.bot && !this.bot.isDead) {
        this.bot.onPlayerGunfire(this.player.position);
      }
    };

    this.weapons.onTargetHit = (hitTarget, damage, isHeadshot) => {
      if (this.network.isConnected && hitTarget === this.network.remotePlayer) {
        this.network.sendPacket({ type: 'hit', damage, isHeadshot });
        if (hitTarget.isDead) {
          const isJumpShot = !this.player.isGrounded;
          const isScoped = Boolean(this.weapons.isScoped || (this.player && this.player.isScoped));
          const weaponId = this.weapons.currentWeapon.id;
          const isNoScope = (weaponId === 'awp' && !isScoped);
          this.network.sendPacket({
            type: 'p2p_elimination',
            shooterIsHost: this.network.isHost,
            weapon: weaponId,
            isHeadshot,
            isJumpShot,
            isNoScope
          });
          this.handleP2POutcome(true, isHeadshot, weaponId, { isJumpShot, isNoScope });
        }
      }
    };

    // Player Takes Damage
    const damageFlash = document.getElementById('damage-flash');
    this.player.onDamage = (health, armor, attackerPosition, info = {}) => {
      // Audio feedback: shield hit/break vs health flesh damage
      if (info.shieldBroken) {
        this.sound.playShieldBreak();
      } else if (info.shieldDamage > 0 && (!info.healthDamage || info.healthDamage === 0)) {
        this.sound.playShieldHit();
      }

      // Visual feedback: blue pulse for shield damage, red pulse for health damage
      if (info.healthDamage > 0) {
        damageFlash.style.background = 'radial-gradient(circle at center, transparent 40%, rgba(255, 40, 40, 0.65) 100%)';
      } else {
        damageFlash.style.background = 'radial-gradient(circle at center, transparent 45%, rgba(77, 179, 255, 0.55) 100%)';
      }

      damageFlash.style.opacity = '0.7';
      setTimeout(() => { damageFlash.style.opacity = '0'; }, 180);
      this.ui.updateVitals(health, armor);

      if ((health <= 0 || this.player.isDead) && !this.roundOver) {
        if (this.network.isConnected) {
          this.network.sendPacket({
            type: 'p2p_elimination',
            shooterIsHost: !this.network.isHost,
            weapon: 'ak47',
            isHeadshot: false
          });
          this.handleP2POutcome(false, false, 'ak47');
        } else {
          this.roundOver = true;
          this.weapons.resetAllAmmo();
          this.enemyScore++;
          this.ui.updateScores(this.playerScore, this.enemyScore);
          this.ui.addKillFeedEntry('CRIMSON BOT', 'ak47', 'PLAYER', {
            isHeadshot: false,
            isJumpShot: false,
            isLocalKiller: false,
            isLocalVictim: true
          });

          setTimeout(() => {
            this.ui.showGameOver(false, 'Round Lost', 'You were eliminated by the opponent.', false);
            if (document.exitPointerLock) document.exitPointerLock();
          }, 800);
        }
      }
    };

    // Bot Elimination Callback
    this.setupBotDeathCallback();
  }

  setupBotDeathCallback() {
    if (!this.bot) return;
    this.bot.onDeath = (isHeadshot) => {
      if (this.roundOver) return;
      this.roundOver = true;

      const isJumpShot = !this.player.isGrounded;
      const isScoped = Boolean(this.weapons.isScoped || (this.player && this.player.isScoped));
      const weaponId = this.weapons.currentWeapon.id;
      const isNoScope = (weaponId === 'awp' && !isScoped);

      this.weapons.resetAllAmmo();
      this.playerScore++;
      this.ui.updateScores(this.playerScore, this.enemyScore);

      this.ui.addKillFeedEntry('PLAYER', weaponId, 'CRIMSON BOT', {
        isHeadshot,
        isJumpShot,
        isNoScope,
        isLocalKiller: true,
        isLocalVictim: false
      });

      setTimeout(() => {
        const sub = isHeadshot ? 'Precision Headshot Elimination (+300 PTS)' : 'Opponent eliminated.';
        this.ui.showGameOver(true, 'Round Won', sub, false);
        if (document.exitPointerLock) document.exitPointerLock();
      }, 900);
    };
  }

  setupUIBindings() {
    const btnPlayBot = document.getElementById('btn-play-bot');
    const btnResume = document.getElementById('btn-resume');
    const btnRestart = document.getElementById('btn-restart');
    const btnLeaveMenu = document.getElementById('btn-leave-menu');
    const btnPlayAgain = document.getElementById('btn-play-again');
    const btnGameOverExit = document.getElementById('btn-gameover-exit');

    // Weapon Loadout Lock-in
    this.ui.onLoadoutLockIn((primary, secondary) => {
      this.handleLoadoutLockIn(primary, secondary);
    });

    // Start Practice Match
    btnPlayBot.addEventListener('click', () => {
      this.sound.ensureContext();

      // Crucial: Disconnect and clean up any active P2P session
      if (this.network) {
        this.network.disconnect();
      }

      this.playerScore = 0;
      this.enemyScore = 0;
      this.ui.updateScores(0, 0);

      this.ui.showMainMenu(false);
      this.ui.showHUD(true);
      this.ui.setModeTag('BOT DUEL');

      // Ensure Bot is enabled and in the scene
      if (!this.bot) {
        this.bot = new Bot(this.scene, this.map, this.player, this.sound);
        this.setupBotDeathCallback();
      } else {
        if (!this.scene.children.includes(this.bot.root)) {
          this.scene.add(this.bot.root);
        }
      }
      this.weapons.targets = [this.bot];

      this.openLoadoutSelect(false);
    });

    // Pause Menu Handlers
    document.addEventListener('pointerlockchange', () => {
      const isLocked = (document.pointerLockElement === this.canvas);
      if (!isLocked && this.isRunning && !this.roundOver) {
        if (!this.ui.isOptionsOpen()) {
          this.ui.showPauseMenu(true);
        }
        if (this.player) this.player.canLock = false;
      } else if (isLocked) {
        this.ui.showPauseMenu(false);
        this.ui.showMainMenu(false);
        this.ui.hideOptionsModal();
        if (this.player) this.player.canLock = true;
      }
    });

    // Escape Key handler to close Options Modal or resume paused match
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (this.ui.isOptionsOpen()) {
          e.preventDefault();
          this.ui.showOptionsModal(false);
          return;
        }

        if (this.isRunning && !this.roundOver && this.ui.isPauseMenuOpen()) {
          e.preventDefault();
          btnResume.click();
        }
      }
    });

    btnResume.addEventListener('click', () => {
      this.ui.showPauseMenu(false);
      this.ui.hideOptionsModal();
      if (this.player) this.player.canLock = true;
      try {
        const lock = this.canvas.requestPointerLock();
        if (lock && typeof lock.catch === 'function') lock.catch(() => {});
      } catch (_) {}
    });

    btnRestart.addEventListener('click', () => {
      this.ui.showPauseMenu(false);
      this.ui.hideOptionsModal();
      const isP2P = Boolean(this.network && this.network.isConnected);
      if (isP2P) {
        this.network.sendPacket({ type: 'reset_round' });
      }
      this.openLoadoutSelect(isP2P);
    });

    btnLeaveMenu.addEventListener('click', () => {
      this.ui.showPauseMenu(false);
      this.ui.hideOptionsModal();
      this.ui.showWeaponSelect(false);
      this.ui.showHUD(false);
      this.ui.showMainMenu(true);
      this.isRunning = false;
      this.roundOver = false;
      this.player.canLock = false;
      this.weapons.viewmodelHolder.visible = false;
      if (document.exitPointerLock) document.exitPointerLock();

      // Disconnect P2P session if active
      if (this.network) {
        this.network.disconnect();
      }
    });

    // Game Over Handlers
    btnPlayAgain.addEventListener('click', () => {
      if (this.network && this.network.isConnected) {
        this.handleP2PRematchClick();
      } else {
        this.ui.hideGameOver();
        this.ui.hideOptionsModal();
        this.openLoadoutSelect(false);
      }
    });

    btnGameOverExit.addEventListener('click', () => {
      // Disconnect P2P session if active
      if (this.network) {
        this.network.disconnect();
      }
      this.ui.hideGameOver();
      this.ui.hideOptionsModal();
      this.ui.showWeaponSelect(false);
      this.ui.showHUD(false);
      this.ui.showMainMenu(true);
      this.isRunning = false;
      this.roundOver = false;
      this.player.canLock = false;
      this.weapons.viewmodelHolder.visible = false;
      if (document.exitPointerLock) document.exitPointerLock();
    });

    // Test shortcut: press 'K' or click mode-tag to preview CS2 killfeed entries
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'k' || e.key === 'K' || e.code === 'KeyK') {
        this.triggerTestKillFeed();
      }
    });

    const modeTag = document.getElementById('mode-tag');
    if (modeTag) {
      modeTag.style.cursor = 'pointer';
      modeTag.title = 'Click to preview killfeed';
      modeTag.addEventListener('click', () => {
        this.triggerTestKillFeed();
      });
    }

    window.testKillFeed = () => this.triggerTestKillFeed();
  }

  triggerTestKillFeed() {
    if (!this.ui) return;
    this.ui.addKillFeedEntry('PLAYER', 'ak47', 'CRIMSON BOT', { isHeadshot: true, isJumpShot: false, isLocalKiller: true });
    setTimeout(() => {
      this.ui.addKillFeedEntry('PLAYER', 'awp', 'CRIMSON BOT', { isHeadshot: true, isJumpShot: true, isNoScope: true, isLocalKiller: true });
    }, 200);
    setTimeout(() => {
      this.ui.addKillFeedEntry('CRIMSON BOT', 'deagle', 'PLAYER', { isHeadshot: true, isJumpShot: false, isLocalVictim: true });
    }, 400);
    setTimeout(() => {
      this.ui.addKillFeedEntry('PLAYER', 'knife', 'CRIMSON BOT', { isHeadshot: false, isJumpShot: true, isLocalKiller: true });
    }, 600);
    setTimeout(() => {
      this.ui.addKillFeedEntry('PLAYER', 'shotgun', 'CRIMSON BOT', { isHeadshot: true, isJumpShot: false, isLocalKiller: true });
    }, 800);
  }

  handleP2POutcome(isWinner, isHeadshot = false, weaponName = 'ak47', extraOptions = {}) {
    if (this.roundOver) return;
    this.roundOver = true;
    this.weapons.resetAllAmmo();

    const myRole = this.network.isHost ? 'HOST' : 'CLIENT';
    const peerRole = this.network.isHost ? 'CLIENT' : 'HOST';
    const killer = isWinner ? myRole : peerRole;
    const victim = isWinner ? peerRole : myRole;

    if (isWinner) {
      this.playerScore++;
    } else {
      this.enemyScore++;
    }

    this.ui.updateScores(this.playerScore, this.enemyScore);
    this.ui.addKillFeedEntry(killer, weaponName, victim, {
      isHeadshot,
      isJumpShot: !!extraOptions.isJumpShot,
      isNoScope: !!extraOptions.isNoScope,
      isLocalKiller: isWinner,
      isLocalVictim: !isWinner
    });

    const title = isWinner ? 'Round Won' : 'Round Lost';
    const subtitle = isWinner
      ? (isHeadshot ? 'Precision Headshot Elimination (+300 PTS)' : 'Opponent eliminated.')
      : 'You were eliminated by the opponent.';

    setTimeout(() => {
      this.ui.showGameOver(isWinner, title, subtitle, true);
      if (document.exitPointerLock) document.exitPointerLock();
    }, 700);
  }

  handleP2PRematchClick() {
    if (this.myRematchConfirmed) return;
    this.myRematchConfirmed = true;

    this.network.sendPacket({ type: 'rematch_confirm' });

    if (this.peerRematchConfirmed) {
      this.ui.setPlayAgainButtonText('Confirm to start round (2/2)', true);
      setTimeout(() => {
        this.resetRematchState();
        this.ui.hideGameOver();
        this.openLoadoutSelect(true);
      }, 500);
    } else {
      this.ui.setPlayAgainButtonText('Confirm to start round (1/2)', true);
    }
  }

  handlePeerRematchConfirm() {
    this.peerRematchConfirmed = true;

    if (this.myRematchConfirmed) {
      this.ui.setPlayAgainButtonText('Confirm to start round (2/2)', true);
      setTimeout(() => {
        this.resetRematchState();
        this.ui.hideGameOver();
        this.openLoadoutSelect(true);
      }, 500);
    } else {
      this.ui.setPlayAgainButtonText('Confirm to start round (1/2)', false);
    }
  }

  handlePeerRematchExit() {
    this.peerRematchConfirmed = false;
    this.ui.showWeaponSelect(false);
    if (this.isRunning && !this.roundOver) {
      this.roundOver = true;
      this.weapons.resetAllAmmo();
      this.ui.showGameOver(true, 'Round Won', 'Opponent left the match.', true);
      if (document.exitPointerLock) document.exitPointerLock();
    }
    this.ui.setRematchBox(true, 'Opponent left the match.');
    this.ui.setPlayAgainButtonText('Opponent Left', true);
  }

  resetRematchState() {
    this.myRematchConfirmed = false;
    this.peerRematchConfirmed = false;
  }

  openLoadoutSelect(isP2P = false) {
    this.isRunning = false;
    this.roundOver = false;
    this.localLoadoutReady = false;
    this.peerLoadoutReady = false;
    this.player.canLock = false;
    this.weapons.viewmodelHolder.visible = false;

    if (document.exitPointerLock) {
      document.exitPointerLock();
    }

    this.ui.showMainMenu(false);
    this.ui.showPauseMenu(false);
    this.ui.hideOptionsModal();
    this.ui.showWeaponSelect(true, isP2P);
  }

  handleLoadoutLockIn(primaryId, secondaryId) {
    this.selectedPrimary = primaryId;
    this.selectedSecondary = secondaryId;
    this.weapons.setLoadout(primaryId, secondaryId);
    this.ui.updateRackLoadout(primaryId, secondaryId);

    const isP2P = Boolean(this.network && this.network.isConnected);
    if (!isP2P) {
      this.ui.showWeaponSelect(false);
      this.startRound();
    } else {
      this.localLoadoutReady = true;
      this.network.sendPacket({
        type: 'loadout_ready',
        primary: primaryId,
        secondary: secondaryId
      });

      if (this.peerLoadoutReady) {
        this.ui.setLoadoutStatus('BOTH PLAYERS READY (2/2) — DEPLOYING...', 'ready');
        this.ui.setLockInButtonState(true, 'Both Ready (2/2)');
        setTimeout(() => {
          this.ui.showWeaponSelect(false);
          this.startRound();
        }, 400);
      } else {
        this.ui.setLoadoutStatus('WAITING FOR OPPONENT... (1/2 READY)', 'waiting');
        this.ui.setLockInButtonState(true, 'Waiting for opponent (1/2)');
      }
    }
  }

  handlePeerLoadoutReady(data) {
    this.peerLoadoutReady = true;

    if (this.localLoadoutReady) {
      this.ui.setLoadoutStatus('BOTH PLAYERS READY (2/2) — DEPLOYING...', 'ready');
      this.ui.setLockInButtonState(true, 'Both Ready (2/2)');
      setTimeout(() => {
        this.ui.showWeaponSelect(false);
        this.startRound();
      }, 400);
    } else {
      this.ui.setLoadoutStatus('OPPONENT READY (1/2) — LOCK IN YOUR LOADOUT', 'waiting');
    }
  }

  startRound() {
    this.roundOver = false;
    this.isRunning = true;
    this.matchTime = 105;
    this.resetRematchState();

    this.ui.showMainMenu(false);
    this.ui.showPauseMenu(false);
    this.ui.hideOptionsModal();
    this.ui.showWeaponSelect(false);
    this.ui.hideGameOver();
    this.ui.showHUD(true);

    // Determine spawn positions and facing yaw
    const isP2P = Boolean(this.network && this.network.isConnected);
    const isHost = Boolean(this.network && this.network.isHost);

    let mySpawn = this.map.playerSpawn;
    let myYaw = 0;
    let remoteSpawn = this.map.botSpawn;
    let remoteYaw = Math.PI;

    if (isP2P) {
      if (isHost) {
        // Host: South spawn (0, 1.0, 18), faces North (yaw = 0)
        mySpawn = this.map.playerSpawn;
        myYaw = 0;
        // Remote Client: North spawn (0, 1.0, -18), faces South (yaw = Math.PI)
        remoteSpawn = this.map.botSpawn;
        remoteYaw = Math.PI;
      } else {
        // Client: North spawn (0, 1.0, -18), faces South (yaw = Math.PI)
        mySpawn = this.map.botSpawn;
        myYaw = Math.PI;
        // Remote Host: South spawn (0, 1.0, 18), faces North (yaw = 0)
        remoteSpawn = this.map.playerSpawn;
        remoteYaw = 0;
      }
    }

    this.player.respawn(mySpawn, myYaw);

    if (this.bot) {
      this.bot.respawn();
    }

    if (this.network && this.network.remotePlayer) {
      this.network.remotePlayer.respawn(remoteSpawn, remoteYaw);
    }

    this.weapons.resetAllAmmo();
    this.weapons.selectWeapon(0);
    this.weapons.viewmodelHolder.visible = true;
    this.player.canLock = true;
    this.ui.updateRackLoadout(this.selectedPrimary, this.selectedSecondary);

    this.ui.updateVitals(100, 100);
    this.weapons.updateHUD();
    try {
      const lock = this.canvas.requestPointerLock();
      if (lock && typeof lock.catch === 'function') lock.catch(() => {});
    } catch (_) {}
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      const settings = settingsManager.get();
      const quality = settings.graphicsQuality || 'medium';
      const maxDpr = quality === 'high' ? 1.5 : 1.0;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = this.clock.getDelta();

    // High-precision rolling FPS & latency monitor (updates 4 times a second)
    this.fpsFrames++;
    const now = performance.now();
    const elapsed = now - this.lastFpsUpdate;
    if (elapsed >= 250) {
      this.currentFps = (this.fpsFrames * 1000) / elapsed;
      this.currentFrameMs = elapsed / Math.max(1, this.fpsFrames);
      this.ui.updateFPS(this.currentFps, this.currentFrameMs);
      this.fpsFrames = 0;
      this.lastFpsUpdate = now;
    }

    if (this.isRunning) {
      this.player.update(dt);

      if (this.bot && !this.roundOver) {
        this.bot.update(dt);
      }

      this.network.update(dt);
      if (!this.player.isDead) {
        this.weapons.update(dt);
      }

      // Match timer countdown only while round is active
      if (!this.roundOver) {
        this.matchTime = Math.max(0, this.matchTime - dt);
        this.ui.updateTimer(this.matchTime);
        this.ui.updateVelocity(this.player.velocity);
        this.ui.updateTacticalStatus(this.player.isCrouching, this.player.targetLean);

        // Round timeout condition
        if (this.matchTime <= 0) {
          this.roundOver = true;
          this.weapons.resetAllAmmo();
          const isP2P = Boolean(this.network && this.network.isConnected);
          const drawTitle = isP2P ? 'MATCH DRAW' : 'ROUND DRAW';
          this.ui.showGameOver(false, drawTitle, 'Time expired without elimination.', isP2P);
          if (document.exitPointerLock) document.exitPointerLock();
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
