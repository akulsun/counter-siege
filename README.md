# 🎯 Counter Siege • Tactical 1v1 FPS

[![Deploy to GitHub Pages](https://github.com/akulsun/counter-siege/actions/workflows/deploy.yml/badge.svg)](https://github.com/akulsun/counter-siege/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Three.js](https://img.shields.io/badge/3D-Three.js-black?logo=three.js)](https://threejs.org/)
[![Bundled with Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite)](https://vitejs.dev/)

> A high-performance, tactical 1v1 First-Person Shooter engineered completely for modern web browsers. Featuring procedural map generation, authentic recoil and spray mechanics, dynamic bot AI, procedural Web Audio synthesizer, and peer-to-peer real-time multiplayer.

🎮 **[Play Live on GitHub Pages](https://akulsun.github.io/counter-siege/)**

---

## ✨ Features

### 🔫 Tactical Gunplay & Ballistics
- **Authentic Recoil & Spread**: Spray patterns, bloom expansion during continuous fire, and recovery times modeled after classic tactical shooters.
- **Procedural Viewmodel Dynamics**: Smooth weapon bobbing while sprinting, inertia sway during camera pans, and realistic aim-down-sights (ADS).
- **Iconic Arsenal**:
  - **AK-47**: High damage, heavy horizontal and vertical spray pattern requiring burst control.
  - **Desert Eagle (.50 AE)**: Devastating headshot lethality with significant kick.
  - **AWP Sniper Rifle**: Instant-kill torso/head rounds with dual-stage optical zoom vignette and blurred peripherals.
  - **Tactical Combat Knife**: High close-quarters melee damage with custom swipe animations.
- **Procedural Effects**: Real-time muzzle flashes, ejected brass cartridges, smoke wisps, bullet tracers, and surface impact sparks.

### 🏃 Movement Mechanics
- **Tactical Leaning**: Peek around chokepoints and angles using `Q` and `E` without exposing full body mass.
- **Stance Control**: Crouch (`Ctrl` or `C`) to stabilize recoil spread and lower profile behind cover.
- **Momentum Physics**: Fluid WASD movement with acceleration curves, jump mechanics, and airborne inaccuracy penalties.

### 🤖 Adaptive Bot AI
- Offline solo play with intelligent bot navigation.
- Dynamic angle peeking, reaction delays, spray compensation, and strategic chokepoint holds.
- Automatic routing across map objectives.

### 🌐 Low-Latency P2P Multiplayer (WebRTC)
- 1v1 duels over direct Peer-to-Peer data connections powered by **PeerJS** and **WebRTC**.
- Zero dedicated game server overhead—simply share a 6-character room code with a friend.
- Full state synchronization: position interpolation, yaw/pitch orientation, lean angles, stance, health, armor, and hit registration.

### 🔊 Procedural Web Audio Engine
- Built-in procedural audio synthesizer generated entirely in real time via the **Web Audio API**.
- Zero external MP3/WAV dependencies for lightning-fast asset loading.
- Synthesized gunshots, shell casing clinks, footstep cadences, ricochets, reload clicks, and tactical radio cues.

### 🖥️ Modern Tactical HUD & Settings
- Matte charcoal glass HUD with high-contrast tactical elements.
- Real-time mini radar with directional sweeps and objective pings.
- Dynamic crosshair scaling based on weapon spread and movement velocity.
- Full settings modal: customize mouse sensitivity, invert Y, master/SFX volume, and graphics toggles.

---

## 🕹️ Controls

| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Forward / Left / Back / Right** | `W` / `A` / `S` / `D` | Arrow Keys |
| **Lean Left / Lean Right** | `Q` / `E` | — |
| **Jump** | `Space` | — |
| **Crouch** | `Left Control` | `C` (Toggle) |
| **Fire / Attack** | `Left Mouse Button` | — |
| **Aim Down Sights (ADS) / Scope** | `Right Mouse Button` | — |
| **Reload** | `R` | — |
| **Primary Weapon (AK-47 / AWP)** | `1` | — |
| **Secondary Weapon (Desert Eagle)** | `2` | — |
| **Melee (Combat Knife)** | `3` | — |
| **Pause / In-Game Menu** | `Esc` | — |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (included with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akulsun/counter-siege.git
   cd counter-siege
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled assets will be generated in the `dist/` directory.

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## 📁 Project Architecture

```plaintext
counter-siege/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automated GitHub Pages CI/CD workflow
├── src/
│   ├── audio.js            # Procedural Web Audio API sound synthesizer
│   ├── bot.js              # Bot AI state machine, navigation, & pathing
│   ├── main.js             # Engine initialization, game loop, & match state
│   ├── map.js              # Procedural tactical arena, materials, & collision meshes
│   ├── network.js          # PeerJS WebRTC peer-to-peer multiplayer networking
│   ├── player.js           # First-person controller, movement, physics, & camera
│   ├── settings.js         # Settings persistence (localStorage) & audio configs
│   ├── ui.js               # HUD management, radar, crosshair, & kill feed
│   └── weapons.js          # Gun procedural viewmodels, recoil, ballistics, & damage
├── index.html              # Core application entry, styling, & tactical UI layout
├── vite.config.js          # Vite build configuration with relative base paths
├── package.json            # Project manifest & dependencies
└── README.md               # Documentation & project guide
```

---

## 🌐 Deploying to GitHub Pages

This project is configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys on every push to the `main` branch.

To enable GitHub Pages manually in the repository settings:
1. Navigate to **Settings** > **Pages** in your GitHub repository.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions** (or select the `gh-pages` branch).
3. The site will be live at `https://<username>.github.io/counter-siege/`.

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
