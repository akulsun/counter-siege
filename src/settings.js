/**
 * Tactical FPS Settings Manager
 * Manages mouse sensitivity, aim smoothing, scoped zoom ratio, and axis preferences.
 * Persists user configuration to localStorage.
 */

const SETTINGS_KEY = 'counter_siege_settings_v1';

export const DEFAULT_SETTINGS = {
  sensitivity: 1.0,         // General mouse sensitivity multiplier (1.0 = standard 0.0022 rad/px)
  aimSmoothing: 45,         // Aim smoothing percentage (0 = raw instant input, 100 = max smooth damping)
  scopedSensitivity: 0.80,  // Scoped / ADS sensitivity multiplier for AWP sniper rifle
  invertY: false,           // Invert vertical look pitch
  graphicsQuality: 'medium',// 'low' | 'medium' | 'high'
  showFps: true             // Show FPS counter on top right
};

export class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.listeners = [];
    this.load();
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const validQualities = ['low', 'medium', 'high'];
          const quality = validQualities.includes(parsed.graphicsQuality) ? parsed.graphicsQuality : DEFAULT_SETTINGS.graphicsQuality;
          this.settings = {
            sensitivity: this.clamp(typeof parsed.sensitivity === 'number' ? parsed.sensitivity : DEFAULT_SETTINGS.sensitivity, 0.1, 4.0),
            aimSmoothing: this.clamp(typeof parsed.aimSmoothing === 'number' ? parsed.aimSmoothing : DEFAULT_SETTINGS.aimSmoothing, 0, 100),
            scopedSensitivity: this.clamp(typeof parsed.scopedSensitivity === 'number' ? parsed.scopedSensitivity : DEFAULT_SETTINGS.scopedSensitivity, 0.2, 2.0),
            invertY: Boolean(parsed.invertY),
            graphicsQuality: quality,
            showFps: parsed.showFps !== undefined ? Boolean(parsed.showFps) : DEFAULT_SETTINGS.showFps
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load tactical settings from localStorage:', e);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      }
    } catch (e) {
      console.warn('Failed to save tactical settings to localStorage:', e);
    }
    this.notify();
  }

  get() {
    return { ...this.settings };
  }

  set(partialSettings) {
    let changed = false;

    if (partialSettings.sensitivity !== undefined) {
      const val = this.clamp(Number(partialSettings.sensitivity) || DEFAULT_SETTINGS.sensitivity, 0.1, 4.0);
      this.settings.sensitivity = Math.round(val * 100) / 100;
      changed = true;
    }

    if (partialSettings.aimSmoothing !== undefined) {
      const val = this.clamp(Math.round(Number(partialSettings.aimSmoothing) || 0), 0, 100);
      this.settings.aimSmoothing = val;
      changed = true;
    }

    if (partialSettings.scopedSensitivity !== undefined) {
      const val = this.clamp(Number(partialSettings.scopedSensitivity) || DEFAULT_SETTINGS.scopedSensitivity, 0.2, 2.0);
      this.settings.scopedSensitivity = Math.round(val * 100) / 100;
      changed = true;
    }

    if (partialSettings.invertY !== undefined) {
      this.settings.invertY = Boolean(partialSettings.invertY);
      changed = true;
    }

    if (partialSettings.graphicsQuality !== undefined) {
      const valid = ['low', 'medium', 'high'];
      if (valid.includes(partialSettings.graphicsQuality)) {
        this.settings.graphicsQuality = partialSettings.graphicsQuality;
        changed = true;
      }
    }

    if (partialSettings.showFps !== undefined) {
      this.settings.showFps = Boolean(partialSettings.showFps);
      changed = true;
    }

    if (changed) {
      this.save();
    }
  }

  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
    return this.get();
  }

  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      // Immediately notify current settings
      callback(this.get());
    }
  }

  notify() {
    const current = this.get();
    for (const listener of this.listeners) {
      try {
        listener(current);
      } catch (err) {
        console.error('Error in settings listener:', err);
      }
    }
  }

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
}

// Global Singleton for easy cross-module sharing
export const settingsManager = new SettingsManager();
