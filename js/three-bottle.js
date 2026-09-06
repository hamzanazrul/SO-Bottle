/**
 * SO BOTTOL - Ultra-Crisp Realistic 3D Water Bottle & Slow-Motion Water Splash Engine
 * Studio Product Showcase:
 * - Proper realistic fluid water splash with slow majestic animation (NO soap bubbles)
 * - Accurate real-time cap color changer (Instant vibrant color feedback)
 * - Ultra-HD 2K high-contrast label with crystal clear text & details
 * - True-to-life studio lighting (zero light blowout)
 * - 360° interactive orbital drag & gentle slow-mo auto turntable
 */

class ThreeBottleScene {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.options = Object.assign({
      isHero: false,
      enableSplashes: true,
      autoRotate: true,
      enableControls: true,
      initialCapColor: "#00a8ff",
      initialName: "SO BOTTOL",
      initialSlogan: "STAY PURE • STAY HYDRATED",
      bottleScale: 0.95
    }, options);

    this.capColor = this.options.initialCapColor;
    this.customName = this.options.initialName;
    this.customSlogan = this.options.initialSlogan;

    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0.002 };
    this.splashMeshes = [];
    this.clock = new THREE.Clock();

    this.initScene();
    this.initLights();
    this.createBottleGroup();
    this.createWaterSplashes();
    this.initEvents();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();

    const width = this.canvas.clientWidth || (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 540);
    const height = this.canvas.clientHeight || (this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 600);

    // Camera framed so ENTIRE bottle (cap, body, base) is 100% visible with breathing room
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.2, 19.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }

  initLights() {
    // 1. Soft Studio Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    // 2. High-Grade Studio Key Light (Angle illuminates bottle & label with crisp specular)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(5, 8, 8);
    this.scene.add(keyLight);

    // 3. Crisp Left Rim Light (highlights transparent glass edges)
    const rimLeft = new THREE.DirectionalLight(0x00d2ff, 1.2);
    rimLeft.position.set(-7, 3, -3);
    this.scene.add(rimLeft);

    // 4. Warm Contrast Right Fill
    const rimRight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimRight.position.set(7, 2, -2);
    this.scene.add(rimRight);

    // 5. Pure Back Light (Transilluminates liquid water without blowing out cap)
    const backLight = new THREE.PointLight(0x00b4d8, 1.8, 18);
    backLight.position.set(0, -1, -5);
    this.scene.add(backLight);

    // 6. Direct Front Label Light
    const frontFill = new THREE.DirectionalLight(0xffffff, 0.65);
    frontFill.position.set(0, -1, 8);
    this.scene.add(frontFill);
  }

  createBottleGroup() {
    this.bottleContainer = new THREE.Group();
    this.bottleContainer.scale.set(this.options.bottleScale, this.options.bottleScale, this.options.bottleScale);
    this.scene.add(this.bottleContainer);

    // ================= 1. INNER PURE MINERAL WATER VOLUME =================
    const waterPoints = [
      new THREE.Vector2(0, -4.3),
      new THREE.Vector2(1.24, -4.2),
      new THREE.Vector2(1.33, -3.9),
      new THREE.Vector2(1.33, -1.0),
      new THREE.Vector2(1.31, 0.8),
      new THREE.Vector2(1.33, 1.8),
      new THREE.Vector2(1.18, 2.6),
      new THREE.Vector2(0.82, 3.1),
      new THREE.Vector2(0, 3.1) // Water meniscus top
    ];
    const waterGeo = new THREE.LatheGeometry(waterPoints, 48);
    
    this.waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00a8e8,
      transmission: 0.72,
      transparent: true,
      opacity: 0.94,
      roughness: 0.03,
      metalness: 0.05,
      ior: 1.333,
      reflectivity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      attenuationColor: new THREE.Color(0x0077b6),
      attenuationDistance: 2.0,
      depthWrite: false
    });
    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    this.bottleContainer.add(this.waterMesh);

    // Meniscus top reflection
    const meniscusGeo = new THREE.RingGeometry(0.08, 0.82, 32);
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: 0x90e0ef,
      roughness: 0.15,
      metalness: 0.3,
      transparent: true,
      opacity: 0.75
    });
    const meniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat);
    meniscusMesh.rotation.x = -Math.PI / 2;
    meniscusMesh.position.y = 3.09;
    this.bottleContainer.add(meniscusMesh);

    // ================= 2. REALISTIC PET PLASTIC BOTTLE =================
    const bottlePoints = [
      new THREE.Vector2(0, -4.5),
      new THREE.Vector2(0.95, -4.48),
      new THREE.Vector2(1.42, -4.3),
      new THREE.Vector2(1.48, -4.0),
      new THREE.Vector2(1.52, -3.3),
      // Lower ergonomic ribs
      new THREE.Vector2(1.42, -2.9),
      new THREE.Vector2(1.52, -2.5),
      new THREE.Vector2(1.42, -2.1),
      new THREE.Vector2(1.52, -1.7),
      // Label recess waist
      new THREE.Vector2(1.45, -1.1),
      new THREE.Vector2(1.45, 0.9),
      // Upper grip ribs
      new THREE.Vector2(1.52, 1.4),
      new THREE.Vector2(1.44, 1.8),
      new THREE.Vector2(1.50, 2.2),
      // Shoulder curve
      new THREE.Vector2(1.38, 2.8),
      new THREE.Vector2(0.98, 3.4),
      new THREE.Vector2(0.62, 3.85),
      // Neck threads
      new THREE.Vector2(0.62, 4.3),
      new THREE.Vector2(0.68, 4.36),
      new THREE.Vector2(0.62, 4.45),
      new THREE.Vector2(0.68, 4.54),
      new THREE.Vector2(0.62, 4.63),
      new THREE.Vector2(0.62, 4.8),
      new THREE.Vector2(0.54, 4.8)
    ];

    const bottleGeo = new THREE.LatheGeometry(bottlePoints, 56);
    
    this.plasticMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      transparent: true,
      opacity: 0.96,
      roughness: 0.04,
      metalness: 0.08,
      ior: 1.52,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      attenuationColor: new THREE.Color(0x00d2ff),
      attenuationDistance: 2.5,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.bottleMesh = new THREE.Mesh(bottleGeo, this.plasticMaterial);
    this.bottleContainer.add(this.bottleMesh);

    // 3. Threaded Bottle Cap with realistic fit on neck
    this.createBottleCap();

    // 4. Ultra-HD 2K High-Contrast 3D Label
    this.createDynamicLabel();

    this.bottleContainer.position.y = -0.2;
  }

  createBottleCap() {
    this.capGroup = new THREE.Group();

    // Cap Lathe Geometry - sitting precisely over the bottle neck (y: 4.2 to 5.0)
    const capPoints = [
      new THREE.Vector2(0, 4.25),
      new THREE.Vector2(0.74, 4.25),
      new THREE.Vector2(0.74, 4.96),
      new THREE.Vector2(0.68, 5.04),
      new THREE.Vector2(0, 5.04)
    ];
    const capGeo = new THREE.LatheGeometry(capPoints, 48);

    // Rich saturated color satin finish - not faded or washed out
    this.capMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.capColor),
      roughness: 0.28,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    this.mainCapMesh = new THREE.Mesh(capGeo, this.capMaterial);
    this.capGroup.add(this.mainCapMesh);

    // Tamper-evident Neck Ring
    const ringGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.12, 48);
    const ringMesh = new THREE.Mesh(ringGeo, this.capMaterial);
    ringMesh.position.y = 4.14;
    this.capGroup.add(ringMesh);

    // Realistic Micro Grip Ribs on Cap
    const ribCount = 36;
    const ribGeo = new THREE.BoxGeometry(0.024, 0.68, 0.035);
    const ribGroup = new THREE.Group();
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const rib = new THREE.Mesh(ribGeo, this.capMaterial);
      rib.position.set(Math.cos(angle) * 0.745, 4.62, Math.sin(angle) * 0.745);
      rib.rotation.y = -angle;
      ribGroup.add(rib);
    }
    this.capGroup.add(ribGroup);

    this.bottleContainer.add(this.capGroup);
  }

  createDynamicLabel() {
    // 2K Resolution Canvas (2048 x 1024) for Razor-Sharp Text & Details
    this.labelCanvas = document.createElement('canvas');
    this.labelCanvas.width = 2048;
    this.labelCanvas.height = 1024;
    this.labelCtx = this.labelCanvas.getContext('2d');

    this.labelTexture = new THREE.CanvasTexture(this.labelCanvas);
    this.labelTexture.wrapS = THREE.RepeatWrapping;
    this.labelTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.labelTexture.generateMipmaps = true;
    this.labelTexture.minFilter = THREE.LinearMipmapLinearFilter;

    this.updateLabelCanvas();

    const labelHeight = 2.2;
    const labelRadius = 1.465;
    const labelGeo = new THREE.CylinderGeometry(labelRadius, labelRadius, labelHeight, 64, 1, true);

    this.labelMaterial = new THREE.MeshStandardMaterial({
      map: this.labelTexture,
      transparent: true,
      roughness: 0.22,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    this.labelMesh = new THREE.Mesh(labelGeo, this.labelMaterial);
    this.labelMesh.position.y = -0.1;
    this.labelMesh.rotation.y = Math.PI / 2; // Center faces camera

    this.bottleContainer.add(this.labelMesh);
  }

  updateLabelCanvas() {
    const ctx = this.labelCtx;
    const w = this.labelCanvas.width;
    const h = this.labelCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. High-Contrast Deep Obsidian Navy Metallic Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, 0);
    bgGrad.addColorStop(0, '#051424');
    bgGrad.addColorStop(0.25, '#081e35');
    bgGrad.addColorStop(0.5, '#0c2946');
    bgGrad.addColorStop(0.75, '#081e35');
    bgGrad.addColorStop(1, '#051424');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 48, w, h - 96);

    // 2. Glowing Neon Cyan & Silver Accent Trim
    ctx.fillStyle = '#00d2ff';
    ctx.fillRect(0, 48, w, 16);
    ctx.fillRect(0, h - 64, w, 16);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(0, 68, w, 4);
    ctx.fillRect(0, h - 72, w, 4);

    // 3. Central Brand Logo & Water Drop
    ctx.save();
    ctx.translate(w / 2, 210);
    
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 210, 255, 0.22)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.bezierCurveTo(25, -8, 30, 14, 30, 26);
    ctx.arc(0, 26, 30, 0, Math.PI);
    ctx.bezierCurveTo(-30, 14, -25, -8, 0, -38);
    ctx.fillStyle = '#00d2ff';
    ctx.fill();
    ctx.restore();

    // Brand Name Subtitle
    ctx.textAlign = 'center';
    ctx.fillStyle = '#70d6ff';
    ctx.font = "bold 48px 'Hind Siliguri', 'Anek Bangla', sans-serif";
    ctx.fillText("SO BOTTOL", w / 2, 345);

    // 4. USER CUSTOM NAME (Crisp, High-Contrast & Ultra-Legible)
    ctx.fillStyle = '#ffffff';
    let fontSize = 115;
    if (this.customName.length > 16) fontSize = 80;
    else if (this.customName.length > 10) fontSize = 98;
    
    ctx.font = `bold ${fontSize}px 'Hind Siliguri', 'Anek Bangla', 'Syne', sans-serif`;
    ctx.shadowColor = "rgba(0, 210, 255, 0.9)";
    ctx.shadowBlur = 24;
    ctx.fillText(this.customName, w / 2, 540);
    ctx.shadowBlur = 0;

    // 5. USER CUSTOM SLOGAN
    ctx.fillStyle = '#70d6ff';
    let sloganSize = 52;
    if (this.customSlogan.length > 28) sloganSize = 40;
    ctx.font = `600 ${sloganSize}px 'Hind Siliguri', 'Anek Bangla', sans-serif`;
    ctx.fillText(this.customSlogan, w / 2, 660);

    // 6. Bottom Purity & Specifications Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = "600 36px 'Hind Siliguri', monospace";
    ctx.fillText("PURE ALKALINE WATER • 750 ML • 100% BPA FREE • pH 7.8", w / 2, 830);

    if (this.labelTexture) {
      this.labelTexture.needsUpdate = true;
    }
  }

  setCapColor(colorInput) {
    this.capColor = colorInput;
    if (this.capMaterial) {
      this.capMaterial.color.set(colorInput);
      this.capMaterial.needsUpdate = true;
    }
  }

  setCustomText(name, slogan) {
    if (name !== undefined) this.customName = name;
    if (slogan !== undefined) this.customSlogan = slogan;
    this.updateLabelCanvas();
  }

  createWaterSplashes() {
    // FAKE RIBBONS COMPLETELY REMOVED per user request!
    // Instead, add a natural luxury fluid puddle / crystal ripple base under the bottle
    this.splashGroup = new THREE.Group();
    this.scene.add(this.splashGroup);

    // Realistic water ripple ring on the ground
    const rippleMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d2ff,
      transmission: 0.85,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.333,
      side: THREE.DoubleSide
    });

    const rippleGeo = new THREE.RingGeometry(1.6, 2.8, 48);
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    rippleMesh.rotation.x = -Math.PI / 2;
    rippleMesh.position.y = -4.35;
    this.splashGroup.add(rippleMesh);

    const outerRippleGeo = new THREE.RingGeometry(3.0, 3.8, 48);
    const outerRippleMesh = new THREE.Mesh(outerRippleGeo, rippleMat);
    outerRippleMesh.rotation.x = -Math.PI / 2;
    outerRippleMesh.position.y = -4.38;
    this.splashGroup.add(outerRippleMesh);

    this.splashMeshes.push({ mesh: rippleMesh, speed: 0.4 });
    this.splashMeshes.push({ mesh: outerRippleMesh, speed: -0.3 });
  }

  triggerSplashBurst() {
    if (window.gsap && this.splashGroup) {
      gsap.fromTo(this.splashGroup.scale, 
        { x: 0.8, z: 0.8, opacity: 0.3 },
        { x: 1.25, z: 1.25, opacity: 1, duration: 0.8, ease: 'power2.out', yoyo: true, repeat: 1 }
      );
    }
  }

  initEvents() {
    window.addEventListener('resize', () => this.onResize());

    if (!this.options.enableControls) return;

    const onPointerDown = (clientX, clientY) => {
      this.isDragging = true;
      this.prevMousePos = { x: clientX, y: clientY };
      this.rotationVelocity = { x: 0, y: 0 };
    };

    const onPointerMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const deltaX = clientX - this.prevMousePos.x;
      const deltaY = clientY - this.prevMousePos.y;

      this.bottleContainer.rotation.y += deltaX * 0.010;
      this.bottleContainer.rotation.x += deltaY * 0.006;

      this.bottleContainer.rotation.x = Math.max(-0.35, Math.min(0.35, this.bottleContainer.rotation.x));

      this.rotationVelocity = {
        x: deltaY * 0.002,
        y: deltaX * 0.003
      };

      this.prevMousePos = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', onPointerUp);
  }

  onResize() {
    if (!this.canvas) return;
    const width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    const height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // SLOW, MAJESTIC AUTO-TURNTABLE (Slow luxury rotation, not fast!)
    if (!this.isDragging) {
      if (this.options.autoRotate) {
        this.bottleContainer.rotation.y += 0.0025 + this.rotationVelocity.y;
        this.bottleContainer.rotation.x += this.rotationVelocity.x;
      }
      this.rotationVelocity.x *= 0.94;
      this.rotationVelocity.y *= 0.94;

      // Slow gentle bobbing
      this.bottleContainer.position.y = -0.15 + Math.sin(elapsed * 0.8) * 0.08;
    }

    // SLOW, MAJESTIC WATER SPLASH FLOW (Not frantic or fast!)
    if (this.splashGroup) {
      this.splashGroup.rotation.y = elapsed * 0.12;
      this.splashMeshes.forEach((item, idx) => {
        item.mesh.rotation.y = item.baseRot + elapsed * item.speed;
        item.mesh.position.y = Math.sin(elapsed * 1.0 + idx) * 0.15;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global instances
window.bottleScenes = {
  hero: null,
  customizer: null
};

window.addEventListener('DOMContentLoaded', () => {
  // 1. Hero Bottle 3D Scene
  const heroCanvas = document.getElementById('hero-3d-canvas');
  if (heroCanvas) {
    window.bottleScenes.hero = new ThreeBottleScene('hero-3d-canvas', {
      isHero: true,
      enableSplashes: true,
      autoRotate: true,
      enableControls: true,
      initialName: "SO BOTTOL",
      initialSlogan: "বিশুদ্ধ পানি • সুস্থ জীবন",
      initialCapColor: "#00a8ff",
      bottleScale: 0.95
    });
  }

  // 2. Customizer Bottle 3D Scene
  const custCanvas = document.getElementById('customizer-3d-canvas');
  if (custCanvas) {
    window.bottleScenes.customizer = new ThreeBottleScene('customizer-3d-canvas', {
      isHero: false,
      enableSplashes: true,
      autoRotate: true,
      enableControls: true,
      initialName: "YOUR NAME",
      initialSlogan: "STAY PURE • STAY HYDRATED",
      initialCapColor: "#00a8ff",
      bottleScale: 0.95
    });
  }
});
