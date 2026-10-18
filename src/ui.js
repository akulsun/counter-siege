import { settingsManager } from './settings.js';

/**
 * UI Controller & Counter-Strike HUD Bindings
 * Manages all HUD layers, Claude-inspired menus, kill feed ticker, vitals,
 * inventory rack highlights, and round victory/defeat screens.
 */

/**
 * Weapon Silhouettes Dictionary for CS2 Killfeed
 * Vector paths with clean proportions facing right towards victim.
 */
export const WEAPON_SILHOUETTES = {
  ak47: `<svg viewBox="0 0 76 22" fill="currentColor" class="kill-weapon-svg" aria-label="AK-47">
    <path d="M2 13 L12 10.5 L20 10.5 L21 12 L19 17.5 L16 17.5 L14 14 L5 15 Z"/>
    <path d="M20 10.5 L40 10.5 L40 14.5 L21 14.5 Z"/>
    <path d="M22 14.5 L20.5 20.5 L23.5 21 L25.5 14.5 Z"/>
    <path d="M26 15 C26 17 28.5 17 29 15 Z"/>
    <path d="M30 14.5 C31.5 17.5 34 20 37.5 21 L39.5 20 C36.5 17.5 34.5 15.5 34 14.5 Z"/>
    <path d="M40 9.8 L56 9.8 L56 13.8 L40 13.8 Z"/>
    <path d="M56 11.2 L71 11.2 L71 12.6 L56 12.6 Z"/>
    <path d="M68 7.5 L70 7.5 L70 11.2 L68 11.2 Z"/>
    <path d="M71 10.5 L73 10.5 L73 13 L71 13 Z"/>
  </svg>`,

  awp: `<svg viewBox="0 0 76 22" fill="currentColor" class="kill-weapon-svg" aria-label="AWP">
    <path d="M2 12.5 L6 10 L19 10 L22 12 L22 15 L17 17 L11 17 L8 14.5 L2 14 Z"/>
    <path d="M24 4.5 L45 4.5 L47 3.5 L48 3.5 L48 7 L47 7 L45 6 L24 6 L22 7 L21 7 L21 3.5 L22 3.5 Z"/>
    <rect x="27" y="6" width="3" height="4"/>
    <rect x="39" y="6" width="3" height="4"/>
    <path d="M22 10 L44 10 L44 14.5 L22 14.5 Z"/>
    <path d="M31 14.5 L31 18 L36 18 L36 14.5 Z"/>
    <path d="M44 10.5 L56 10.5 L56 14 L44 14 Z"/>
    <path d="M56 11.3 L70 11.3 L70 12.7 L56 12.7 Z"/>
    <path d="M70 9.8 L75 9.8 L75 14.2 L70 14.2 Z"/>
  </svg>`,

  shotgun: `<svg viewBox="0 0 76 22" fill="currentColor" class="kill-weapon-svg" aria-label="Shotgun">
    <path d="M2 13.5 L12 11 L22 11 L22 14.5 L18 18 L14 18 L11 15 L4 15.5 Z"/>
    <path d="M22 10 L38 10 L38 15 L22 15 Z"/>
    <path d="M23 15 C23 17.5 26.5 17.5 27 15 Z"/>
    <path d="M38 10.5 L72 10.5 L72 12.3 L38 12.3 Z"/>
    <path d="M38 12.5 L67 12.5 L67 14.2 L38 14.2 Z"/>
    <rect x="44" y="12.2" width="12" height="4" rx="1"/>
    <rect x="70" y="9.5" width="2" height="1.2"/>
  </svg>`,

  pistol: `<svg viewBox="0 0 54 22" fill="currentColor" class="kill-weapon-svg" aria-label="Pistol">
    <path d="M8 7 L46 7 L46 12 L8 12 Z"/>
    <rect x="9" y="5.2" width="2.5" height="2"/>
    <rect x="43" y="5.5" width="2" height="1.8"/>
    <path d="M8 12 L6 13.5 L11 20 L18 20.5 L20 12 Z"/>
    <path d="M20 12 L20 16.5 C20 17 24 17 25 14 L25 12 Z"/>
    <path d="M22 13 Q21 14.5 23 15" stroke="currentColor" stroke-width="1.2" fill="none"/>
  </svg>`,

  deagle: `<svg viewBox="0 0 60 22" fill="currentColor" class="kill-weapon-svg" aria-label="Desert Eagle">
    <path d="M8 6 L26 6 L28 7.5 L52 7.5 L52 13 L8 13 Z"/>
    <rect x="9" y="4" width="3" height="2.2"/>
    <rect x="49" y="5.5" width="2.5" height="2.2"/>
    <path d="M6 7.5 L8 7.5 L8 10 L5 10 Z"/>
    <path d="M8 13 L7 15 L11 21 L19 21.5 L21 13 Z"/>
    <path d="M21 13 L21 17 C21 18.2 27 18.2 28 14.5 L28 13 Z"/>
    <path d="M30 13 L52 13 L47 15 L30 15 Z"/>
  </svg>`,

  revolver: `<svg viewBox="0 0 60 22" fill="currentColor" class="kill-weapon-svg" aria-label="Revolver">
    <rect x="23" y="8" width="10" height="7.5" rx="1.5"/>
    <path d="M33 8 L54 8 L54 13.5 L33 13.5 Z"/>
    <rect x="51" y="6" width="2.5" height="2.2"/>
    <path d="M17 9 L23 9 L23 15 L18 15 Z"/>
    <path d="M15 7 L18 7 L18 9 L15 9 Z"/>
    <path d="M18 15 C16 16.5 13 18 13 21 C14 21.8 18 21.8 20 20 C21 18.5 21.5 16.5 21.5 15 Z"/>
    <path d="M23 15 C23 18.5 28.5 18.5 29 15 Z"/>
  </svg>`,

  knife: `<svg viewBox="0 0 60 20" fill="currentColor" class="kill-weapon-svg" aria-label="Tactical Knife">
    <path d="M4 10 C4 8.5 7 8 10 8 L24 8 L24 14 L10 14 C7 14 4 12.5 4 10 Z"/>
    <rect x="24" y="6" width="3" height="10" rx="0.5"/>
    <path d="M27 8.5 L46 8.5 C49 9.5 53 11 56 12 C51 13.5 45 14.5 38 14.5 L27 14 Z"/>
  </svg>`
};

/**
 * Returns the matching SVG silhouette string for a given weapon ID or name
 */
export function getWeaponSilhouette(weaponKey) {
  if (!weaponKey) return WEAPON_SILHOUETTES.ak47;
  const clean = String(weaponKey).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('awp') || clean.includes('sniper')) return WEAPON_SILHOUETTES.awp;
  if (clean.includes('ak') || clean.includes('rifle')) return WEAPON_SILHOUETTES.ak47;
  if (clean.includes('shotgun') || clean.includes('pump')) return WEAPON_SILHOUETTES.shotgun;
  if (clean.includes('deagle') || clean.includes('deserteagle') || clean.includes('eagle')) return WEAPON_SILHOUETTES.deagle;
  if (clean.includes('revolver')) return WEAPON_SILHOUETTES.revolver;
  if (clean.includes('knife') || clean.includes('melee') || clean.includes('blade')) return WEAPON_SILHOUETTES.knife;
  if (clean.includes('pistol')) return WEAPON_SILHOUETTES.pistol;
  if (WEAPON_SILHOUETTES[clean]) return WEAPON_SILHOUETTES[clean];
  return `<span class="kill-weapon-text">${weaponKey}</span>`;
}

export class UIController {
  constructor() {
    // Top Banner
    this.scorePlayerEl = document.getElementById('score-player');
    this.scoreEnemyEl = document.getElementById('score-enemy');
    this.timerEl = document.getElementById('match-timer');
    this.modeTagEl = document.getElementById('mode-tag');

    // Kill Feed
    this.killfeedEl = document.getElementById('killfeed');

    // Crosshair
    this.chTop = document.getElementById('ch-top');
    this.chBottom = document.getElementById('ch-bottom');
    this.chLeft = document.getElementById('ch-left');
    this.chRight = document.getElementById('ch-right');

    // Vitals
    this.healthEl = document.getElementById('hud-health');
    this.healthBarEl = document.getElementById('health-bar');
    this.armorEl = document.getElementById('hud-armor');
    this.armorBarEl = document.getElementById('armor-bar');

    // Velocity Status (Bottom Center)
    this.velocityEl = document.getElementById('hud-velocity');
    this.velocityWrapEl = document.getElementById('hud-velocity-wrap');
    this.stanceEl = document.getElementById('hud-stance');
    this.leanL = document.getElementById('lean-l');
    this.leanC = document.getElementById('lean-c');
    this.leanR = document.getElementById('lean-r');

    // Ammo
    this.ammoCurEl = document.getElementById('hud-ammo');
    this.ammoResEl = document.getElementById('hud-reserve');
    this.weaponNameEl = document.getElementById('hud-weapon');
    this.reloadTrack = document.getElementById('reload-track');
    this.reloadProgress = document.getElementById('reload-progress');

    // Menus & Modals
    this.hudLayer = document.getElementById('hud-layer');
    this.mainMenu = document.getElementById('main-menu');
    this.pauseMenu = document.getElementById('pause-menu');
    this.gameOverModal = document.getElementById('game-over-modal');
    this.gameOverTitle = document.getElementById('game-over-title');
    this.gameOverSub = document.getElementById('game-over-subtitle');
    this.rematchBox = document.getElementById('game-over-rematch-box');
    this.rematchText = document.getElementById('game-over-rematch-text');
    this.btnPlayAgain = document.getElementById('btn-play-again');

    // Weapon Select Modal
    this.weaponSelectModal = document.getElementById('weapon-select-modal');
    this.btnLockLoadout = document.getElementById('btn-lock-loadout');
    this.wsStatusText = document.getElementById('ws-status-text');
    this.wsStatusDot = document.getElementById('ws-status-dot');
    this.primaryCards = document.querySelectorAll('.ws-weapon-card[data-slot="primary"]');
    this.secondaryCards = document.querySelectorAll('.ws-weapon-card[data-slot="secondary"]');
    this.selectedPrimary = 'ak47';
    this.selectedSecondary = 'pistol';
    this.onLockInCallback = null;

    // Connection Panels
    this.hostPanel = document.getElementById('host-panel');
    this.joinPanel = document.getElementById('join-panel');

    // Options Modal & Tactical Settings Controls
    this.optionsModal = document.getElementById('options-modal');
    this.btnOptions = document.getElementById('btn-options');
    this.btnPauseOptions = document.getElementById('btn-pause-options');
    this.btnOptionsClose = document.getElementById('btn-options-close');
    this.btnOptionsReset = document.getElementById('btn-options-reset');

    this.sliderSensitivity = document.getElementById('slider-sensitivity');
    this.numSensitivity = document.getElementById('num-sensitivity');
    this.valSensitivity = document.getElementById('val-sensitivity');

    this.sliderSmoothing = document.getElementById('slider-smoothing');
    this.numSmoothing = document.getElementById('num-smoothing');
    this.valSmoothing = document.getElementById('val-smoothing');

    this.sliderScopedSens = document.getElementById('slider-scoped-sens');
    this.numScopedSens = document.getElementById('num-scoped-sens');
    this.valScopedSens = document.getElementById('val-scoped-sens');

    this.checkInvertY = document.getElementById('check-invert-y');
    this.optionsReturnTo = 'main';

    // FPS Counter & Performance Monitor Elements
    this.fpsCounterEl = document.getElementById('fps-counter');
    this.fpsValEl = document.getElementById('fps-val');
    this.fpsMsEl = document.getElementById('fps-ms');
    this.fpsDotEl = document.getElementById('fps-dot');

    // Graphics Quality Preset Buttons
    this.presetButtons = document.querySelectorAll('.btn-preset');
    this.valGraphics = document.getElementById('val-graphics');
    this.checkShowFps = document.getElementById('check-show-fps');

    // DOM Caching to eliminate layout thrashing
    this._lastTimerStr = '';
    this._lastSpeedStr = '';
    this._lastStance = '';
    this._lastLeanState = null;
    this._lastFps = -1;
    this._lastFpsState = '';

    // Scores
    this.playerScore = 0;
    this.enemyScore = 0;

    this.setupWeaponSelectListeners();
    this.setupOptionsListeners();
  }

  showHUD(visible) {
    if (this.hudLayer) this.hudLayer.style.display = visible ? 'block' : 'none';
    if (this.fpsCounterEl) {
      const showFps = settingsManager.get().showFps;
      this.fpsCounterEl.style.display = (visible && showFps) ? 'flex' : 'none';
    }
  }

  showMainMenu(visible) {
    if (this.mainMenu) this.mainMenu.style.display = visible ? 'flex' : 'none';
  }

  showPauseMenu(visible) {
    if (this.pauseMenu) this.pauseMenu.style.display = visible ? 'flex' : 'none';
  }

  showOptionsModal(visible, returnTo = 'main') {
    if (!this.optionsModal) return;

    if (visible) {
      this.optionsReturnTo = returnTo;
      if (returnTo === 'main') {
        this.showMainMenu(false);
      } else if (returnTo === 'pause') {
        this.showPauseMenu(false);
      }
      this.optionsModal.style.display = 'flex';
      this.syncOptionsUI(settingsManager.get());
    } else {
      const wasOpen = (this.optionsModal.style.display === 'flex');
      this.optionsModal.style.display = 'none';
      if (wasOpen) {
        if (this.optionsReturnTo === 'pause') {
          this.showPauseMenu(true);
        } else if (this.optionsReturnTo === 'main') {
          this.showMainMenu(true);
        }
      }
    }
  }

  hideOptionsModal() {
    if (this.optionsModal) {
      this.optionsModal.style.display = 'none';
    }
  }

  isOptionsOpen() {
    return Boolean(this.optionsModal && this.optionsModal.style.display === 'flex');
  }

  isPauseMenuOpen() {
    return Boolean(this.pauseMenu && this.pauseMenu.style.display === 'flex');
  }

  setupOptionsListeners() {
    if (!this.optionsModal) return;

    // Open from Main Menu
    if (this.btnOptions) {
      this.btnOptions.addEventListener('click', () => {
        this.showOptionsModal(true, 'main');
      });
    }

    // Open from Pause Menu
    if (this.btnPauseOptions) {
      this.btnPauseOptions.addEventListener('click', () => {
        this.showOptionsModal(true, 'pause');
      });
    }

    // Save & Close button
    if (this.btnOptionsClose) {
      this.btnOptionsClose.addEventListener('click', () => {
        this.showOptionsModal(false);
      });
    }

    // Reset Defaults button
    if (this.btnOptionsReset) {
      this.btnOptionsReset.addEventListener('click', () => {
        const defaults = settingsManager.reset();
        this.syncOptionsUI(defaults);
      });
    }

    // Mouse Sensitivity Sync
    if (this.sliderSensitivity && this.numSensitivity) {
      this.sliderSensitivity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.numSensitivity.value = val.toFixed(2);
        if (this.valSensitivity) this.valSensitivity.textContent = val.toFixed(2);
        settingsManager.set({ sensitivity: val });
      });

      this.numSensitivity.addEventListener('change', (e) => {
        const val = Math.max(0.1, Math.min(4.0, parseFloat(e.target.value) || 1.0));
        this.numSensitivity.value = val.toFixed(2);
        this.sliderSensitivity.value = val;
        if (this.valSensitivity) this.valSensitivity.textContent = val.toFixed(2);
        settingsManager.set({ sensitivity: val });
      });
    }

    // Aim Smoothing Sync
    if (this.sliderSmoothing && this.numSmoothing) {
      this.sliderSmoothing.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.numSmoothing.value = val;
        if (this.valSmoothing) this.valSmoothing.textContent = `${val}%`;
        settingsManager.set({ aimSmoothing: val });
      });

      this.numSmoothing.addEventListener('change', (e) => {
        const val = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
        this.numSmoothing.value = val;
        this.sliderSmoothing.value = val;
        if (this.valSmoothing) this.valSmoothing.textContent = `${val}%`;
        settingsManager.set({ aimSmoothing: val });
      });
    }

    // Scoped Sensitivity Sync
    if (this.sliderScopedSens && this.numScopedSens) {
      this.sliderScopedSens.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.numScopedSens.value = val.toFixed(2);
        if (this.valScopedSens) this.valScopedSens.textContent = val.toFixed(2);
        settingsManager.set({ scopedSensitivity: val });
      });

      this.numScopedSens.addEventListener('change', (e) => {
        const val = Math.max(0.2, Math.min(2.0, parseFloat(e.target.value) || 0.8));
        this.numScopedSens.value = val.toFixed(2);
        this.sliderScopedSens.value = val;
        if (this.valScopedSens) this.valScopedSens.textContent = val.toFixed(2);
        settingsManager.set({ scopedSensitivity: val });
      });
    }

    // Invert Y-Axis Sync
    if (this.checkInvertY) {
      this.checkInvertY.addEventListener('change', (e) => {
        settingsManager.set({ invertY: e.target.checked });
      });
    }

    // Graphics Quality Presets Sync
    if (this.presetButtons) {
      this.presetButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const quality = btn.getAttribute('data-quality');
          settingsManager.set({ graphicsQuality: quality });
        });
      });
    }

    // Top-Right FPS Counter Toggle Sync
    if (this.checkShowFps) {
      this.checkShowFps.addEventListener('change', (e) => {
        settingsManager.set({ showFps: e.target.checked });
      });
    }

    // Synchronize UI whenever settings change
    settingsManager.onChange((settings) => {
      this.syncOptionsUI(settings);
    });
  }

  syncOptionsUI(settings) {
    if (!settings) return;

    if (this.sliderSensitivity && this.numSensitivity) {
      const sens = Number(settings.sensitivity) || 1.0;
      this.sliderSensitivity.value = sens;
      this.numSensitivity.value = sens.toFixed(2);
      if (this.valSensitivity) this.valSensitivity.textContent = sens.toFixed(2);
    }

    if (this.sliderSmoothing && this.numSmoothing) {
      const smooth = Number(settings.aimSmoothing) || 0;
      this.sliderSmoothing.value = smooth;
      this.numSmoothing.value = smooth;
      if (this.valSmoothing) this.valSmoothing.textContent = `${smooth}%`;
    }

    if (this.sliderScopedSens && this.numScopedSens) {
      const scoped = Number(settings.scopedSensitivity) || 0.8;
      this.sliderScopedSens.value = scoped;
      this.numScopedSens.value = scoped.toFixed(2);
      if (this.valScopedSens) this.valScopedSens.textContent = scoped.toFixed(2);
    }

    if (this.checkInvertY) {
      this.checkInvertY.checked = Boolean(settings.invertY);
    }

    // Graphics Preset Buttons Sync
    if (this.presetButtons && this.presetButtons.length > 0) {
      const curQuality = settings.graphicsQuality || 'medium';
      this.presetButtons.forEach((btn) => {
        const q = btn.getAttribute('data-quality');
        btn.classList.toggle('active', q === curQuality);
      });
      if (this.valGraphics) {
        const labels = { low: 'Low (Max FPS)', medium: 'Medium', high: 'High' };
        this.valGraphics.textContent = labels[curQuality] || 'Medium';
      }
    }

    // FPS Counter Toggle & Visibility
    if (this.checkShowFps) {
      this.checkShowFps.checked = Boolean(settings.showFps);
    }

    if (this.fpsCounterEl) {
      const isHUDVisible = (this.hudLayer && this.hudLayer.style.display !== 'none');
      this.fpsCounterEl.style.display = (isHUDVisible && settings.showFps) ? 'flex' : 'none';
    }
  }

  updateFPS(fps, ms) {
    if (!this.fpsCounterEl) return;
    const roundedFps = Math.round(fps);
    if (roundedFps !== this._lastFps) {
      this._lastFps = roundedFps;
      if (this.fpsValEl) this.fpsValEl.textContent = roundedFps;

      const state = roundedFps >= 55 ? 'fps-good' : (roundedFps >= 30 ? 'fps-warn' : 'fps-bad');
      if (state !== this._lastFpsState) {
        this._lastFpsState = state;
        this.fpsCounterEl.classList.remove('fps-good', 'fps-warn', 'fps-bad');
        this.fpsCounterEl.classList.add(state);
      }
    }

    if (this.fpsMsEl) {
      this.fpsMsEl.textContent = `${ms.toFixed(1)} ms`;
    }
  }

  setModeTag(tag) {
    if (this.modeTagEl) this.modeTagEl.textContent = tag;
  }

  updateScores(playerScore, enemyScore) {
    this.playerScore = playerScore;
    this.enemyScore = enemyScore;
    if (this.scorePlayerEl) this.scorePlayerEl.textContent = playerScore;
    if (this.scoreEnemyEl) this.scoreEnemyEl.textContent = enemyScore;
  }

  updateTimer(seconds) {
    if (!this.timerEl) return;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const timerStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    if (timerStr !== this._lastTimerStr) {
      this._lastTimerStr = timerStr;
      this.timerEl.textContent = timerStr;
    }
  }

  updateVitals(health, armor) {
    const h = Math.max(0, Math.round(health));
    const a = Math.max(0, Math.round(armor));

    if (this.healthEl) this.healthEl.textContent = h;
    if (this.healthBarEl) {
      this.healthBarEl.style.width = `${h}%`;
      this.healthBarEl.style.background = h < 30 ? 'var(--hud-red)' : 'var(--hud-green)';
    }

    if (this.armorEl) this.armorEl.textContent = a;
    if (this.armorBarEl) this.armorBarEl.style.width = `${a}%`;
  }

  updateVelocity(velocity) {
    if (!this.velocityEl) return;
    const speed = Math.hypot(velocity.x, velocity.z);
    const displaySpeed = speed < 0.05 ? 0 : speed;
    const speedStr = displaySpeed.toFixed(1);
    if (speedStr !== this._lastSpeedStr) {
      this._lastSpeedStr = speedStr;
      this.velocityEl.textContent = speedStr;
      this.velocityEl.classList.toggle('accurate', displaySpeed <= 0.5);
    }
  }

  updateTacticalStatus(isCrouching, targetLean) {
    const stance = isCrouching ? 'CROUCH' : 'STAND';
    if (this.stanceEl && stance !== this._lastStance) {
      this._lastStance = stance;
      this.stanceEl.textContent = stance;
    }

    const leanState = targetLean < -0.3 ? -1 : (targetLean > 0.3 ? 1 : 0);
    if (leanState !== this._lastLeanState) {
      this._lastLeanState = leanState;
      if (this.leanL) this.leanL.classList.toggle('active', leanState === -1);
      if (this.leanR) this.leanR.classList.toggle('active', leanState === 1);
      if (this.leanC) this.leanC.classList.toggle('active', leanState === 0);
    }
  }

  updateAmmo(current, reserve, name) {
    if (this.ammoCurEl) this.ammoCurEl.textContent = current;
    if (this.ammoResEl) this.ammoResEl.textContent = reserve;
    if (this.weaponNameEl) this.weaponNameEl.textContent = name;
  }

  updateActiveSlot(slotIndex) {
    const rackSlots = document.querySelectorAll('.rack-slot');
    rackSlots.forEach((slot) => {
      const id = parseInt(slot.getAttribute('data-slot'), 10);
      slot.classList.toggle('active', id === slotIndex);
    });
  }

  setReloading(inProgress, progressRatio = 0) {
    if (!this.reloadTrack) return;
    if (inProgress) {
      this.reloadTrack.classList.add('reloading');
      if (this.reloadProgress) {
        this.reloadProgress.style.width = `${Math.min(100, progressRatio * 100)}%`;
      }
    } else {
      this.reloadTrack.classList.remove('reloading');
      if (this.reloadProgress) {
        this.reloadProgress.style.width = '0%';
      }
    }
  }

  updateCrosshairSpread(baseSpreadPx) {
    if (!this.chTop) return;
    this.chTop.style.transform = `translateY(-${baseSpreadPx}px)`;
    this.chBottom.style.transform = `translateY(${baseSpreadPx}px)`;
    this.chLeft.style.transform = `translateX(-${baseSpreadPx}px)`;
    this.chRight.style.transform = `translateX(${baseSpreadPx}px)`;
  }

  /**
   * Resolves consistent team/participant identity color class
   */
  getParticipantColorClass(name, isLocal) {
    if (isLocal) return 'kill-name-player';
    const upper = String(name || '').toUpperCase();
    if (upper === 'PLAYER' || upper === 'YOU' || upper === 'HOST') return 'kill-name-player';
    if (upper.includes('BOT') || upper.includes('CRIMSON') || upper.includes('ENEMY') || upper === 'CLIENT') return 'kill-name-enemy';
    return 'kill-name-neutral';
  }

  /**
   * Adds dynamic Counter-Strike 2 style kill feed announcement with vector silhouettes & badges
   */
  addKillFeedEntry(killer, weapon, victim, isHeadshotOrOptions = false, extraOptions = {}) {
    if (!this.killfeedEl) return;

    let isHeadshot = false;
    let isJumpShot = false;
    let isNoScope = false;
    let isLocalKiller = false;
    let isLocalVictim = false;

    if (typeof isHeadshotOrOptions === 'boolean') {
      isHeadshot = isHeadshotOrOptions;
      isJumpShot = !!extraOptions.isJumpShot;
      isNoScope = !!extraOptions.isNoScope;
      isLocalKiller = extraOptions.isLocalKiller !== undefined
        ? !!extraOptions.isLocalKiller
        : (killer === 'PLAYER' || killer === 'HOST');
      isLocalVictim = extraOptions.isLocalVictim !== undefined
        ? !!extraOptions.isLocalVictim
        : (victim === 'PLAYER' || victim === 'HOST');
    } else if (typeof isHeadshotOrOptions === 'object' && isHeadshotOrOptions !== null) {
      isHeadshot = !!isHeadshotOrOptions.isHeadshot;
      isJumpShot = !!isHeadshotOrOptions.isJumpShot;
      isNoScope = !!isHeadshotOrOptions.isNoScope;
      isLocalKiller = isHeadshotOrOptions.isLocalKiller !== undefined
        ? !!isHeadshotOrOptions.isLocalKiller
        : (killer === 'PLAYER' || killer === 'HOST');
      isLocalVictim = isHeadshotOrOptions.isLocalVictim !== undefined
        ? !!isHeadshotOrOptions.isLocalVictim
        : (victim === 'PLAYER' || victim === 'HOST');
    }

    const entry = document.createElement('div');
    entry.className = `kill-msg${isLocalKiller ? ' local-killer' : ''}${isLocalVictim ? ' local-victim' : ''}`;

    const weaponSvg = getWeaponSilhouette(weapon);

    // Consistent participant colors based on player vs enemy identity
    const killerColorClass = this.getParticipantColorClass(killer, isLocalKiller);
    const victimColorClass = this.getParticipantColorClass(victim, isLocalVictim);

    // CS2 Jump Shot (Airborne) badge: airborne player figure leaping with motion lines
    const jumpShotIcon = isJumpShot
      ? `<span class="kill-badge kill-jumpshot" title="Airborne Jump Shot">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="13" cy="3.5" r="2"/>
            <path d="M11 6 C9.5 6 8.5 7 8 8.5 L9.8 9.2 C10.1 8.3 10.6 7.8 11.5 7.8 C12.2 7.8 12.8 8.2 13.2 8.8 L14.5 11 L12 13 L12.5 16 L14.2 15.2 L13.8 13.8 L16.5 11.5 C17.2 10.8 17.2 9.7 16.5 9 L15 7.5 C14 6.5 12.5 6 11 6 Z"/>
            <path d="M7.5 10 L5 11.5 L5.8 13 L8 11.8 Z"/>
            <path d="M3 15 C5 16 7.5 16 10 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
            <path d="M4.5 18 C6.5 18.8 8.5 18.8 11 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
          </svg>
        </span>`
      : '';

    // CS2 No-Scope badge: scoped rifle crosshair with strike-through
    const noScopeIcon = isNoScope
      ? `<span class="kill-badge kill-noscope" title="No-Scope Kill">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="10" cy="10" r="7" stroke="#e2e8f0"/>
            <line x1="10" y1="3" x2="10" y2="7" stroke="#e2e8f0" stroke-linecap="round"/>
            <line x1="10" y1="13" x2="10" y2="17" stroke="#e2e8f0" stroke-linecap="round"/>
            <line x1="3" y1="10" x2="7" y2="10" stroke="#e2e8f0" stroke-linecap="round"/>
            <line x1="13" y1="10" x2="17" y2="10" stroke="#e2e8f0" stroke-linecap="round"/>
            <line x1="4" y1="4" x2="16" y2="16" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </span>`
      : '';

    // CS2 Headshot badge: target bullseye crosshair with central point
    const hsIcon = isHeadshot
      ? `<span class="kill-badge kill-headshot" title="Headshot">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="7.5"/>
            <line x1="10" y1="1" x2="10" y2="4.5"/>
            <line x1="10" y1="15.5" x2="10" y2="19"/>
            <line x1="1" y1="10" x2="4.5" y2="10"/>
            <line x1="15.5" y1="10" x2="19" y2="10"/>
            <circle cx="10" cy="10" r="2.5" fill="#ef4444"/>
          </svg>
        </span>`
      : '';

    entry.innerHTML = `
      <span class="kill-killer ${killerColorClass}">${killer}</span>
      ${jumpShotIcon}
      ${noScopeIcon}
      <span class="kill-weapon-container">${weaponSvg}</span>
      ${hsIcon}
      <span class="kill-victim ${victimColorClass}">${victim}</span>
    `;

    this.killfeedEl.appendChild(entry);

    // Limit maximum stacked entries
    while (this.killfeedEl.children.length > 5) {
      this.killfeedEl.removeChild(this.killfeedEl.firstChild);
    }

    // Auto-remove after 4.2 seconds
    setTimeout(() => {
      entry.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
      entry.style.opacity = '0';
      entry.style.transform = 'translateX(24px)';
      setTimeout(() => {
        if (entry.parentNode) entry.parentNode.removeChild(entry);
      }, 350);
    }, 4200);
  }

  showGameOver(isWin, title, subtitle, isP2P = false) {
    if (!this.gameOverModal) return;
    this.gameOverModal.style.display = 'flex';

    const card = this.gameOverModal.querySelector('.game-over-card');
    if (card) {
      card.style.borderColor = isWin ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.45)';
      card.style.boxShadow = isWin
        ? '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.2)'
        : '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(244, 63, 94, 0.25)';
    }

    if (this.gameOverTitle) {
      this.gameOverTitle.textContent = title;
      this.gameOverTitle.className = `game-over-title ${isWin ? 'win' : 'loss'}`;
    }

    if (this.gameOverSub) {
      this.gameOverSub.textContent = subtitle;
    }

    if (isP2P) {
      this.setRematchBox(false);
      this.setPlayAgainButtonText('Confirm to start round (0/2)', false);
    } else {
      this.setRematchBox(false);
      this.setPlayAgainButtonText('Play Next Round', false);
    }
  }

  setRematchBox(visible, text = '') {
    if (!this.rematchBox) return;
    this.rematchBox.style.display = visible ? 'block' : 'none';
    if (this.rematchText && text) {
      this.rematchText.textContent = text;
    }
  }

  setPlayAgainButtonText(text, disabled = false) {
    if (!this.btnPlayAgain) return;
    this.btnPlayAgain.textContent = text;
    this.btnPlayAgain.disabled = disabled;
    this.btnPlayAgain.style.opacity = disabled ? '0.6' : '1';
    this.btnPlayAgain.style.cursor = disabled ? 'not-allowed' : 'pointer';
  }

  hideGameOver() {
    if (this.gameOverModal) {
      this.gameOverModal.style.display = 'none';
    }
  }

  // =========================================================================
  // PRE-ROUND WEAPON SELECTION & RACK SYNC
  // =========================================================================
  setupWeaponSelectListeners() {
    // Primary Weapon Card Click
    if (this.primaryCards) {
      this.primaryCards.forEach((card) => {
        card.addEventListener('click', () => {
          if (this.btnLockLoadout && this.btnLockLoadout.disabled) return;
          this.primaryCards.forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          this.selectedPrimary = card.getAttribute('data-weapon-id') || 'ak47';
        });
      });
    }

    // Secondary Weapon Card Click
    if (this.secondaryCards) {
      this.secondaryCards.forEach((card) => {
        card.addEventListener('click', () => {
          if (this.btnLockLoadout && this.btnLockLoadout.disabled) return;
          this.secondaryCards.forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          this.selectedSecondary = card.getAttribute('data-weapon-id') || 'pistol';
        });
      });
    }

    // Lock In & Deploy Button Click
    if (this.btnLockLoadout) {
      this.btnLockLoadout.addEventListener('click', () => {
        if (this.onLockInCallback) {
          this.onLockInCallback(this.selectedPrimary, this.selectedSecondary);
        }
      });
    }
  }

  showWeaponSelect(visible, isP2P = false) {
    if (!this.weaponSelectModal) return;
    this.weaponSelectModal.style.display = visible ? 'flex' : 'none';

    if (visible) {
      this.setLockInButtonState(false, 'DEPLOY');
      if (isP2P) {
        this.setLoadoutStatus('SELECT LOADOUT', 'normal');
      } else {
        this.setLoadoutStatus('READY', 'normal');
      }
    }
  }

  setLoadoutStatus(text, mode = 'normal') {
    if (this.wsStatusText) {
      this.wsStatusText.textContent = text;
    }
    if (this.wsStatusDot) {
      if (mode === 'ready') {
        this.wsStatusDot.style.background = 'var(--hud-green)';
        this.wsStatusDot.style.boxShadow = '0 0 8px var(--hud-green)';
      } else if (mode === 'waiting') {
        this.wsStatusDot.style.background = 'var(--accent-orange)';
        this.wsStatusDot.style.boxShadow = '0 0 8px var(--accent-orange)';
      } else {
        this.wsStatusDot.style.background = 'var(--accent-sand)';
        this.wsStatusDot.style.boxShadow = '0 0 6px var(--accent-sand)';
      }
    }
  }

  setLockInButtonState(disabled, text = 'DEPLOY') {
    if (!this.btnLockLoadout) return;
    this.btnLockLoadout.disabled = disabled;
    this.btnLockLoadout.textContent = text;
    this.btnLockLoadout.style.opacity = disabled ? '0.6' : '1';
    this.btnLockLoadout.style.cursor = disabled ? 'not-allowed' : 'pointer';
  }

  onLoadoutLockIn(callback) {
    this.onLockInCallback = callback;
  }

  updateRackLoadout(primaryId, secondaryId) {
    // Sync Primary Slot in HUD Rack
    const primaryCard = document.querySelector(`.ws-weapon-card[data-weapon-id="${primaryId}"]`);
    const rackIcon0 = document.getElementById('rack-icon-0');
    const rackName0 = document.getElementById('rack-name-0');
    if (primaryCard && rackIcon0 && rackName0) {
      const iconWrap = primaryCard.querySelector('.ws-icon-wrap');
      const nameEl = primaryCard.querySelector('.ws-weapon-name');
      if (iconWrap) rackIcon0.innerHTML = iconWrap.innerHTML;
      if (nameEl) rackName0.textContent = nameEl.textContent;
    }

    // Sync Secondary Slot in HUD Rack
    const secondaryCard = document.querySelector(`.ws-weapon-card[data-weapon-id="${secondaryId}"]`);
    const rackIcon1 = document.getElementById('rack-icon-1');
    const rackName1 = document.getElementById('rack-name-1');
    if (secondaryCard && rackIcon1 && rackName1) {
      const iconWrap = secondaryCard.querySelector('.ws-icon-wrap');
      const nameEl = secondaryCard.querySelector('.ws-weapon-name');
      if (iconWrap) rackIcon1.innerHTML = iconWrap.innerHTML;
      if (nameEl) rackName1.textContent = nameEl.textContent;
    }
  }
}
