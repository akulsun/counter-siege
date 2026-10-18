import * as THREE from 'three';

// =========================================================================
// PROCEDURAL WEAPON TEXTURE & MATERIAL SYSTEM (ZERO EXTERNAL ASSETS)
// =========================================================================

function createNoise(ctx, width, height, count, intensity = 20) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * width) | 0;
    const y = (Math.random() * height) | 0;
    const idx = (y * width + x) * 4;
    const delta = ((Math.random() - 0.5) * intensity) | 0;
    data[idx] = Math.max(0, Math.min(255, data[idx] + delta));
    data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + delta));
    data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + delta));
  }
  ctx.putImageData(imgData, 0, 0);
}

function createSteelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base charcoal gunmetal
  ctx.fillStyle = '#22252a';
  ctx.fillRect(0, 0, 512, 512);

  // Directional brushed steel lines (horizontal CNC machining grain)
  ctx.lineWidth = 1;
  for (let i = 0; i < 400; i++) {
    const y = Math.random() * 512;
    const len = 40 + Math.random() * 200;
    const x = Math.random() * (512 - len);
    const bright = Math.random() > 0.5;
    ctx.strokeStyle = bright ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.07)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  // Fast micro-grit noise
  createNoise(ctx, 512, 512, 4000, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createDarkSteelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep matte black oxide
  ctx.fillStyle = '#141518';
  ctx.fillRect(0, 0, 512, 512);

  // Fast direct stippling grain
  createNoise(ctx, 512, 512, 5000, 18);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createPolymerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep matte tactical polymer base
  ctx.fillStyle = '#191a1d';
  ctx.fillRect(0, 0, 512, 512);

  // Tactical diamond checkering / stipple pattern (16x16 grid)
  const step = 8;
  for (let y = 0; y < 512; y += step) {
    for (let x = 0; x < 512; x += step) {
      const isAlt = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = isAlt ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.09)';
      ctx.beginPath();
      ctx.moveTo(x + step / 2, y + 1);
      ctx.lineTo(x + step - 1, y + step / 2);
      ctx.lineTo(x + step / 2, y + step - 1);
      ctx.lineTo(x + 1, y + step / 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  createNoise(ctx, 512, 512, 4000, [0.015, 0.045]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 4;
  return texture;
}

function createRussianWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich Russian amber-orange base
  ctx.fillStyle = '#783816';
  ctx.fillRect(0, 0, 512, 512);

  // Longitudinal wood grain bands (sinusoidal undulating grain)
  for (let i = 0; i < 48; i++) {
    const yBase = (i / 48) * 512;
    const bandHeight = 6 + Math.random() * 12;
    const tone = Math.random();
    ctx.fillStyle = tone > 0.6 ? 'rgba(64, 24, 7, 0.35)' : (tone > 0.3 ? 'rgba(154, 78, 30, 0.28)' : 'rgba(40, 14, 4, 0.42)');
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= 512; x += 32) {
      const wave = Math.sin((x / 512) * Math.PI * 3 + i * 0.8) * 7;
      ctx.lineTo(x, yBase + wave);
    }
    for (let x = 512; x >= 0; x -= 32) {
      const wave = Math.sin((x / 512) * Math.PI * 3 + i * 0.8) * 7;
      ctx.lineTo(x, yBase + wave + bandHeight);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Fine wood fibers
  ctx.lineWidth = 1;
  for (let j = 0; j < 350; j++) {
    const y = Math.random() * 512;
    const x = Math.random() * 300;
    const len = 80 + Math.random() * 200;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(42, 16, 5, 0.2)' : 'rgba(180, 95, 42, 0.18)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }

  // Soft gloss lacquer highlight
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.04)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createWalnutTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep dark American walnut
  ctx.fillStyle = '#3a2215';
  ctx.fillRect(0, 0, 512, 512);

  // Wavy dark grain
  for (let i = 0; i < 30; i++) {
    const y = (i / 30) * 512;
    ctx.strokeStyle = 'rgba(28, 15, 8, 0.35)';
    ctx.lineWidth = 3 + Math.random() * 5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 40) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 6);
    }
    ctx.stroke();
  }

  // Diamond checkering pattern
  ctx.strokeStyle = 'rgba(20, 10, 5, 0.35)';
  ctx.lineWidth = 1;
  const cStep = 12;
  for (let d = -512; d < 1024; d += cStep) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + 512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(d, 512);
    ctx.lineTo(d + 512, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createAwpGreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Arctic Warfare OD green base
  ctx.fillStyle = '#354432';
  ctx.fillRect(0, 0, 512, 512);

  // Mottled composite fiberglass grain
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const bright = Math.random() > 0.5;
    ctx.fillStyle = bright ? 'rgba(68, 86, 64, 0.15)' : 'rgba(32, 42, 30, 0.2)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle molded seam line
  ctx.strokeStyle = 'rgba(20, 26, 18, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createChromeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Satin stainless silver
  ctx.fillStyle = '#c4cacf';
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal linear brushing highlights
  ctx.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * 512;
    const len = 60 + Math.random() * 250;
    const x = Math.random() * (512 - len);
    const bright = Math.random() > 0.5;
    ctx.strokeStyle = bright ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createScopeReticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Multi-coated glass reflection gradient
  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
  grad.addColorStop(0, '#0c1a26');
  grad.addColorStop(0.7, '#112233');
  grad.addColorStop(0.92, '#1c1836'); // Anti-reflective violet coating ring
  grad.addColorStop(1.0, '#0a0d12');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Outer crosshair thick bars
  ctx.strokeStyle = '#05070a';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, 256); ctx.lineTo(160, 256); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(352, 256); ctx.lineTo(512, 256); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(256, 0); ctx.lineTo(256, 160); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(256, 352); ctx.lineTo(256, 512); ctx.stroke();

  // Fine inner crosshair lines
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(160, 256); ctx.lineTo(352, 256); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(256, 160); ctx.lineTo(256, 352); ctx.stroke();

  // Mil-dots on inner crosshair
  ctx.fillStyle = '#05070a';
  const dotOffsets = [-64, -48, -32, -16, 16, 32, 48, 64];
  dotOffsets.forEach((d) => {
    ctx.beginPath();
    ctx.arc(256 + d, 256, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(256, 256 + d, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Rangefinder circles
  ctx.strokeStyle = 'rgba(5, 7, 10, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(256, 256, 96, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(256, 256, 180, 0, Math.PI * 2); ctx.stroke();

  // Center illuminated red dot
  ctx.fillStyle = '#ff2211';
  ctx.beginPath();
  ctx.arc(256, 256, 3, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

let _sharedGunTextures = null;
function getGunTextures() {
  if (!_sharedGunTextures) {
    _sharedGunTextures = {
      steel: createSteelTexture(),
      darkSteel: createDarkSteelTexture(),
      polymer: createPolymerTexture(),
      russianWood: createRussianWoodTexture(),
      walnut: createWalnutTexture(),
      awpGreen: createAwpGreenTexture(),
      chrome: createChromeTexture(),
      scopeReticle: createScopeReticleTexture()
    };
  }
  return _sharedGunTextures;
}

function createWeaponMaterials() {
  const tex = getGunTextures();
  return {
    // Primary PBR Materials
    steel: new THREE.MeshStandardMaterial({
      map: tex.steel,
      bumpMap: tex.steel,
      bumpScale: 0.0008,
      roughness: 0.35,
      metalness: 0.85
    }),
    darkSteel: new THREE.MeshStandardMaterial({
      map: tex.darkSteel,
      roughness: 0.45,
      metalness: 0.75
    }),
    brushedChrome: new THREE.MeshStandardMaterial({
      map: tex.chrome,
      bumpMap: tex.chrome,
      bumpScale: 0.0004,
      roughness: 0.16,
      metalness: 0.95
    }),
    polymer: new THREE.MeshStandardMaterial({
      map: tex.polymer,
      bumpMap: tex.polymer,
      bumpScale: 0.0012,
      roughness: 0.72,
      metalness: 0.12
    }),
    russianWood: new THREE.MeshStandardMaterial({
      map: tex.russianWood,
      bumpMap: tex.russianWood,
      bumpScale: 0.001,
      roughness: 0.38,
      metalness: 0.04
    }),
    walnut: new THREE.MeshStandardMaterial({
      map: tex.walnut,
      roughness: 0.45,
      metalness: 0.05
    }),
    awpGreen: new THREE.MeshStandardMaterial({
      map: tex.awpGreen,
      roughness: 0.52,
      metalness: 0.22
    }),
    scopeGlass: new THREE.MeshStandardMaterial({
      map: tex.scopeReticle,
      roughness: 0.05,
      metalness: 0.88,
      transparent: true,
      opacity: 0.94
    }),
    tritiumGreen: new THREE.MeshStandardMaterial({
      color: 0x39ff14,
      emissive: 0x24aa0d,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.1
    }),
    sightRed: new THREE.MeshStandardMaterial({
      color: 0xff3b14,
      emissive: 0xdd2200,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.1
    }),
    sightWhite: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.1
    }),
    brass: new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.88
    }),
    rubberPad: new THREE.MeshStandardMaterial({
      color: 0x161719,
      roughness: 0.85,
      metalness: 0.05
    }),

    // Relief detail materials with polygonOffset to guarantee zero Z-fighting
    steelRelief: new THREE.MeshStandardMaterial({
      map: tex.steel,
      roughness: 0.35,
      metalness: 0.85,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -1.0
    }),
    darkSteelRelief: new THREE.MeshStandardMaterial({
      map: tex.darkSteel,
      roughness: 0.45,
      metalness: 0.75,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -1.0
    }),
    chromeRelief: new THREE.MeshStandardMaterial({
      map: tex.chrome,
      roughness: 0.16,
      metalness: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -1.0
    }),

    // Backwards compatibility aliases
    gunMetal: new THREE.MeshStandardMaterial({
      map: tex.steel,
      roughness: 0.35,
      metalness: 0.85
    }),
    gunDark: new THREE.MeshStandardMaterial({
      map: tex.darkSteel,
      roughness: 0.45,
      metalness: 0.75
    }),
    gunWood: new THREE.MeshStandardMaterial({
      map: tex.russianWood,
      roughness: 0.38,
      metalness: 0.04
    }),
    gunGreen: new THREE.MeshStandardMaterial({
      map: tex.awpGreen,
      roughness: 0.52,
      metalness: 0.22
    }),
    chrome: new THREE.MeshStandardMaterial({
      map: tex.chrome,
      roughness: 0.16,
      metalness: 0.95
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xbf9b30,
      metalness: 0.85,
      roughness: 0.25
    })
  };
}

/**
 * Procedural Third-Person Rifle Mesh for Bot & Remote Players
 */
export function buildThirdPersonRifle() {
  const tex = getGunTextures();
  const steelMat = new THREE.MeshStandardMaterial({ map: tex.steel, roughness: 0.35, metalness: 0.85 });
  const darkMat = new THREE.MeshStandardMaterial({ map: tex.darkSteel, roughness: 0.45, metalness: 0.75 });
  const woodMat = new THREE.MeshStandardMaterial({ map: tex.russianWood, roughness: 0.38, metalness: 0.04 });

  const rifle = new THREE.Group();

  // Receiver
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.074, 0.28), steelMat);
  receiver.position.set(0, 0, 0);

  // Barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 12), darkMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.015, -0.28);

  // Muzzle brake
  const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 10), steelMat);
  brake.rotation.x = Math.PI / 2;
  brake.position.set(0, 0.015, -0.43);

  // Wood Handguard
  const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.054, 0.16), woodMat);
  handguard.position.set(0, 0.005, -0.19);

  // Wood Stock
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.088, 0.22), woodMat);
  stock.position.set(0, -0.015, 0.24);
  stock.rotation.x = -0.1;

  // Wood Grip
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.12, 0.048), woodMat);
  grip.position.set(0, -0.085, 0.09);
  grip.rotation.x = 0.38;

  // Curved Magazine
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.15, 0.07), steelMat);
  mag.position.set(0, -0.095, -0.045);
  mag.rotation.x = -0.28;

  rifle.add(receiver, barrel, brake, handguard, stock, grip, mag);
  return rifle;
}

export class WeaponSystem {
  constructor(camera, scene, player, soundSystem, gameMap) {
    this.camera = camera;
    this.scene = scene;
    this.player = player;
    this.sound = soundSystem;
    this.map = gameMap;

    // Viewmodel root group attached to camera
    this.viewmodelHolder = new THREE.Group();
    this.camera.add(this.viewmodelHolder);

    // Target rest transform
    this.restPos = new THREE.Vector3(0.24, -0.22, -0.45);
    this.restRot = new THREE.Euler(0, 0, 0);

    // Dynamic transforms
    this.currentPos = new THREE.Vector3().copy(this.restPos);
    this.currentRot = new THREE.Euler().copy(this.restRot);
    this.recoilOffset = new THREE.Vector3();
    this.recoilRot = new THREE.Euler();

    // Initialize viewmodel transform to rest position and keep hidden until round starts
    this.viewmodelHolder.position.copy(this.restPos);
    this.viewmodelHolder.rotation.copy(this.restRot);
    this.viewmodelHolder.visible = false;

    // Bobbing & sway
    this.bobTime = 0;
    this.swayX = 0;
    this.swayY = 0;

    // Procedural PBR materials with high-res canvas textures
    this.materials = createWeaponMaterials();

    // Shared reusable Raycaster (avoids garbage collection allocations per shot)
    this.raycaster = new THREE.Raycaster();

    // Reusable Impact Spark Pool (zero allocations or buffer churn during shooting)
    this.sparkPoolSize = 16;
    this.sparkIndex = 0;
    this.sparkGeo = new THREE.SphereGeometry(0.045, 4, 4);
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xffe680 });
    this.sparkPool = [];
    for (let i = 0; i < this.sparkPoolSize; i++) {
      const spark = new THREE.Mesh(this.sparkGeo, this.sparkMat);
      spark.visible = false;
      this.scene.add(spark);
      this.sparkPool.push({ mesh: spark, timer: 0 });
    }

    // Shared Muzzle Flash
    this.muzzleFlash = this.createMuzzleFlash();
    this.viewmodelHolder.add(this.muzzleFlash);
    this.flashTimer = 0;

    // Weapon Definitions Catalog
    this.allWeapons = {
      ak47: {
        id: 'ak47',
        name: 'AK-47',
        slot: 0,
        damage: 34,
        headshotMult: 4.0,
        legMult: 0.68,
        fireRate: 0.10, // seconds
        auto: true,
        magSize: 30,
        mag: 30,
        reserve: 90,
        maxReserve: 90,
        reloadTime: 2.2,
        spread: 0.012,
        moveSpreadMult: 3.2,
        recoilPitch: 0.038,
        recoilKickZ: 0.05,
        muzzleOffset: new THREE.Vector3(0, 0.012, -0.56),
        muzzleScale: 1.0,
        createMesh: () => this.buildAK47()
      },
      awp: {
        id: 'awp',
        name: 'AWP',
        slot: 0,
        damage: 220, // Guaranteed 1-shot kill to upper body
        legDamage: 95,
        headshotMult: 2.5,
        fireRate: 1.4,
        auto: false,
        magSize: 5,
        mag: 5,
        reserve: 30,
        maxReserve: 30,
        reloadTime: 3.2,
        spread: 0.001,
        moveSpreadMult: 12.0,
        recoilPitch: 0.09,
        recoilKickZ: 0.12,
        hasScope: true,
        muzzleOffset: new THREE.Vector3(0, 0.026, -0.76),
        muzzleScale: 1.4,
        createMesh: () => this.buildAWP()
      },
      shotgun: {
        id: 'shotgun',
        name: 'SHOTGUN',
        slot: 0,
        damage: 18, // per pellet
        pellets: 8,
        headshotMult: 2.5,
        legMult: 0.68,
        fireRate: 0.85,
        auto: false,
        magSize: 7,
        mag: 7,
        reserve: 28,
        maxReserve: 28,
        reloadTime: 2.6,
        spread: 0.055,
        moveSpreadMult: 1.5,
        recoilPitch: 0.07,
        recoilKickZ: 0.09,
        muzzleOffset: new THREE.Vector3(0, 0.032, -0.58),
        muzzleScale: 1.3,
        createMesh: () => this.buildShotgun()
      },
      pistol: {
        id: 'pistol',
        name: 'PISTOL',
        slot: 1,
        damage: 26,
        headshotMult: 3.5,
        legMult: 0.68,
        fireRate: 0.16,
        auto: false,
        magSize: 15,
        mag: 15,
        reserve: 60,
        maxReserve: 60,
        reloadTime: 1.6,
        spread: 0.009,
        moveSpreadMult: 2.0,
        recoilPitch: 0.024,
        recoilKickZ: 0.035,
        muzzleOffset: new THREE.Vector3(0.02, 0.046, -0.22),
        muzzleScale: 0.75,
        createMesh: () => this.buildPistol()
      },
      deagle: {
        id: 'deagle',
        name: 'DESERT EAGLE',
        slot: 1,
        damage: 54,
        headshotMult: 3.8,
        legMult: 0.68,
        fireRate: 0.32,
        auto: false,
        magSize: 7,
        mag: 7,
        reserve: 35,
        maxReserve: 35,
        reloadTime: 1.9,
        spread: 0.014,
        moveSpreadMult: 3.5,
        recoilPitch: 0.055,
        recoilKickZ: 0.07,
        muzzleOffset: new THREE.Vector3(0.015, 0.050, -0.26),
        muzzleScale: 1.25,
        createMesh: () => this.buildDeagle()
      },
      revolver: {
        id: 'revolver',
        name: 'REVOLVER',
        slot: 1,
        damage: 64,
        headshotMult: 3.6,
        legMult: 0.68,
        fireRate: 0.40,
        auto: false,
        magSize: 6,
        mag: 6,
        reserve: 24,
        maxReserve: 24,
        reloadTime: 2.4,
        spread: 0.011,
        moveSpreadMult: 2.8,
        recoilPitch: 0.065,
        recoilKickZ: 0.08,
        muzzleOffset: new THREE.Vector3(0.015, 0.042, -0.28),
        muzzleScale: 1.1,
        createMesh: () => this.buildRevolver()
      },
      knife: {
        id: 'knife',
        name: 'TACTICAL KNIFE',
        slot: 2,
        isMelee: true,
        damage: 55,
        headshotMult: 2.0,
        fireRate: 0.42,
        auto: false,
        magSize: 1,
        mag: 1,
        reserve: 1,
        maxReserve: 1,
        reloadTime: 0.1,
        spread: 0.0,
        moveSpreadMult: 1.0,
        recoilPitch: 0.0,
        recoilKickZ: 0.0,
        muzzleOffset: null,
        muzzleScale: 0.5,
        createMesh: () => this.buildKnife()
      }
    };

    // Loadout: 0 = Primary, 1 = Secondary, 2 = Melee (Knife)
    this.selectedPrimaryId = 'ak47';
    this.selectedSecondaryId = 'pistol';
    this.equipped = [
      this.allWeapons['ak47'],
      this.allWeapons['pistol'],
      this.allWeapons['knife']
    ];
    this.weapons = this.equipped; // Backwards compatible alias

    this.currentSlot = 0;
    this.currentWeapon = this.equipped[this.currentSlot];
    this.viewmodelMeshes = {};

    // Firing & Reload state
    this.fireTimer = 0;
    this.isReloading = false;
    this.reloadProgress = 0;
    this.isMouseDown = false;
    this.isScoped = false;
    this.equipAnimProgress = 1.0;

    // Target callback (Enemy/Bot)
    this.targets = [];

    this.initViewmodels();
    this.selectWeapon(0);
    this.setupInputs();
  }

  // =========================================================================
  // PROCEDURAL VIEWMODEL MESH BUILDERS (HIGH FIDELITY, ZERO OVERLAP GLITCHES)
  // =========================================================================
  initViewmodels() {
    Object.values(this.allWeapons).forEach((w) => {
      const mesh = w.createMesh();
      mesh.visible = false;
      this.viewmodelHolder.add(mesh);
      this.viewmodelMeshes[w.id] = mesh;
    });
  }

  buildAK47() {
    const gun = new THREE.Group();
    const m = this.materials;

    // Subtly canted first-person stance
    gun.rotation.set(0.02, -0.02, -0.015);

    // 1. Lower Receiver (Stamped Steel)
    const lowerGeo = new THREE.BoxGeometry(0.046, 0.064, 0.26);
    const lower = new THREE.Mesh(lowerGeo, m.steel);
    lower.position.set(0, 0, 0.02);
    gun.add(lower);

    // Receiver Magwell Dimples (Stamped reinforcement indentations on both flanks)
    const dimpleGeo = new THREE.BoxGeometry(0.048, 0.018, 0.04);
    const dimple = new THREE.Mesh(dimpleGeo, m.steelRelief);
    dimple.position.set(0, -0.008, -0.035);
    gun.add(dimple);

    // 2. Curved Ribbed Top Dust Cover (Receiver Cover)
    const dustCoverGeo = new THREE.CylinderGeometry(0.0225, 0.0225, 0.23, 16, 1, false, 0, Math.PI);
    const dustCover = new THREE.Mesh(dustCoverGeo, m.steel);
    dustCover.rotation.x = Math.PI / 2;
    dustCover.position.set(0, 0.032, 0.015);
    gun.add(dustCover);

    // 3 Stamped Reinforcement Ribs along dust cover
    [-0.05, 0.015, 0.075].forEach((zOff) => {
      const ribGeo = new THREE.CylinderGeometry(0.0235, 0.0235, 0.009, 16, 1, false, 0, Math.PI);
      const rib = new THREE.Mesh(ribGeo, m.steelRelief);
      rib.rotation.x = Math.PI / 2;
      rib.position.set(0, 0.032, 0.015 + zOff);
      gun.add(rib);
    });

    // Dust cover release button at rear
    const button = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.014, 0.018), m.darkSteelRelief);
    button.position.set(0, 0.034, 0.134);
    gun.add(button);

    // 3. Ejection Port & Bolt Carrier (Right Side)
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.024, 0.072), m.darkSteelRelief);
    port.position.set(0.0235, 0.018, -0.02);
    gun.add(port);

    const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.018, 0.06), m.steel);
    bolt.position.set(0.016, 0.018, -0.02);
    gun.add(bolt);

    // Curved Charging Handle
    const handleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.032, 8), m.steel);
    handleStem.rotation.z = Math.PI / 2;
    handleStem.position.set(0.034, 0.022, -0.01);
    const handleTip = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), m.steel);
    handleTip.position.set(0.052, 0.022, -0.005);
    gun.add(handleStem, handleTip);

    // Stamped Fire Selector Lever (Set to Auto)
    const selector = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.011, 0.082), m.steelRelief);
    selector.position.set(0.0245, 0.006, 0.045);
    selector.rotation.x = -0.12;
    gun.add(selector);

    // 4. Rear Sight Base Block & Tangent Leaf Sight
    const rearSightBase = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.032, 0.046), m.steel);
    rearSightBase.position.set(0, 0.024, -0.132);
    const sightLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.006, 0.042), m.darkSteelRelief);
    sightLeaf.position.set(0, 0.043, -0.132);
    sightLeaf.rotation.x = -0.08;
    const sightSlider = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.008, 0.008), m.steelRelief);
    sightSlider.position.set(0, 0.045, -0.122);
    gun.add(rearSightBase, sightLeaf, sightSlider);

    // 5. Authentic Russian Laminate Wood Handguards
    // Lower Handguard with contoured palm swells
    const lowerHandguard = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.052, 0.165), m.russianWood);
    lowerHandguard.position.set(0, 0.002, -0.235);
    const palmSwells = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.036, 0.12), m.russianWood);
    palmSwells.position.set(0, 0.002, -0.235);
    gun.add(lowerHandguard, palmSwells);

    // Steel retaining caps for lower handguard
    const capRear = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.054, 0.012), m.steel);
    capRear.position.set(0, 0.002, -0.15);
    const capFront = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.054, 0.012), m.steel);
    capFront.position.set(0, 0.002, -0.32);
    gun.add(capRear, capFront);

    // Upper Handguard (Wood Gas Tube Cover)
    const upperHandguard = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.028, 0.14), m.russianWood);
    upperHandguard.position.set(0, 0.040, -0.235);
    gun.add(upperHandguard);

    // Steel Gas Tube & Angled Gas Block
    const gasTube = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.16, 12), m.steel);
    gasTube.rotation.x = Math.PI / 2;
    gasTube.position.set(0, 0.036, -0.235);
    const gasBlock = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.042, 0.035), m.steel);
    gasBlock.position.set(0, 0.026, -0.345);
    gun.add(gasTube, gasBlock);

    // 6. Barrel, Front Sight & Slanted Compensator
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 16), m.darkSteel);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.012, -0.44);
    gun.add(barrel);

    // Under-barrel steel cleaning rod
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.24, 8), m.steel);
    rod.rotation.x = Math.PI / 2;
    rod.position.set(0, -0.018, -0.32);
    gun.add(rod);

    // Front Sight Tower
    const sightTower = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.046, 0.022), m.steel);
    sightTower.position.set(0, 0.034, -0.485);
    const sightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.014, 8), m.steel);
    sightPost.position.set(0, 0.050, -0.485);
    // Glowing Tritium Dot at tip of sight post
    const tritiumDot = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 8, 8), m.tritiumGreen);
    tritiumDot.position.set(0, 0.057, -0.485);
    // Protective hood wings
    const hoodLeft = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.022, 0.018), m.steelRelief);
    hoodLeft.position.set(-0.010, 0.050, -0.485);
    const hoodRight = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.022, 0.018), m.steelRelief);
    hoodRight.position.set(0.010, 0.050, -0.485);
    gun.add(sightTower, sightPost, tritiumDot, hoodLeft, hoodRight);

    // Slanted AK Muzzle Compensator
    const brakeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.045, 14), m.steel);
    brakeBase.rotation.x = Math.PI / 2;
    brakeBase.position.set(0, 0.012, -0.525);
    const brakeSlant = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.022, 0.012), m.steel);
    brakeSlant.position.set(0, 0.014, -0.542);
    brakeSlant.rotation.x = 0.4;
    gun.add(brakeBase, brakeSlant);

    // 7. Curved 30-Round Banana Magazine
    const seg1 = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.068, 0.065), m.steel);
    seg1.position.set(0, -0.062, -0.032);
    seg1.rotation.x = -0.16;

    const seg2 = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.068, 0.065), m.steel);
    seg2.position.set(0, -0.120, -0.052);
    seg2.rotation.x = -0.32;

    const seg3 = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.052, 0.065), m.steel);
    seg3.position.set(0, -0.168, -0.082);
    seg3.rotation.x = -0.48;

    const magPlate = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.010, 0.072), m.darkSteel);
    magPlate.position.set(0, -0.190, -0.098);
    magPlate.rotation.x = -0.48;

    gun.add(seg1, seg2, seg3, magPlate);

    // Reinforcing ribs on magazine flanks
    [-0.08, -0.11, -0.14].forEach((yPos, i) => {
      const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.006, 0.048), m.steelRelief);
      ribL.position.set(0, yPos, -0.04 - i * 0.02);
      ribL.rotation.x = -0.22 - i * 0.12;
      gun.add(ribL);
    });

    // 8. Contoured Russian Wood Pistol Grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.125, 0.048), m.russianWood);
    grip.position.set(0, -0.088, 0.11);
    grip.rotation.x = 0.42;
    const gripCap = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.010, 0.050), m.steel);
    gripCap.position.set(0, -0.144, 0.136);
    gripCap.rotation.x = 0.42;
    gun.add(grip, gripCap);

    // 9. Russian Wood Buttstock & Steel Buttplate
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.086, 0.22), m.russianWood);
    stock.position.set(0, -0.012, 0.25);
    stock.rotation.x = -0.08;
    const buttplate = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.090, 0.014), m.steel);
    buttplate.position.set(0, -0.021, 0.36);
    buttplate.rotation.x = -0.08;
    gun.add(stock, buttplate);

    // 10. Trigger Guard & Curved Trigger Shoe
    const triggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.036, 0.052), m.darkSteel);
    triggerGuard.position.set(0, -0.048, 0.035);
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.024, 0.012), m.steel);
    trigger.position.set(0, -0.044, 0.042);
    trigger.rotation.x = -0.3;
    gun.add(triggerGuard, trigger);

    return gun;
  }

  buildAWP() {
    const gun = new THREE.Group();
    const m = this.materials;

    gun.rotation.set(0.015, -0.015, -0.01);

    // 1. OD Green Arctic Warfare Ergonomic Chassis
    // Main action receiver housing
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.076, 0.28), m.awpGreen);
    body.position.set(0, -0.006, 0.02);
    gun.add(body);

    // Forend extending forward
    const forend = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.062, 0.26), m.awpGreen);
    forend.position.set(0, -0.012, -0.24);
    gun.add(forend);

    // Forend ventilation cooling relief slots (Left & Right)
    [-0.18, -0.24, -0.30].forEach((zSlot) => {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.012, 0.032), m.darkSteelRelief);
      slot.position.set(0, -0.008, zSlot);
      gun.add(slot);
    });

    // 2. Thumbhole Buttstock & Adjustable Cheek Rest
    // Upper stock comb
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.042, 0.18), m.awpGreen);
    comb.position.set(0, 0.022, 0.26);
    comb.rotation.x = -0.04;

    // Raised black tactical cheekpiece
    const cheekRest = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.026, 0.12), m.polymer);
    cheekRest.position.set(0, 0.046, 0.25);

    // Lower stock strut
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.030, 0.18), m.awpGreen);
    strut.position.set(0, -0.062, 0.26);

    // Buttpad white spacer
    const spacer = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.112, 0.006), m.sightWhite);
    spacer.position.set(0, -0.015, 0.353);

    // Heavy ventilated black rubber buttpad
    const buttpad = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.115, 0.032), m.rubberPad);
    buttpad.position.set(0, -0.015, 0.372);

    gun.add(comb, cheekRest, strut, spacer, buttpad);

    // 3. Cylindrical Steel Action Receiver & Bolt Assembly
    const receiver = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.26, 16), m.darkSteel);
    receiver.rotation.x = Math.PI / 2;
    receiver.position.set(0, 0.026, 0.01);
    gun.add(receiver);

    // Top Picatinny Rail for Scope Mounting
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.010, 0.22), m.darkSteelRelief);
    rail.position.set(0, 0.052, -0.02);
    gun.add(rail);

    // Bolt Body (Polished Chrome inside receiver)
    const boltBody = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.20, 12), m.brushedChrome);
    boltBody.rotation.x = Math.PI / 2;
    boltBody.position.set(0, 0.026, 0.02);
    gun.add(boltBody);

    // Swept-Back Bolt Handle & Spherical Tactical Knob
    const boltArm = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.052, 8), m.brushedChrome);
    boltArm.position.set(0.042, 0.034, 0.065);
    boltArm.rotation.z = -0.55;
    boltArm.rotation.y = 0.2;
    const boltKnob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), m.polymer);
    boltKnob.position.set(0.064, 0.020, 0.075);
    gun.add(boltArm, boltKnob);

    // 4. Free-Floating Match-Grade Heavy Fluted Barrel & Muzzle Brake
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.014, 0.44, 16), m.darkSteel);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.026, -0.45);
    gun.add(barrel);

    // Fluting grooves relief
    const flutes = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.030, 0.36), m.darkSteelRelief);
    flutes.position.set(0, 0.026, -0.45);
    flutes.rotation.z = Math.PI / 4;
    gun.add(flutes);

    // Massive Dual-Port AWP Muzzle Brake
    const brake = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.038, 0.088), m.steel);
    brake.position.set(0, 0.026, -0.715);
    // Transverse exhaust ports
    const portCut = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.024, 0.048), m.darkSteelRelief);
    portCut.position.set(0, 0.026, -0.715);
    gun.add(brake, portCut);

    // 5. High-Magnification Sniper Scope (Schmidt & Bender Style)
    // Main 34mm Scope Tube
    const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.30, 16), m.darkSteel);
    scopeTube.rotation.x = Math.PI / 2;
    scopeTube.position.set(0, 0.084, -0.04);

    // Forward Objective Lens Bell (Flared)
    const objBell = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.019, 0.08, 16), m.darkSteel);
    objBell.rotation.x = Math.PI / 2;
    objBell.position.set(0, 0.084, -0.22);

    // Sunshade Hood Ring
    const sunshade = new THREE.Mesh(new THREE.CylinderGeometry(0.0285, 0.0285, 0.024, 16), m.darkSteel);
    sunshade.rotation.x = Math.PI / 2;
    sunshade.position.set(0, 0.084, -0.26);

    // Multi-Coated Sapphire Front Glass Lens
    const frontLens = new THREE.Mesh(new THREE.CircleGeometry(0.026, 16), m.scopeGlass);
    frontLens.position.set(0, 0.084, -0.25);

    // Rear Eyepiece Bell
    const ocularBell = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.019, 0.06, 16), m.darkSteel);
    ocularBell.rotation.x = Math.PI / 2;
    ocularBell.position.set(0, 0.084, 0.13);

    // Ribbed Rubber Eye Relief Ring
    const eyeRing = new THREE.Mesh(new THREE.CylinderGeometry(0.0245, 0.0245, 0.018, 16), m.rubberPad);
    eyeRing.rotation.x = Math.PI / 2;
    eyeRing.position.set(0, 0.084, 0.165);

    // Rear Optical Glass Lens with Mil-Dot Crosshair Reticle
    const rearLens = new THREE.Mesh(new THREE.CircleGeometry(0.021, 16), m.scopeGlass);
    rearLens.position.set(0, 0.084, 0.155);
    rearLens.rotation.y = Math.PI; // Face shooter

    // Tactical Adjustment Turrets
    // Top Elevation Turret
    const elevTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.016, 12), m.steel);
    elevTurret.position.set(0, 0.106, -0.04);
    // Right Windage Turret
    const windTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.016, 12), m.steel);
    windTurret.rotation.z = Math.PI / 2;
    windTurret.position.set(0.024, 0.084, -0.04);
    // Left Parallax Focus Dial
    const parTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.014, 12), m.steel);
    parTurret.rotation.z = Math.PI / 2;
    parTurret.position.set(-0.023, 0.084, -0.04);

    // Heavy Dual-Ring Scope Mounts
    const ring1 = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.042, 0.026), m.darkSteel);
    ring1.position.set(0, 0.064, 0.04);
    const ring2 = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.042, 0.026), m.darkSteel);
    ring2.position.set(0, 0.064, -0.12);

    gun.add(scopeTube, objBell, sunshade, frontLens, ocularBell, eyeRing, rearLens, elevTurret, windTurret, parTurret, ring1, ring2);

    // 6. Detachable Steel 5-Round .338 Lapua Box Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.095, 0.086), m.darkSteel);
    mag.position.set(0, -0.072, -0.02);
    mag.rotation.x = -0.06;
    const magFloor = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.010, 0.090), m.steel);
    magFloor.position.set(0, -0.120, -0.023);
    magFloor.rotation.x = -0.06;
    gun.add(mag, magFloor);

    // 7. Harris Tactical Stowed Folding Bipod
    const bipodSpigot = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.022, 0.032), m.darkSteel);
    bipodSpigot.position.set(0, -0.046, -0.32);
    // Folded tubular legs along forend sides
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.17, 8), m.steel);
    legL.rotation.x = Math.PI / 2;
    legL.position.set(-0.028, -0.028, -0.24);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.17, 8), m.steel);
    legR.rotation.x = Math.PI / 2;
    legR.position.set(0.028, -0.028, -0.24);
    gun.add(bipodSpigot, legL, legR);

    // 8. Match-Grade Trigger & Guard
    const triggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.038, 0.062), m.darkSteel);
    triggerGuard.position.set(0, -0.052, 0.03);
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.024, 0.010), m.steel);
    trigger.position.set(0, -0.048, 0.035);
    trigger.rotation.x = -0.25;
    gun.add(triggerGuard, trigger);

    return gun;
  }

  buildShotgun() {
    const gun = new THREE.Group();
    const m = this.materials;

    gun.rotation.set(0.015, -0.02, -0.015);

    // 1. Solid Milled Steel Receiver
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.082, 0.28), m.darkSteel);
    receiver.position.set(0, 0.005, 0.02);
    gun.add(receiver);

    // Right-Side Beveled Ejection Port
    const ejectPort = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.030, 0.092), m.darkSteelRelief);
    ejectPort.position.set(0.0265, 0.016, -0.015);
    // Exposed Chrome Bolt & Extractor inside
    const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.022, 0.085), m.brushedChrome);
    bolt.position.set(0.018, 0.016, -0.015);
    gun.add(ejectPort, bolt);

    // Underside Loading Port with Shell Elevator Flap & Brass Shotshell Rim
    const shellRim = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.028, 12), m.brass);
    shellRim.rotation.x = Math.PI / 2;
    shellRim.position.set(0, -0.035, -0.01);
    gun.add(shellRim);

    // 2. Heavy 12-Gauge Smoothbore Barrel & Ventilated Top Rib
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.46, 16), m.darkSteel);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.032, -0.33);
    gun.add(barrel);

    // Ventilated Top Sighting Rib with cooling vents
    const ventRib = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.008, 0.44), m.steelRelief);
    ventRib.position.set(0, 0.051, -0.33);
    gun.add(ventRib);

    // 3. Full-Length Under-Barrel Magazine Tube
    const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 16), m.steel);
    magTube.rotation.x = Math.PI / 2;
    magTube.position.set(0, -0.012, -0.31);
    // Knurled Threaded End Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.024, 14), m.steel);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(0, -0.012, -0.535);
    gun.add(magTube, cap);

    // Dual-Loop Barrel Clamp (secures barrel to magazine tube)
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.065, 0.018), m.steel);
    clamp.position.set(0, 0.010, -0.47);
    gun.add(clamp);

    // 4. Tactical Ribbed Pump Forend (Slide Handle)
    const pumpBody = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.17, 16), m.polymer);
    pumpBody.rotation.x = Math.PI / 2;
    pumpBody.position.set(0, -0.012, -0.27);
    gun.add(pumpBody);

    // 6 Tactical Gripping Rib Rings along pump
    [-0.06, -0.035, -0.01, 0.015, 0.04, 0.065].forEach((zOff) => {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.0275, 0.0275, 0.008, 16), m.polymer);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, -0.012, -0.27 + zOff);
      gun.add(ring);
    });

    // Twin Steel Action Bars
    const barL = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.006, 0.14), m.steel);
    barL.position.set(-0.022, 0.008, -0.12);
    const barR = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.006, 0.14), m.steel);
    barR.position.set(0.022, 0.008, -0.12);
    gun.add(barL, barR);

    // 5. Tactical High-Visibility Combat Sights
    // Front sight post with glowing green fiber-optic bead
    const sightBase = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.024), m.darkSteel);
    sightBase.position.set(0, 0.058, -0.54);
    const fiberOptic = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.018, 8), m.tritiumGreen);
    fiberOptic.rotation.x = Math.PI / 2;
    fiberOptic.position.set(0, 0.064, -0.54);
    // Rear ghost-ring aperture sight
    const ghostRing = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.002, 6, 12), m.darkSteel);
    ghostRing.rotation.x = Math.PI / 2;
    ghostRing.position.set(0, 0.052, 0.10);
    gun.add(sightBase, fiberOptic, ghostRing);

    // 6. Tactical Combat Synthetic Stock & Rubber Recoil Buttpad
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.088, 0.25), m.polymer);
    stock.position.set(0, -0.032, 0.265);
    stock.rotation.x = -0.12;

    const buttpad = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.105, 0.032), m.rubberPad);
    buttpad.position.set(0, -0.042, 0.395);
    buttpad.rotation.x = -0.12;
    gun.add(stock, buttpad);

    // 7. Combat Trigger Guard & Trigger
    const triggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.036, 0.055), m.darkSteel);
    triggerGuard.position.set(0, -0.048, 0.035);
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.024, 0.012), m.steel);
    trigger.position.set(0, -0.044, 0.042);
    trigger.rotation.x = -0.28;
    gun.add(triggerGuard, trigger);

    return gun;
  }

  buildPistol() {
    const gun = new THREE.Group();
    const m = this.materials;

    gun.position.set(0.02, 0.02, -0.02);
    gun.rotation.set(0.02, -0.025, -0.015);

    // 1. CNC Milled Steel Slide
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.038, 0.21), m.steel);
    slide.position.set(0, 0.026, -0.02);
    gun.add(slide);

    // Beveled slide nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.034, 0.014), m.steelRelief);
    nose.position.set(0, 0.026, -0.127);
    gun.add(nose);

    // Slide Cocking Serrations (Rear & Front)
    [-0.04, -0.05, -0.06, -0.07, -0.08].forEach((zOff) => {
      const serr = new THREE.Mesh(new THREE.BoxGeometry(0.037, 0.024, 0.003), m.darkSteelRelief);
      serr.position.set(0, 0.026, 0.085 + zOff);
      gun.add(serr);
    });
    [-0.07, -0.08, -0.09].forEach((zOff) => {
      const serr = new THREE.Mesh(new THREE.BoxGeometry(0.037, 0.020, 0.003), m.darkSteelRelief);
      serr.position.set(0, 0.026, zOff);
      gun.add(serr);
    });

    // Ejection Port & Exposed Chambered Barrel Hood ("9x19")
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.020, 0.055), m.darkSteelRelief);
    port.position.set(0.0185, 0.034, -0.01);
    const barrelHood = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.048), m.darkSteel);
    barrelHood.position.set(0.012, 0.032, -0.01);
    gun.add(port, barrelHood);

    // Muzzle Bore opening
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 12), m.darkSteel);
    bore.rotation.x = Math.PI / 2;
    bore.position.set(0, 0.026, -0.126);
    gun.add(bore);

    // 2. Tactical 3-Dot Combat Sights
    // Front sight blade with white tritium dot
    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.012, 0.014), m.darkSteel);
    frontSight.position.set(0, 0.050, -0.115);
    const frontDot = new THREE.Mesh(new THREE.SphereGeometry(0.0025, 8, 8), m.sightWhite);
    frontDot.position.set(0, 0.052, -0.110);

    // Rear square-notch combat sight with dual alignment dots
    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.014, 0.012), m.darkSteel);
    rearSight.position.set(0, 0.050, 0.075);
    const dotL = new THREE.Mesh(new THREE.SphereGeometry(0.0022, 8, 8), m.sightWhite);
    dotL.position.set(-0.008, 0.052, 0.075);
    const dotR = new THREE.Mesh(new THREE.SphereGeometry(0.0022, 8, 8), m.sightWhite);
    dotR.position.set(0.008, 0.052, 0.075);

    gun.add(frontSight, frontDot, rearSight, dotL, dotR);

    // 3. Polymer Lower Frame & Under-Barrel Picatinny Rail
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.032, 0.19), m.polymer);
    frame.position.set(0, -0.008, -0.015);
    // Picatinny accessory rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.006, 0.06), m.polymer);
    rail.position.set(0, -0.026, -0.075);
    // Slide release lever
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.008, 0.024), m.steelRelief);
    lever.position.set(-0.0185, 0.010, 0.01);
    gun.add(frame, rail, lever);

    // 4. Ergonomic Stippled Polymer Grip & Extended Mag Bumper
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.125, 0.052), m.polymer);
    grip.position.set(0, -0.076, 0.052);
    grip.rotation.x = 0.32;

    // Finger grooves along front grip face
    [-0.045, -0.075, -0.105].forEach((yOff) => {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.008, 0.012), m.polymer);
      groove.position.set(0, yOff, 0.035 - yOff * 0.28);
      groove.rotation.x = 0.32;
      gun.add(groove);
    });

    // Flared Magazine Floor Bumper Plate
    const magBumper = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.012, 0.056), m.darkSteel);
    magBumper.position.set(0, -0.138, 0.072);
    magBumper.rotation.x = 0.32;

    gun.add(grip, magBumper);

    // 5. Combat Trigger Guard & Dual-Blade Safety Trigger
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.038, 0.052), m.polymer);
    guard.position.set(0, -0.042, -0.005);
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.022, 0.010), m.steel);
    trigger.position.set(0, -0.036, 0.005);
    trigger.rotation.x = -0.25;
    const safetyBlade = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.018, 0.006), m.darkSteelRelief);
    safetyBlade.position.set(0, -0.036, 0.008);
    safetyBlade.rotation.x = -0.25;

    gun.add(guard, trigger, safetyBlade);

    return gun;
  }

  buildDeagle() {
    const gun = new THREE.Group();
    const m = this.materials;

    gun.position.set(0.015, 0.015, -0.03);
    gun.rotation.set(0.018, -0.025, -0.015);

    // 1. Massive Triangular Slide & Barrel (Polished / Brushed Chrome)
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.056, 0.26), m.brushedChrome);
    slide.position.set(0, 0.034, -0.08);
    gun.add(slide);

    // Integrated Weaver / Picatinny Top Scope Rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.008, 0.18), m.chromeRelief);
    rail.position.set(0, 0.065, -0.08);
    gun.add(rail);

    // Giant .50 Caliber Muzzle Bore
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.045, 16), m.darkSteel);
    bore.rotation.x = Math.PI / 2;
    bore.position.set(0, 0.034, -0.21);
    gun.add(bore);

    // Recessed Side Barrel Flutes (Lightening cuts on flanks)
    const fluteL = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.018, 0.14), m.chromeRelief);
    fluteL.position.set(-0.0245, 0.038, -0.09);
    const fluteR = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.018, 0.14), m.chromeRelief);
    fluteR.position.set(0.0245, 0.038, -0.09);
    gun.add(fluteL, fluteR);

    // Underside Gas Piston Cylinder Housing
    const gasPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.16, 12), m.steel);
    gasPiston.rotation.x = Math.PI / 2;
    gasPiston.position.set(0, 0.004, -0.10);
    gun.add(gasPiston);

    // Open Slide Top & Rotating Bolt Head
    const boltHead = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.024, 0.075), m.steel);
    boltHead.position.set(0, 0.032, 0.01);
    gun.add(boltHead);

    // 2. Chrome Lower Frame & Controls
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.042, 0.20), m.brushedChrome);
    frame.position.set(0, -0.010, -0.02);

    // Extended Beavertail Spur
    const beavertail = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.018, 0.045), m.brushedChrome);
    beavertail.position.set(0, 0.014, 0.085);
    beavertail.rotation.x = 0.25;

    // Cocked Target Hammer with Serrated Thumb Spur
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.026, 0.022), m.darkSteel);
    hammer.position.set(0, 0.042, 0.082);
    hammer.rotation.x = 0.5;

    // Ambidextrous Slide Safety Levers (Left & Right)
    const safetyL = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.012, 0.024), m.darkSteelRelief);
    safetyL.position.set(-0.0245, 0.042, 0.045);
    const safetyR = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.012, 0.024), m.darkSteelRelief);
    safetyR.position.set(0.0245, 0.042, 0.045);

    gun.add(frame, beavertail, hammer, safetyL, safetyR);

    // 3. Hogue Wrap-Around Rubber Combat Grip with Finger Grooves & Insignia Medallion
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.145, 0.065), m.polymer);
    grip.position.set(0, -0.088, 0.055);
    grip.rotation.x = 0.28;

    // 3 Deep Finger Grooves
    [-0.055, -0.088, -0.12].forEach((yOff) => {
      const fg = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.010, 0.014), m.polymer);
      fg.position.set(0, yOff, 0.038 - yOff * 0.26);
      fg.rotation.x = 0.28;
      gun.add(fg);
    });

    // Circular Insignia Crest Medallion
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.002, 12), m.chromeRelief);
    crest.rotation.z = Math.PI / 2;
    crest.position.set(0.022, -0.085, 0.055);
    gun.add(crest);

    // Heavy Steel Magazine Base Plate
    const magBase = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.012, 0.070), m.steel);
    magBase.position.set(0, -0.158, 0.075);
    magBase.rotation.x = 0.28;
    gun.add(grip, magBase);

    // 4. Combat Iron Sights
    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.016, 0.018), m.darkSteel);
    frontSight.position.set(0, 0.068, -0.19);
    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.018, 0.016), m.darkSteel);
    rearSight.position.set(0, 0.068, 0.042);
    gun.add(frontSight, rearSight);

    // 5. Wide Target Trigger & Guard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.044, 0.065), m.brushedChrome);
    guard.position.set(0, -0.048, -0.005);
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.026, 0.012), m.steel);
    trigger.position.set(0, -0.042, 0.008);
    trigger.rotation.x = -0.22;
    gun.add(guard, trigger);

    return gun;
  }

  buildRevolver() {
    const gun = new THREE.Group();
    const m = this.materials;

    gun.position.set(0.015, 0.015, -0.03);
    gun.rotation.set(0.02, -0.025, -0.015);

    // 1. Heavy Full-Underlug Barrel (Dark Gunmetal Steel)
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.056, 0.22), m.steel);
    barrel.position.set(0, 0.026, -0.14);
    gun.add(barrel);

    // Ventilated Top Rib with 3 Cooling Ports
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.008, 0.22), m.steelRelief);
    rib.position.set(0, 0.058, -0.14);
    [-0.08, -0.14, -0.20].forEach((zPort) => {
      const port = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.009, 0.022), m.darkSteelRelief);
      port.position.set(0, 0.058, zPort);
      gun.add(port);
    });
    gun.add(rib);

    // Full-Length Underlug Shroud & Recessed Target Muzzle Crown
    const underlug = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.16, 12), m.steel);
    underlug.rotation.x = Math.PI / 2;
    underlug.position.set(0, 0.004, -0.14);
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 12), m.darkSteel);
    bore.rotation.x = Math.PI / 2;
    bore.position.set(0, 0.026, -0.25);
    gun.add(underlug, bore);

    // Ramp Front Sight with Glowing Red/Orange Target Insert
    const frontBase = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.016, 0.024), m.darkSteel);
    frontBase.position.set(0, 0.068, -0.235);
    const redInsert = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.008, 0.018), m.sightRed);
    redInsert.position.set(0, 0.072, -0.235);
    gun.add(frontBase, redInsert);

    // 2. 6-Shot Fluted Cylinder (Brushed Chrome / Stainless Steel)
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.076, 18), m.brushedChrome);
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.set(0, 0.016, 0.005);
    gun.add(cylinder);

    // 6 Flutes milled along circumference (radial 60-deg intervals)
    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      const r = 0.029;
      const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.065, 8), m.chromeRelief);
      flute.rotation.x = Math.PI / 2;
      flute.position.set(Math.cos(angle) * r, 0.016 + Math.sin(angle) * r, 0.005);
      gun.add(flute);
    }

    // Center Ejector Rod & Star Pin
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.088, 8), m.steel);
    rod.rotation.x = Math.PI / 2;
    rod.position.set(0, 0.016, 0.005);
    gun.add(rod);

    // 3. Forged Steel Frame & Top Strap
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.076, 0.16), m.steel);
    frame.position.set(0, 0.008, 0.045);

    // Top Strap with Target Sighting Channel
    const topStrap = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.014, 0.11), m.steel);
    topStrap.position.set(0, 0.052, 0.005);
    // Adjustable Rear Target Sight with Square Notch
    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.014, 0.016), m.darkSteel);
    rearSight.position.set(0, 0.054, 0.115);

    // Wide Target Hammer with Diamond-Checkered Thumb Spur
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.028, 0.022), m.darkSteel);
    hammer.position.set(0, 0.048, 0.072);
    hammer.rotation.x = 0.4;

    // Cylinder Thumb Release Latch (Left Flank)
    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.012, 0.018), m.steelRelief);
    latch.position.set(-0.0195, 0.022, 0.055);

    gun.add(frame, topStrap, rearSight, hammer, latch);

    // 4. Custom American Walnut Checkered Grips with Brass Medallion
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.138, 0.060), m.walnut);
    grip.position.set(0, -0.082, 0.09);
    grip.rotation.x = 0.55;

    // Brass grip medallion crest
    const crestL = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.002, 8), m.brass);
    crestL.rotation.z = Math.PI / 2;
    crestL.position.set(-0.018, -0.078, 0.09);
    const crestR = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.002, 8), m.brass);
    crestR.rotation.z = Math.PI / 2;
    crestR.position.set(0.018, -0.078, 0.09);

    // Polished metal grip cap at bottom
    const gripCap = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.010, 0.062), m.steel);
    gripCap.position.set(0, -0.146, 0.128);
    gripCap.rotation.x = 0.55;

    gun.add(grip, crestL, crestR, gripCap);

    // 5. Rounded Trigger Guard & Smooth Combat Trigger
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.042, 0.058), m.steel);
    guard.position.set(0, -0.044, 0.035);
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.024, 0.012), m.steel);
    trigger.position.set(0, -0.038, 0.042);
    trigger.rotation.x = -0.32;
    gun.add(guard, trigger);

    return gun;
  }

  buildKnife() {
    const knife = new THREE.Group();
    const m = this.materials;

    // 1. Ergonomic G10 Tactical Handle with Contour & Grooves
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.044, 0.16), m.polymer);
    handle.position.set(0, 0, 0.08);
    knife.add(handle);

    // Stainless Steel Torx Retention Pins
    [0.03, 0.08, 0.13].forEach((zPin) => {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.032, 8), m.steelRelief);
      pin.rotation.z = Math.PI / 2;
      pin.position.set(0, 0.002, zPin);
      knife.add(pin);
    });

    // Solid Stainless Steel Skull-Crusher Pommel / Glass Breaker
    const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.048, 0.022), m.steel);
    pommel.position.set(0, 0, 0.165);
    const breaker = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.014, 4), m.steel);
    breaker.rotation.x = Math.PI / 2;
    breaker.position.set(0, 0, 0.18);
    knife.add(pommel, breaker);

    // 2. Precision Milled Steel Crossguard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.078, 0.014), m.steel);
    guard.position.set(0, 0, -0.007);
    knife.add(guard);

    // 3. Tactical Dual-Tone High-Carbon Steel Blade
    // Stonewashed Dark Spine Body
    const bladeBody = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.046, 0.22), m.darkSteel);
    bladeBody.position.set(0, 0.004, -0.12);
    knife.add(bladeBody);

    // Satin Polished Razor Cutting Edge Bevel
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.014, 0.22), m.brushedChrome);
    edge.position.set(0, -0.022, -0.12);
    knife.add(edge);

    // Tactical Sawback Notches along Top Spine
    for (let s = 0; s < 5; s++) {
      const notch = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.006, 0.010), m.steelRelief);
      notch.position.set(0, 0.029, -0.04 - s * 0.024);
      knife.add(notch);
    }

    // Clip Point Tip
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.08, 4), m.brushedChrome);
    tip.rotation.x = -Math.PI / 2;
    tip.rotation.y = Math.PI / 4;
    tip.position.set(0, 0.002, -0.265);
    knife.add(tip);

    // Milled Fuller (Blood Groove)
    const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.005, 0.13), m.steelRelief);
    fuller.position.set(0, 0.006, -0.11);
    knife.add(fuller);

    // Natural first-person combat knife presentation
    knife.position.set(0.04, -0.02, -0.08);
    knife.rotation.set(0.18, -0.25, 0.12);

    return knife;
  }

  createMuzzleFlash() {
    const flashGroup = new THREE.Group();
    flashGroup.visible = false;

    // Multi-pointed glowing star geometry
    const geo = new THREE.OctahedronGeometry(0.065, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfff088, transparent: true, opacity: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    flashGroup.add(mesh);

    // Cross flare blades
    const flareGeo = new THREE.BoxGeometry(0.14, 0.015, 0.015);
    const flareMat = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.85 });
    const f1 = new THREE.Mesh(flareGeo, flareMat);
    const f2 = f1.clone();
    f2.rotation.z = Math.PI / 2;
    flashGroup.add(f1, f2);

    // Dynamic Flash PointLight
    const light = new THREE.PointLight(0xffb044, 3.0, 5);
    flashGroup.add(light);

    return flashGroup;
  }

  // =========================================================================
  // INPUTS & SELECTION
  // =========================================================================
  setupInputs() {
    window.addEventListener('mousedown', (e) => {
      if (!this.player.isPointerLocked || this.player.isDead) return;
      if (e.button === 0) {
        this.isMouseDown = true;
        this.tryShoot();
      } else if (e.button === 2) {
        // Toggle Scope / ADS
        e.preventDefault();
        this.toggleScope();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.isMouseDown = false;
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      if (this.player.isDead) return;
      if (e.code === 'KeyR') this.reload();

      // Number keys 1-3 (Primary, Secondary, Knife)
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 3) {
        this.selectWeapon(keyNum - 1);
      }
    });

    // Mouse wheel weapon cycle (0, 1, 2)
    window.addEventListener('wheel', (e) => {
      if (!this.player.isPointerLocked || this.player.isDead) return;
      const delta = Math.sign(e.deltaY);
      let next = this.currentSlot + delta;
      if (next < 0) next = this.equipped.length - 1;
      if (next >= this.equipped.length) next = 0;
      this.selectWeapon(next);
    });

    // Mouse look sway tracking
    window.addEventListener('mousemove', (e) => {
      if (!this.player.isPointerLocked) return;
      const sens = (this.player.sensitivityMultiplier || 1.0) * (this.isScoped ? 0.35 : 1.0);
      const swayFactor = 0.00035 * Math.min(1.4, Math.max(0.6, sens));
      this.swayX -= e.movementX * swayFactor;
      this.swayY -= e.movementY * swayFactor;
      this.swayX = Math.max(-0.06, Math.min(0.06, this.swayX));
      this.swayY = Math.max(-0.04, Math.min(0.04, this.swayY));
    });
  }

  setLoadout(primaryId = 'ak47', secondaryId = 'pistol') {
    if (!this.allWeapons[primaryId] || !this.allWeapons[secondaryId]) return;
    this.selectedPrimaryId = primaryId;
    this.selectedSecondaryId = secondaryId;
    this.equipped = [
      this.allWeapons[primaryId],
      this.allWeapons[secondaryId],
      this.allWeapons['knife']
    ];
    this.weapons = this.equipped;
    this.selectWeapon(this.currentSlot < 3 ? this.currentSlot : 0);
  }

  selectWeapon(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.equipped.length) return;
    const targetWeapon = this.equipped[slotIndex];
    const targetMesh = this.viewmodelMeshes[targetWeapon.id];

    if (slotIndex === this.currentSlot && targetMesh && targetMesh.visible) return;
    if (this.isScoped) this.toggleScope(false);

    this.currentSlot = slotIndex;
    this.currentWeapon = targetWeapon;
    this.isReloading = false;
    this.equipAnimProgress = 0.0;

    // Toggle 3D Meshes
    Object.keys(this.viewmodelMeshes).forEach((id) => {
      this.viewmodelMeshes[id].visible = (id === targetWeapon.id);
    });

    this.sound.playMechanicalClick();
    this.updateHUD();
  }

  toggleScope(forceState = null) {
    if (!this.currentWeapon.hasScope) return;
    this.isScoped = (forceState !== null) ? forceState : !this.isScoped;

    const scopeOverlay = document.getElementById('scope-overlay');
    if (scopeOverlay) {
      scopeOverlay.style.display = this.isScoped ? 'block' : 'none';
    }

    // Toggle gun model visibility when scoped (authentic CS AWP experience)
    if (this.viewmodelMeshes[this.currentWeapon.id]) {
      this.viewmodelMeshes[this.currentWeapon.id].visible = !this.isScoped;
    }
    this.camera.fov = this.isScoped ? 24 : 78;
    this.camera.updateProjectionMatrix();

    if (this.player && this.player.setScoped) {
      this.player.setScoped(this.isScoped, this.camera.fov);
    }
  }

  // =========================================================================
  // BALLISTICS & FIRING LOGIC
  // =========================================================================
  tryShoot() {
    if (this.fireTimer > 0 || this.isReloading || this.player.isDead) return;

    if (this.currentWeapon.isMelee) {
      this.slashKnife();
      return;
    }

    if (this.currentWeapon.mag <= 0) {
      this.sound.playDryFire();
      this.reload();
      return;
    }

    this.shoot();
  }

  slashKnife() {
    const w = this.currentWeapon;
    this.fireTimer = w.fireRate; // 0.42s between slashes

    // Synthesized knife whoosh
    this.sound.playKnifeSlash();

    // Fast dynamic melee slash recoil animation
    this.recoilOffset.z -= 0.14; // thrust forward
    this.recoilOffset.x -= 0.08; // slash inward across screen
    this.recoilOffset.y += 0.03;
    this.recoilRot.z += 0.45;    // sharp blade rotation
    this.recoilRot.x -= 0.25;
    this.recoilRot.y += 0.2;

    // Network Fire Callback
    if (this.onFire) {
      this.onFire('knife');
    }

    // Raycast / proximity melee attack (2.6m reach)
    const { origin, direction } = this.player.getShootOriginAndDirection();
    this.raycaster.set(origin, direction);
    this.raycaster.near = 0.1;
    this.raycaster.far = 2.6;
    const raycaster = this.raycaster;

    let hitTarget = null;
    let closestTargetDist = Infinity;
    let isHeadshot = false;

    for (const target of this.targets) {
      if (target.isDead) continue;
      const targetMeshes = target.getHitMeshes ? target.getHitMeshes() : [target.mesh];
      const intersects = raycaster.intersectObjects(targetMeshes, true);

      if (intersects.length > 0 && intersects[0].distance < closestTargetDist) {
        closestTargetDist = intersects[0].distance;
        hitTarget = target;
        const hitPoint = intersects[0].point;
        const relativeY = hitPoint.y - target.position.y;
        const isHeadMesh = Boolean(intersects[0].object && intersects[0].object.userData && intersects[0].object.userData.isHead);
        isHeadshot = isHeadMesh || (relativeY >= 1.15);
      }
    }

    // Check map geometry collider
    const mapIntersects = raycaster.intersectObjects(this.map.colliderMeshes, false);
    const closestMapDist = (mapIntersects.length > 0) ? mapIntersects[0].distance : Infinity;

    if (hitTarget && closestTargetDist < closestMapDist) {
      let finalDamage = Math.round(isHeadshot ? (w.damage * w.headshotMult) : w.damage);
      hitTarget.takeDamage(finalDamage, this.player.position, isHeadshot);

      if (this.onTargetHit) {
        this.onTargetHit(hitTarget, finalDamage, isHeadshot);
      }

      this.sound.playKnifeHit(isHeadshot);
      this.triggerHitmarker(isHeadshot);
      this.spawnImpactSparks(origin.clone().add(direction.clone().multiplyScalar(closestTargetDist)));
    } else if (mapIntersects.length > 0 && closestMapDist <= 2.2) {
      this.sound.playMechanicalClick();
      this.spawnImpactSparks(mapIntersects[0].point);
    }

    this.updateHUD();
  }

  shoot() {
    const w = this.currentWeapon;
    w.mag--;
    this.fireTimer = w.fireRate;

    // Synthesized Sound
    this.sound.playGunshot(w.id);

    // Muzzle Flash
    this.flashTimer = 0.05;
    this.muzzleFlash.visible = true;
    const mOffset = w.muzzleOffset || new THREE.Vector3(0, 0.03, -0.6);
    this.muzzleFlash.position.copy(mOffset);
    const mScale = w.muzzleScale || 1.0;
    this.muzzleFlash.scale.setScalar(mScale);

    // Recoil Kickback
    this.recoilOffset.z += w.recoilKickZ;
    this.recoilRot.x += w.recoilPitch;
    this.recoilRot.y += (Math.random() - 0.5) * (w.recoilPitch * 0.4);

    // Network Fire Callback
    if (this.onFire) {
      this.onFire(w.id);
    }

    // Fire Raycasts (Single bullet or multi-pellet for Shotgun)
    const pelletCount = w.pellets || 1;
    for (let p = 0; p < pelletCount; p++) {
      this.fireBulletRay(w);
    }

    this.updateHUD();
  }

  fireBulletRay(w) {
    // Dynamic bullet spread based on movement
    const isMoving = Math.hypot(this.player.velocity.x, this.player.velocity.z) > 0.5;
    let spread = w.spread;
    if (isMoving) spread *= w.moveSpreadMult;
    if (this.player.isCrouching) spread *= 0.65;
    if (this.isScoped) spread = 0.0005; // Perfect accuracy when stationary scoped

    // Camera origin & direction
    const { origin, direction } = this.player.getShootOriginAndDirection();

    // Add spread deviation
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.z += (Math.random() - 0.5) * spread;
    direction.normalize();

    this.raycaster.set(origin, direction);
    this.raycaster.near = 0.1;
    this.raycaster.far = 300;
    const raycaster = this.raycaster;

    // 1. Raycast against targets (Bot/Enemy)
    let hitTarget = null;
    let closestTargetDist = Infinity;
    let isHeadshot = false;
    let isLowerBody = false;

    for (const target of this.targets) {
      if (target.isDead) continue;
      const targetMeshes = target.getHitMeshes ? target.getHitMeshes() : [target.mesh];
      const intersects = raycaster.intersectObjects(targetMeshes, true);

      if (intersects.length > 0 && intersects[0].distance < closestTargetDist) {
        closestTargetDist = intersects[0].distance;
        hitTarget = target;

        const hitPoint = intersects[0].point;
        const relativeY = hitPoint.y - target.position.y;
        const isHeadMesh = Boolean(intersects[0].object && intersects[0].object.userData && intersects[0].object.userData.isHead);

        // Headshot detection: hit spherical head or above neck level (1.15m)
        isHeadshot = isHeadMesh || (relativeY >= 1.15);

        // Lower body detection: hit lower portion of the bean model (below 0.62m)
        isLowerBody = !isHeadshot && (relativeY < 0.62);
      }
    }

    // 2. Raycast against map geometry colliders
    const mapIntersects = raycaster.intersectObjects(this.map.colliderMeshes, false);
    const closestMapDist = (mapIntersects.length > 0) ? mapIntersects[0].distance : Infinity;

    // Target is hit if closer than any obstructing wall
    if (hitTarget && closestTargetDist < closestMapDist) {
      let finalDamage = w.damage;

      if (isHeadshot) {
        finalDamage *= w.headshotMult;
      } else if (isLowerBody) {
        // Lower portion of the bean model takes reduced damage
        if (w.legDamage !== undefined) {
          finalDamage = w.legDamage;
        } else {
          finalDamage *= (w.legMult || 0.68);
        }
      }

      finalDamage = Math.round(finalDamage);

      hitTarget.takeDamage(finalDamage, this.player.position, isHeadshot);

      if (this.onTargetHit) {
        this.onTargetHit(hitTarget, finalDamage, isHeadshot);
      }

      // Tactile UI Feedback
      this.sound.playHitmarker(isHeadshot);
      this.triggerHitmarker(isHeadshot);
      this.spawnImpactSparks(origin.clone().add(direction.clone().multiplyScalar(closestTargetDist)));
    } else if (mapIntersects.length > 0) {
      // Wall / ground hit impact
      this.spawnImpactSparks(mapIntersects[0].point);
    }
  }

  triggerHitmarker(isHeadshot) {
    const hitmarker = document.getElementById('hitmarker');
    if (!hitmarker) return;

    hitmarker.className = 'active' + (isHeadshot ? ' headshot' : '');
    clearTimeout(this.hitmarkerTimeout);
    this.hitmarkerTimeout = setTimeout(() => {
      hitmarker.className = '';
    }, 120);
  }

  spawnImpactSparks(point) {
    if (!this.sparkPool || this.sparkPool.length === 0) return;
    const item = this.sparkPool[this.sparkIndex];
    this.sparkIndex = (this.sparkIndex + 1) % this.sparkPoolSize;
    item.mesh.position.copy(point);
    item.mesh.visible = true;
    item.timer = 0.08;
  }

  reload() {
    const w = this.currentWeapon;
    if (w.isMelee || this.isReloading || w.mag >= w.magSize || w.reserve <= 0) return;

    this.isReloading = true;
    this.reloadProgress = 0;
    if (this.isScoped) this.toggleScope(false);

    this.sound.playReload();

    const reloadTrack = document.getElementById('reload-track');
    if (reloadTrack) reloadTrack.classList.add('reloading');
  }

  finishReload() {
    const w = this.currentWeapon;
    const needed = w.magSize - w.mag;
    const add = Math.min(needed, w.reserve);
    w.mag += add;
    w.reserve -= add;

    this.isReloading = false;
    this.reloadProgress = 0;

    const reloadTrack = document.getElementById('reload-track');
    if (reloadTrack) reloadTrack.classList.remove('reloading');

    this.updateHUD();
  }

  resetAllAmmo() {
    // Reset magazine and reserve for every single non-melee weapon in the arsenal
    Object.values(this.allWeapons).forEach((w) => {
      if (!w.isMelee) {
        w.mag = w.magSize;
        w.reserve = (w.maxReserve !== undefined) ? w.maxReserve : (w.reserve || 90);
      }
    });

    // Reset reloading state and progress UI
    this.isReloading = false;
    this.reloadProgress = 0;
    this.isMouseDown = false;
    this.fireTimer = 0;

    const reloadTrack = document.getElementById('reload-track');
    if (reloadTrack) reloadTrack.classList.remove('reloading');
    const reloadProgress = document.getElementById('reload-progress');
    if (reloadProgress) reloadProgress.style.width = '0%';

    // Reset sniper scope if active
    if (this.isScoped) {
      this.toggleScope(false);
    } else if (this.player && this.player.setScoped) {
      this.player.setScoped(false, 78);
    }

    // Refresh HUD displays
    this.updateHUD();
  }

  // =========================================================================
  // UPDATE LOOP & VIEWMODEL ANIMATIONS
  // =========================================================================
  update(dt) {
    dt = Math.min(dt, 0.05);

    // Auto-fire handling
    if (this.currentWeapon.auto && this.isMouseDown) {
      this.tryShoot();
    }

    // Cooldown timers
    if (this.fireTimer > 0) this.fireTimer -= dt;

    // Update Spark Pool timers
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

    // Muzzle Flash Timer
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) this.muzzleFlash.visible = false;
    }

    // Reload Progress
    if (this.isReloading) {
      this.reloadProgress += dt / this.currentWeapon.reloadTime;
      const progressEl = document.getElementById('reload-progress');
      if (progressEl) {
        progressEl.style.width = `${Math.min(100, this.reloadProgress * 100)}%`;
      }
      if (this.reloadProgress >= 1.0) {
        this.finishReload();
      }
    }

    // Equip Animation
    if (this.equipAnimProgress < 1.0) {
      this.equipAnimProgress = Math.min(1.0, this.equipAnimProgress + dt * 4.5);
    }

    // Viewmodel Bobbing & Sway
    const playerSpeed = Math.hypot(this.player.velocity.x, this.player.velocity.z);
    if (this.player.isGrounded && playerSpeed > 0.1) {
      this.bobTime += dt * (this.player.isCrouching ? 8 : 14);
    } else {
      this.bobTime += dt * 1.5; // Idle breathing
    }

    const bobX = Math.sin(this.bobTime) * (playerSpeed > 0.5 ? 0.012 : 0.002);
    const bobY = Math.abs(Math.cos(this.bobTime)) * (playerSpeed > 0.5 ? 0.014 : 0.003);

    // Spring Recoil & Sway Decay
    this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), 12 * dt);
    this.recoilRot.x = THREE.MathUtils.lerp(this.recoilRot.x, 0, 14 * dt);
    this.recoilRot.y = THREE.MathUtils.lerp(this.recoilRot.y, 0, 14 * dt);
    this.swayX = THREE.MathUtils.lerp(this.swayX, 0, 8 * dt);
    this.swayY = THREE.MathUtils.lerp(this.swayY, 0, 8 * dt);

    // Assemble Viewmodel Position
    // Reload animation dip
    const reloadDip = this.isReloading ? Math.sin(this.reloadProgress * Math.PI) * 0.15 : 0;
    // Equip animation rise
    const equipOffset = (1.0 - this.equipAnimProgress) * 0.25;

    this.currentPos.x = this.restPos.x + bobX + this.swayX + this.recoilOffset.x;
    this.currentPos.y = this.restPos.y + bobY + this.swayY + this.recoilOffset.y - reloadDip - equipOffset;
    this.currentPos.z = this.restPos.z + this.recoilOffset.z;

    this.viewmodelHolder.position.copy(this.currentPos);
    this.viewmodelHolder.rotation.x = this.restRot.x + this.recoilRot.x + this.swayY;
    this.viewmodelHolder.rotation.y = this.restRot.y + this.recoilRot.y + this.swayX;

    // Crosshair spread dynamics
    this.updateCrosshairSpread(playerSpeed);
  }

  updateCrosshairSpread(speed) {
    const chTop = document.getElementById('ch-top');
    const chBottom = document.getElementById('ch-bottom');
    const chLeft = document.getElementById('ch-left');
    const chRight = document.getElementById('ch-right');
    if (!chTop) return;

    const baseSpread = 8 + (speed * 2.2) + (this.recoilOffset.z * 160);
    chTop.style.transform = `translateY(-${baseSpread}px)`;
    chBottom.style.transform = `translateY(${baseSpread}px)`;
    chLeft.style.transform = `translateX(-${baseSpread}px)`;
    chRight.style.transform = `translateX(${baseSpread}px)`;
  }

  updateHUD() {
    const ammoCurrent = document.getElementById('hud-ammo');
    const ammoReserve = document.getElementById('hud-reserve');
    const weaponName = document.getElementById('hud-weapon');

    if (this.currentWeapon.isMelee) {
      if (ammoCurrent) ammoCurrent.textContent = '—';
      if (ammoReserve) ammoReserve.textContent = '—';
    } else {
      if (ammoCurrent) ammoCurrent.textContent = this.currentWeapon.mag;
      if (ammoReserve) ammoReserve.textContent = this.currentWeapon.reserve;
    }
    if (weaponName) weaponName.textContent = this.currentWeapon.name;

    // Update active slot silhouette in weapon rack
    const rackSlots = document.querySelectorAll('.rack-slot');
    rackSlots.forEach((slot) => {
      const slotId = parseInt(slot.getAttribute('data-slot'), 10);
      slot.classList.toggle('active', slotId === this.currentSlot);
    });
  }
}
