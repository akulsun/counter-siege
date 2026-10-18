import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generators
 * Ensures zero external image requests while delivering rich tactile materials.
 */
/**
 * Fast direct-buffer noise generator for procedural textures.
 * Replaces thousands of slow canvas 2D fillRect calls with instant typed array access.
 */
function applyNoise(ctx, width, height, count, intensity = 28) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let n = 0; n < count; n++) {
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

function createSandstoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base sun-baked tone
  ctx.fillStyle = '#c8b693';
  ctx.fillRect(0, 0, 512, 512);

  // Brick/block patterns
  ctx.strokeStyle = 'rgba(100, 85, 65, 0.25)';
  ctx.lineWidth = 3;
  const rows = 8;
  const rowHeight = 512 / rows;

  for (let i = 0; i < rows; i++) {
    const y = i * rowHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    const cols = 4;
    const colWidth = 512 / cols;
    const offset = (i % 2) * (colWidth / 2);
    for (let j = 0; j <= cols + 1; j++) {
      const x = j * colWidth - offset;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowHeight);
      ctx.stroke();
    }
  }

  // Fast direct micro-noise grain
  applyNoise(ctx, 512, 512, 6000, 24);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createGroundTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d8b172'; // Ochre sand
  ctx.fillRect(0, 0, 512, 512);

  // Large subtle flagstone pavers
  ctx.strokeStyle = 'rgba(95, 75, 45, 0.2)';
  ctx.lineWidth = 4;
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(512, x);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Fast direct sand grit
  applyNoise(ctx, 512, 512, 8000, 28);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

function createCrateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark wood plank base
  ctx.fillStyle = '#7c5432';
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal wood planks
  ctx.strokeStyle = '#4e331c';
  ctx.lineWidth = 4;
  for (let y = 32; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Outer framing
  ctx.fillStyle = '#5c3d22';
  ctx.fillRect(0, 0, 256, 16);
  ctx.fillRect(0, 240, 256, 16);
  ctx.fillRect(0, 0, 16, 256);
  ctx.fillRect(240, 0, 16, 256);

  // Diagonal brace
  ctx.strokeStyle = '#5c3d22';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(16, 16);
  ctx.lineTo(240, 240);
  ctx.stroke();

  // Metal corner brackets
  ctx.fillStyle = '#2b2622';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillRect(224, 0, 32, 32);
  ctx.fillRect(0, 224, 32, 32);
  ctx.fillRect(224, 224, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createSandCrateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Light bleached sandstone / composite military crate base
  ctx.fillStyle = '#ded5be';
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal plank divisions
  ctx.strokeStyle = '#b8ad91';
  ctx.lineWidth = 3;
  for (let y = 32; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Outer framing
  ctx.fillStyle = '#c7bca1';
  ctx.fillRect(0, 0, 256, 16);
  ctx.fillRect(0, 240, 256, 16);
  ctx.fillRect(0, 0, 16, 256);
  ctx.fillRect(240, 0, 16, 256);

  // Diagonal brace
  ctx.strokeStyle = '#c7bca1';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(16, 16);
  ctx.lineTo(240, 240);
  ctx.stroke();

  // Metal corner brackets
  ctx.fillStyle = '#786e58';
  ctx.fillRect(0, 0, 30, 30);
  ctx.fillRect(226, 0, 30, 30);
  ctx.fillRect(0, 226, 30, 30);
  ctx.fillRect(226, 226, 30, 30);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createDomeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep royal/lapis blue base
  ctx.fillStyle = '#265487';
  ctx.fillRect(0, 0, 512, 512);

  // Islamic diamond trellis pattern in white/cream
  ctx.strokeStyle = 'rgba(235, 245, 255, 0.85)';
  ctx.lineWidth = 4;

  const step = 64;
  for (let x = -512; x <= 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 512, 512);
    ctx.stroke();
  }

  // Golden star/floral motifs at intersections
  ctx.fillStyle = '#f0c75e';
  for (let x = 0; x <= 512; x += step) {
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3);
  return texture;
}

function createBlueTrimTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Vibrant sky-blue tone as in the reference photo
  ctx.fillStyle = '#3a78ab';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle weathering and plaster bands
  ctx.strokeStyle = '#2b5f88';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.lineTo(256, 32);
  ctx.moveTo(0, 224);
  ctx.lineTo(256, 224);
  ctx.stroke();

  // Fast direct noise grain
  applyNoise(ctx, 256, 256, 3000, 22);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export class GameMap {
  constructor(scene) {
    this.scene = scene;
    this.colliders = []; // Array of THREE.Box3 objects
    this.colliderMeshes = []; // Meshes for weapon raycast hits
    this.occluderMeshes = []; // Primary occluders for fast Bot line-of-sight & visibility tests

    // Height levels:
    // Lower level (Sunken Pit with the Car): Y = 0.0m
    // Upper level (Spawns, Courtyards, Flanks): Y = 1.6m
    this.upperLevelY = 1.6;

    // Spawns located on Upper Level (Y = 1.6m) behind massive defensive bastions
    this.playerSpawn = new THREE.Vector3(0, this.upperLevelY, 19.5);
    this.botSpawn = new THREE.Vector3(0, this.upperLevelY, -19.5);

    // Procedural Materials
    this.sandstoneTex = createSandstoneTexture();
    this.groundTex = createGroundTexture();
    this.crateTex = createCrateTexture();
    this.sandCrateTex = createSandCrateTexture();
    this.domeTex = createDomeTexture();
    this.blueTrimTex = createBlueTrimTexture();

    this.materials = {
      ground: new THREE.MeshStandardMaterial({
        map: this.groundTex,
        roughness: 0.9,
        metalness: 0.05
      }),
      wall: new THREE.MeshStandardMaterial({
        map: this.sandstoneTex,
        roughness: 0.85,
        metalness: 0.02
      }),
      crate: new THREE.MeshStandardMaterial({
        map: this.crateTex,
        roughness: 0.7,
        metalness: 0.1
      }),
      sandCrate: new THREE.MeshStandardMaterial({
        map: this.sandCrateTex,
        roughness: 0.75,
        metalness: 0.05
      }),
      blueTrim: new THREE.MeshStandardMaterial({
        map: this.blueTrimTex,
        roughness: 0.65,
        metalness: 0.1
      }),
      domeMat: new THREE.MeshStandardMaterial({
        map: this.domeTex,
        roughness: 0.35,
        metalness: 0.25
      }),
      goldFinial: new THREE.MeshStandardMaterial({
        color: 0xe0b343,
        roughness: 0.2,
        metalness: 0.85
      }),
      archTrim: new THREE.MeshStandardMaterial({
        color: 0xd6c29e,
        roughness: 0.75
      }),
      metalDoors: new THREE.MeshStandardMaterial({
        color: 0x51585d,
        metalness: 0.75,
        roughness: 0.45
      }),
      carBody: new THREE.MeshStandardMaterial({
        color: 0x56828c, // Dusty teal / cyan from photo
        roughness: 0.35,
        metalness: 0.4
      }),
      carGlass: new THREE.MeshStandardMaterial({
        color: 0x18242a,
        roughness: 0.1,
        metalness: 0.9
      }),
      carTire: new THREE.MeshStandardMaterial({
        color: 0x181818,
        roughness: 0.85
      }),
      carChrome: new THREE.MeshStandardMaterial({
        color: 0xd8e0e6,
        roughness: 0.2,
        metalness: 0.95
      })
    };

    this.buildLighting();
    this.buildArena();
  }

  buildLighting() {
    // Ambient light simulating sky bounce
    const ambientLight = new THREE.AmbientLight(0xd4cbb8, 0.65);
    this.scene.add(ambientLight);

    // Desert Sun (Directional Light with sharp shadows, optimized default map size 1024)
    this.sunLight = new THREE.DirectionalLight(0xfff1d6, 1.4);
    this.sunLight.position.set(25, 45, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;

    const d = 34;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;

    this.scene.add(this.sunLight);

    // Hemisphere light for natural sky/ground gradient
    const hemiLight = new THREE.HemisphereLight(0x90b0d8, 0x8a6f4d, 0.4);
    this.scene.add(hemiLight);
  }

  applyGraphicsQuality(quality) {
    if (!this.sunLight) return;
    if (quality === 'low') {
      this.sunLight.castShadow = false;
    } else if (quality === 'medium') {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(512, 512);
      if (this.sunLight.shadow.map) {
        this.sunLight.shadow.map.dispose();
        this.sunLight.shadow.map = null;
      }
    } else { // high
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(1024, 1024);
      if (this.sunLight.shadow.map) {
        this.sunLight.shadow.map.dispose();
        this.sunLight.shadow.map = null;
      }
    }
  }

  addSolidBox(x, y, z, width, height, depth, material, isTrigger = false, castShadow = true, isOccluder = true) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.scene.add(mesh);

    if (!isTrigger) {
      const box = new THREE.Box3();
      box.setFromObject(mesh);
      this.colliders.push(box);
      this.colliderMeshes.push(mesh);
      if (isOccluder) {
        this.occluderMeshes.push(mesh);
      }
    }

    return mesh;
  }

  buildArena() {
    const groundSize = 56;
    // Lower Base Floor Plane (Sunken Pit Floor at Y = 0.0)
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMesh = new THREE.Mesh(groundGeo, this.materials.ground);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    groundMesh.matrixAutoUpdate = false;
    groundMesh.updateMatrix();
    this.scene.add(groundMesh);
    this.colliderMeshes.push(groundMesh);

    // =========================================================================
    // 1. UPPER LEVEL FLOOR PLATFORMS (Y = 1.6m)
    // The rest of the map is raised 1.6m above the compact sunken center pit!
    // =========================================================================
    const uY = this.upperLevelY; // 1.6m

    // South Spawn Plateau (Z = 7.5 to 24.5, X = -11.5 to 11.5)
    this.addSolidBox(0, uY / 2, 16.0, 23, uY, 17.0, this.materials.ground);

    // North Spawn Plateau (Z = -24.5 to -7.5, X = -11.5 to 11.5)
    this.addSolidBox(0, uY / 2, -16.0, 23, uY, 17.0, this.materials.ground);

    // West Flank Corridor Platform (Z = -7.5 to 7.5, X = -8.7 to -4.2, width = 4.5m)
    this.addSolidBox(-6.45, uY / 2, 0, 4.5, uY, 15.0, this.materials.ground);

    // East Flank Corridor Platform (Z = -7.5 to 7.5, X = 4.2 to 8.7, width = 4.5m)
    this.addSolidBox(6.45, uY / 2, 0, 4.5, uY, 15.0, this.materials.ground);

    // =========================================================================
    // 2. STAIRS CONNECTING UPPER LEVEL (Y = 1.6m) TO COMPACT SUNKEN PIT (Y = 0.0)
    // =========================================================================
    // South Stairs (from Z = 7.5 down to Z = 5.5, width = 8.0m)
    this.buildPitStairs(6.5, 1, 8.0);

    // North Stairs (from Z = -7.5 down to Z = -5.5, width = 8.0m)
    this.buildPitStairs(-6.5, -1, 8.0);

    // =========================================================================
    // 3. COMPACT SUNKEN PIT CONTINUOUS RETAINING WALLS & BALUSTRADES
    // Pit floor: 11.0m long (Z = -5.5 to 5.5), 8.4m wide (X = -4.2 to 4.2).
    // Full 2.45m wall from inside pit, waist-high 0.85m balustrade from upper flanks!
    // Continuous solid sandstone wall along Z = [-5.5, 5.5] matching original photo!
    // =========================================================================
    const pitWallH = 2.45;
    const pitWallThick = 0.5;

    // West Pit Retaining Wall along X = -4.2 (continuous 11.0m length)
    this.addSolidBox(-4.2, pitWallH / 2, 0, pitWallThick, pitWallH, 11.0, this.materials.wall);
    this.addSolidBox(-4.2, pitWallH + 0.06, 0, pitWallThick + 0.15, 0.12, 11.2, this.materials.archTrim);

    // East Pit Retaining Wall along X = 4.2 (continuous 11.0m length)
    this.addSolidBox(4.2, pitWallH / 2, 0, pitWallThick, pitWallH, 11.0, this.materials.wall);
    this.addSolidBox(4.2, pitWallH + 0.06, 0, pitWallThick + 0.15, 0.12, 11.2, this.materials.archTrim);

    // Entrance corner pillars at the 4 stairs corners of the sunken pit
    this.addSolidBox(-4.2, 1.35, -5.5, 0.75, 2.7, 0.75, this.materials.archTrim);
    this.addSolidBox(4.2, 1.35, -5.5, 0.75, 2.7, 0.75, this.materials.archTrim);
    this.addSolidBox(-4.2, 1.35, 5.5, 0.75, 2.7, 0.75, this.materials.archTrim);
    this.addSolidBox(4.2, 1.35, 5.5, 0.75, 2.7, 0.75, this.materials.archTrim);

    // =========================================================================
    // 4. THE SEDAN CAR (SITTING DOWN ON THE SUNKEN PIT FLOOR AT Y = 0.0)
    // =========================================================================
    this.buildSedanCar(0, 0, 0, -0.58);

    // Tactical Crates inside the Sunken Pit
    // Tucked against the retaining walls leaving wide direct passage past the car on both sides!
    this.spawnCrateStack(-2.9, 0, -3.5, 1, 2);
    this.spawnCrateStack(2.9, 0, 3.5, 1, 2);

    // =========================================================================
    // 5. NARROWER OUTSIDE FLANK PERIMETER WALLS
    // Center flank corridor narrowed to 4.05m (X = +-8.5), tightly matching photo!
    // Spawns taper smoothly into the narrow flank corridors at the minaret towers.
    // =========================================================================
    const wallH = 8.1;
    const wallThick = 2.0;

    // North Wall Center Flat (Z = -24, X = [-6, 6])
    this.addSolidBox(0, wallH / 2, -24 - wallThick / 2, 12, wallH, wallThick, this.materials.wall);
    this.addSolidBox(0, wallH + 0.25, -24 - wallThick / 2, 12.4, 0.5, wallThick + 0.4, this.materials.blueTrim, false, false, false);

    // South Wall Center Flat (Z = 24, X = [-6, 6])
    this.addSolidBox(0, wallH / 2, 24 + wallThick / 2, 12, wallH, wallThick, this.materials.wall);
    this.addSolidBox(0, wallH + 0.25, 24 + wallThick / 2, 12.4, 0.5, wallThick + 0.4, this.materials.blueTrim, false, false, false);

    // Spawn 45-degree Corner Chamfers
    this.buildCornerChamfer(-6, -24, -11.2, -18.0, wallH);
    this.buildCornerChamfer(6, -24, 11.2, -18.0, wallH);
    this.buildCornerChamfer(-6, 24, -11.2, 18.0, wallH);
    this.buildCornerChamfer(6, 24, 11.2, 18.0, wallH);

    // Spawn Straight Outer Walls (Z = +-12.0 to +-18.0, X = +-11.2)
    this.addSolidBox(-11.2 - wallThick / 2, wallH / 2, 15.0, wallThick, wallH, 6.0, this.materials.wall);
    this.addSolidBox(-11.2 - wallThick / 2, wallH + 0.25, 15.0, wallThick + 0.4, 0.5, 6.4, this.materials.blueTrim, false, false, false);
    this.addSolidBox(11.2 + wallThick / 2, wallH / 2, 15.0, wallThick, wallH, 6.0, this.materials.wall);
    this.addSolidBox(11.2 + wallThick / 2, wallH + 0.25, 15.0, wallThick + 0.4, 0.5, 6.4, this.materials.blueTrim, false, false, false);

    this.addSolidBox(-11.2 - wallThick / 2, wallH / 2, -15.0, wallThick, wallH, 6.0, this.materials.wall);
    this.addSolidBox(-11.2 - wallThick / 2, wallH + 0.25, -15.0, wallThick + 0.4, 0.5, 6.4, this.materials.blueTrim, false, false, false);
    this.addSolidBox(11.2 + wallThick / 2, wallH / 2, -15.0, wallThick, wallH, 6.0, this.materials.wall);
    this.addSolidBox(11.2 + wallThick / 2, wallH + 0.25, -15.0, wallThick + 0.4, 0.5, 6.4, this.materials.blueTrim, false, false, false);

    // Taper Walls: narrowing smoothly from X = +-11.2 down to X = +-8.5 into the center corridor
    this.buildCornerChamfer(-11.2, -12.0, -8.5, -7.5, wallH);
    this.buildCornerChamfer(11.2, -12.0, 8.5, -7.5, wallH);
    this.buildCornerChamfer(-11.2, 12.0, -8.5, 7.5, wallH);
    this.buildCornerChamfer(11.2, 12.0, 8.5, 7.5, wallH);

    // Narrow Center Flank Corridor Walls (Z = -7.5 to 7.5, depth = 15.0m, X = +-8.5)
    // Creates a tight 4.05m wide corridor with high walls!
    this.addSolidBox(-8.5 - wallThick / 2, wallH / 2, 0, wallThick, wallH, 15.0, this.materials.wall);
    this.addSolidBox(-8.5 - wallThick / 2, wallH + 0.25, 0, wallThick + 0.4, 0.5, 15.4, this.materials.blueTrim, false, false, false);

    this.addSolidBox(8.5 + wallThick / 2, wallH / 2, 0, wallThick, wallH, 15.0, this.materials.wall);
    this.addSolidBox(8.5 + wallThick / 2, wallH + 0.25, 0, wallThick + 0.4, 0.5, 15.4, this.materials.blueTrim, false, false, false);

    // Back Spawn Hangar Doors (Mounted at upper level Y = 1.6m)
    this.addSolidBox(0, uY + 2.2, 23.8, 8.4, 4.4, 0.4, this.materials.metalDoors);
    this.addSolidBox(0, uY + 4.6, 23.8, 9.2, 0.5, 0.6, this.materials.archTrim, false, false, false);

    this.addSolidBox(0, uY + 2.2, -23.8, 8.4, 4.4, 0.4, this.materials.metalDoors);
    this.addSolidBox(0, uY + 4.6, -23.8, 9.2, 0.5, 0.6, this.materials.archTrim, false, false, false);

    // =========================================================================
    // 6. 4 BLUE MINARET DOMES (Mounted on Perimeter Wall Junctions at X = +-9.2, Z = +-7.5)
    // =========================================================================
    this.buildMinaretDome(-9.2, wallH, -7.5);
    this.buildMinaretDome(-9.2, wallH, 7.5);
    this.buildMinaretDome(9.2, wallH, -7.5);
    this.buildMinaretDome(9.2, wallH, 7.5);

    this.buildWallAlcove(-8.5, -7.5, uY);
    this.buildWallAlcove(-8.5, 7.5, uY);
    this.buildWallAlcove(8.5, -7.5, uY);
    this.buildWallAlcove(8.5, 7.5, uY);

    // =========================================================================
    // 7. PROTECTED SPAWNS & DEFENSIVE BASTIONS (AT UPPER LEVEL Y = 1.6m)
    // =========================================================================
    // South Spawn Barrier (Z = 14.0, Y = 1.6m) - Exactly 6 crates in 3x2 format
    this.buildSpawnDefensiveBastion(0, 14.0, uY);

    // North Spawn Barrier (Z = -14.0, Y = 1.6m) - Exactly 6 crates in 3x2 format
    this.buildSpawnDefensiveBastion(0, -14.0, uY);

    // Spawn corner crates on upper level
    this.spawnCrateStack(-8.2, uY, 19.5, 1, 2);
    this.spawnCrateStack(7.2, uY, 19.5, 1, 2);
    this.spawnCrateStack(-8.2, uY, -19.5, 1, 2);
    this.spawnCrateStack(7.2, uY, -19.5, 1, 2);

    // =========================================================================
    // 8. TIGHT FLANK T-SHAPED COVERS (IN NARROW CORRIDORS AT X = +-6.475)
    // Leaves tight 1.35m peeking lanes on each side for close-quarters firefights!
    // =========================================================================
    this.buildFlankTCover(-6.475, 0, uY);
    this.buildFlankTCover(6.475, 0, uY);
  }

  buildCornerChamfer(x1, z1, x2, z2, height) {
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      const x = x1 + (x2 - x1) * t;
      const z = z1 + (z2 - z1) * t;
      this.addSolidBox(x, height / 2, z, 2.8, height, 2.8, this.materials.wall, false, true, true);
      this.addSolidBox(x, height + 0.25, z, 3.0, 0.5, 3.0, this.materials.blueTrim, false, false, false);
    }
  }

  buildWallAlcove(wallX, centerZ, baseY) {
    const isWest = wallX < 0;
    const alcoveFrameMat = this.materials.archTrim;
    const pillarX = isWest ? (wallX + 0.3) : (wallX - 0.3);

    this.addSolidBox(pillarX, baseY + 3.0, centerZ - 2.2, 0.5, 6.0, 0.6, alcoveFrameMat, false, false, false);
    this.addSolidBox(pillarX, baseY + 3.0, centerZ + 2.2, 0.5, 6.0, 0.6, alcoveFrameMat, false, false, false);
    this.addSolidBox(pillarX, baseY + 5.8, centerZ, 0.5, 0.6, 4.4, alcoveFrameMat, false, false, false);
  }

  buildMinaretDome(x, y, z) {
    const domeGroup = new THREE.Group();
    domeGroup.position.set(x, y, z);

    // 1. Octagonal Drum Plinth
    const plinthGeo = new THREE.CylinderGeometry(2.3, 2.4, 0.9, 16);
    const plinthMesh = new THREE.Mesh(plinthGeo, this.materials.wall);
    plinthMesh.position.y = 0.45;
    plinthMesh.castShadow = true;
    domeGroup.add(plinthMesh);

    // Sky-blue decorative molding under dome
    const corniceGeo = new THREE.CylinderGeometry(2.45, 2.3, 0.35, 16);
    const corniceMesh = new THREE.Mesh(corniceGeo, this.materials.blueTrim);
    corniceMesh.position.y = 1.0;
    domeGroup.add(corniceMesh);

    // 2. Patterned Blue Onion/Hemisphere Dome
    const domeGeo = new THREE.SphereGeometry(2.1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const domeMesh = new THREE.Mesh(domeGeo, this.materials.domeMat);
    domeMesh.position.y = 1.1;
    domeMesh.scale.set(1.0, 1.25, 1.0); // Islamic dome vertical stretch
    domeMesh.castShadow = true;
    domeGroup.add(domeMesh);

    // 3. Golden Spire Finial & Crescent on Apex
    const spireGeo = new THREE.CylinderGeometry(0.06, 0.22, 1.8, 12);
    const spireMesh = new THREE.Mesh(spireGeo, this.materials.goldFinial);
    spireMesh.position.y = 3.9;
    domeGroup.add(spireMesh);

    // Golden Spherical Orbs on Spire
    const orb1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), this.materials.goldFinial);
    orb1.position.y = 3.3;
    const orb2 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), this.materials.goldFinial);
    orb2.position.y = 4.3;
    const finialTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 8), this.materials.goldFinial);
    finialTip.position.y = 4.9;
    domeGroup.add(orb1, orb2, finialTip);

    domeGroup.traverse((child) => {
      if (child.isMesh) {
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      }
    });
    domeGroup.matrixAutoUpdate = false;
    domeGroup.updateMatrix();

    this.scene.add(domeGroup);
    this.colliderMeshes.push(plinthMesh, domeMesh);
    this.occluderMeshes.push(plinthMesh);
  }

  buildSpawnDefensiveBastion(centerX, centerZ, baseY) {
    const size = 1.6;

    // Bottom tier: 3 separate crates side by side (sitting on baseY)
    const y1 = baseY + size * 0.5;
    this.addSolidBox(centerX - size, y1, centerZ, size, size, size, this.materials.sandCrate);
    this.addSolidBox(centerX, y1, centerZ, size, size, size, this.materials.sandCrate);
    this.addSolidBox(centerX + size, y1, centerZ, size, size, size, this.materials.sandCrate);

    // Top tier: 3 separate crates stacked directly on top (3x2 format total, reaching 3.2m above floor)
    const y2 = baseY + size * 1.5;
    this.addSolidBox(centerX - size, y2, centerZ, size, size, size, this.materials.sandCrate);
    this.addSolidBox(centerX, y2, centerZ, size, size, size, this.materials.sandCrate);
    this.addSolidBox(centerX + size, y2, centerZ, size, size, size, this.materials.sandCrate);
  }

  buildPitStairs(centerZ, dir, stepW = 8.0) {
    // dir = 1 (South stairs down toward -Z), dir = -1 (North stairs down toward +Z)
    // Connecting Upper level (Y = 1.6) to Sunken Pit (Y = 0.0)
    // 5 progressive steps: each drop is <= 0.33m, within stepHeight = 0.4m
    const stepLen = 0.4;

    // Step heights from top (1.6m) down to floor (0.0m) - disable shadows and occluder checks for step strips
    const heights = [1.30, 0.98, 0.65, 0.35, 0.12];
    for (let i = 0; i < heights.length; i++) {
      const h = heights[i];
      const z = centerZ + dir * (0.8 - i * stepLen);
      this.addSolidBox(0, h / 2, z, stepW, h, stepLen, this.materials.archTrim, false, false, false);
    }
  }


  buildSedanCar(x, y, z, yaw) {
    const carGroup = new THREE.Group();
    carGroup.position.set(x, y, z);
    carGroup.rotation.y = yaw;

    // 1. Lower Chassis / Body (at bottom of sunken pit)
    const chassisGeo = new THREE.BoxGeometry(2.0, 0.58, 4.4);
    const chassisMesh = new THREE.Mesh(chassisGeo, this.materials.carBody);
    chassisMesh.position.y = 0.54;
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    carGroup.add(chassisMesh);

    // 2. Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.68, 0.62, 2.3);
    const cabinMesh = new THREE.Mesh(cabinGeo, this.materials.carBody);
    cabinMesh.position.set(0, 1.14, -0.2);
    cabinMesh.castShadow = true;
    cabinMesh.receiveShadow = true;
    carGroup.add(cabinMesh);

    // 3. Front Windshield (Angled tinted glass)
    const frontGlassGeo = new THREE.BoxGeometry(1.56, 0.52, 0.08);
    const frontGlass = new THREE.Mesh(frontGlassGeo, this.materials.carGlass);
    frontGlass.position.set(0, 1.05, 0.98);
    frontGlass.rotation.x = 0.45;
    carGroup.add(frontGlass);

    // 4. Rear Windshield
    const rearGlassGeo = new THREE.BoxGeometry(1.56, 0.48, 0.08);
    const rearGlass = new THREE.Mesh(rearGlassGeo, this.materials.carGlass);
    rearGlass.position.set(0, 1.05, -1.38);
    rearGlass.rotation.x = -0.45;
    carGroup.add(rearGlass);

    // 5. Side Windows
    const sideGlassGeo = new THREE.BoxGeometry(1.72, 0.36, 1.8);
    const sideGlass = new THREE.Mesh(sideGlassGeo, this.materials.carGlass);
    sideGlass.position.set(0, 1.15, -0.2);
    carGroup.add(sideGlass);

    // 6. Chrome Bumpers
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.22, 0.24), this.materials.carChrome);
    frontBumper.position.set(0, 0.36, 2.22);
    carGroup.add(frontBumper);

    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.22, 0.24), this.materials.carChrome);
    rearBumper.position.set(0, 0.36, -2.22);
    carGroup.add(rearBumper);

    // 7. Headlights
    const headlightMat = new THREE.MeshStandardMaterial({ color: 0xfff6cf, roughness: 0.2, metalness: 0.8 });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08), headlightMat);
    hl1.position.set(-0.68, 0.56, 2.22);
    const hl2 = hl1.clone();
    hl2.position.set(0.68, 0.56, 2.22);
    carGroup.add(hl1, hl2);

    // 8. 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelPositions = [
      [-1.02, 0.38, 1.3],
      [1.02, 0.38, 1.3],
      [-1.02, 0.38, -1.3],
      [1.02, 0.38, -1.3]
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, this.materials.carTire);
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      carGroup.add(wheel);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 8), this.materials.carChrome);
      hub.position.set(wx, wy, wz);
      hub.rotation.z = Math.PI / 2;
      carGroup.add(hub);
    });

    carGroup.traverse((child) => {
      if (child.isMesh) {
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      }
    });
    carGroup.matrixAutoUpdate = false;
    carGroup.updateMatrix();

    this.scene.add(carGroup);
    this.colliderMeshes.push(chassisMesh, cabinMesh);
    this.occluderMeshes.push(chassisMesh, cabinMesh);

    // Solid colliders for player physics covering the car
    const carBox = new THREE.Box3();
    carBox.setFromObject(carGroup);
    carBox.min.x += 0.15;
    carBox.max.x -= 0.15;
    carBox.min.z += 0.15;
    carBox.max.z -= 0.15;
    this.colliders.push(carBox);
  }

  buildFlankTCover(centerX, centerZ, baseY) {
    // Stepped T-shaped cover block on the narrow upper flank corridor (corridor width 4.05m)
    // Central high block
    this.addSolidBox(centerX, baseY + 0.95, centerZ, 1.35, 1.9, 1.4, this.materials.sandCrate);

    // Front/Back wing blocks creating the T-shape cleanly (leaves 1.35m peeking lanes on each side)
    this.addSolidBox(centerX, baseY + 0.68, centerZ + 1.1, 0.95, 1.35, 0.8, this.materials.sandCrate);
    this.addSolidBox(centerX, baseY + 0.68, centerZ - 1.1, 0.95, 1.35, 0.8, this.materials.sandCrate);
  }

  spawnCrateStack(baseX, baseY, baseZ, cols = 1, rows = 1) {
    const size = 1.6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = baseX + c * size;
        const y = baseY + (r + 0.5) * size;
        const z = baseZ;
        this.addSolidBox(x, y, z, size, size, size, this.materials.crate);
      }
    }
  }

  spawnSandCrateStack(baseX, baseY, baseZ, cols = 1, rows = 1) {
    const size = 1.6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = baseX + c * size;
        const y = baseY + (r + 0.5) * size;
        const z = baseZ;
        this.addSolidBox(x, y, z, size, size, size, this.materials.sandCrate);
      }
    }
  }

  /**
   * Fast AABB check against player bounding box.
   * Returns list of intersecting colliders.
   */
  getCollisions(playerBox) {
    const hits = [];
    for (let i = 0; i < this.colliders.length; i++) {
      if (playerBox.intersectsBox(this.colliders[i])) {
        hits.push(this.colliders[i]);
      }
    }
    return hits;
  }
}
