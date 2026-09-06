/**
 * SO BOTTOL - 3D Three.js Water Splash & Droplet Simulation
 * Provides an elite, interactive crystal water splash surrounding the bottle.
 */

class WaterSplashScene {
  constructor(canvasId = 'three-splash-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.droplets = [];
    this.splashTubes = [];
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;

    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.createWaterSplashes();
    this.createFloatingDroplets();
    this.createMistParticles();
    this.initEvents();
    this.animate();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    const width = this.canvas.clientWidth || (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 620);
    const height = this.canvas.clientHeight || (this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 620);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  initCamera() {
    const width = this.canvas.clientWidth || (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 620);
    const height = this.canvas.clientHeight || (this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 620);
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 18);
  }

  initLights() {
    // Crystal Ice Blue Ambient
    const ambientLight = new THREE.AmbientLight(0xdff9fb, 1.4);
    this.scene.add(ambientLight);

    // Directional Key Light (Pure White Rim Highlight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(8, 12, 10);
    this.scene.add(keyLight);

    // Aquatic Cyan Bounce Light
    const cyanLight = new THREE.PointLight(0x00d2d3, 4, 30);
    cyanLight.position.set(-8, -4, 6);
    this.scene.add(cyanLight);

    // Deep Aqua Accent Light
    const blueLight = new THREE.PointLight(0x0984e3, 3, 25);
    blueLight.position.set(6, -6, -4);
    this.scene.add(blueLight);
  }

  getWaterMaterial(customColor = 0x6fe7f7, opacity = 0.88) {
    return new THREE.MeshPhysicalMaterial({
      color: customColor,
      transmission: 0.92,
      opacity: opacity,
      transparent: true,
      roughness: 0.04,
      metalness: 0.05,
      ior: 1.333,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color(0x00cec9),
      attenuationDistance: 4.5,
      depthWrite: false
    });
  }

  createWaterSplashes() {
    this.splashGroup = new THREE.Group();
    const waterMat = this.getWaterMaterial();

    // 1. Dynamic Spiral Splash Curve wrapping around bottle
    const curve1Points = [
      new THREE.Vector3(-4.5, -7.0, -1.5),
      new THREE.Vector3(-3.2, -4.0, 1.8),
      new THREE.Vector3(-1.5, -1.0, 2.6),
      new THREE.Vector3(1.2, 1.5, 2.0),
      new THREE.Vector3(3.4, 4.0, 0.4),
      new THREE.Vector3(2.5, 6.5, -2.0),
      new THREE.Vector3(0.5, 7.8, -1.2)
    ];
    const curve1 = new THREE.CatmullRomCurve3(curve1Points);
    const tubeGeo1 = new THREE.TubeGeometry(curve1, 90, 0.38, 16, false);
    const tube1 = new THREE.Mesh(tubeGeo1, waterMat);
    this.splashGroup.add(tube1);
    this.splashTubes.push({ mesh: tube1, speed: 0.8, baseRot: 0 });

    // 2. Counter Swirl Splash Curve
    const curve2Points = [
      new THREE.Vector3(4.2, -6.5, -1.0),
      new THREE.Vector3(2.8, -3.5, 2.2),
      new THREE.Vector3(0.8, -0.5, 2.8),
      new THREE.Vector3(-2.2, 2.2, 1.6),
      new THREE.Vector3(-3.2, 5.0, -0.8),
      new THREE.Vector3(-1.8, 7.2, -1.8)
    ];
    const curve2 = new THREE.CatmullRomCurve3(curve2Points);
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 80, 0.32, 16, false);
    const tube2 = new THREE.Mesh(tubeGeo2, waterMat);
    this.splashGroup.add(tube2);
    this.splashTubes.push({ mesh: tube2, speed: -0.6, baseRot: Math.PI / 3 });

    // 3. Water Splash Crown / Burst Ring at bottom
    const ringPts = [];
    const numRingPts = 24;
    for (let i = 0; i <= numRingPts; i++) {
      const angle = (i / numRingPts) * Math.PI * 2;
      const r = 3.6 + Math.sin(angle * 4) * 0.7;
      const y = -5.8 + Math.cos(angle * 5) * 0.45;
      ringPts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
    }
    const ringCurve = new THREE.CatmullRomCurve3(ringPts, true);
    const ringGeo = new THREE.TubeGeometry(ringCurve, 70, 0.28, 12, true);
    const ringMesh = new THREE.Mesh(ringGeo, waterMat);
    this.splashGroup.add(ringMesh);
    this.splashTubes.push({ mesh: ringMesh, speed: 0.4, baseRot: 0 });

    this.scene.add(this.splashGroup);
  }

  createFloatingDroplets() {
    this.dropletGroup = new THREE.Group();
    const dropletMat = this.getWaterMaterial(0xa0e7e5, 0.95);
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);

    const dropletCount = 45;
    for (let i = 0; i < dropletCount; i++) {
      const droplet = new THREE.Mesh(sphereGeo, dropletMat);
      
      const scale = 0.12 + Math.random() * 0.35;
      droplet.scale.set(scale, scale * (1 + Math.random() * 0.25), scale);

      const radius = 2.8 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      const height = -7.5 + Math.random() * 15;

      droplet.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      droplet.userData = {
        baseRadius: radius,
        angle: angle,
        speed: (0.4 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1),
        yBase: height,
        yRange: 0.6 + Math.random() * 1.2,
        pulsingSpeed: 1.5 + Math.random() * 2,
        burstOffset: new THREE.Vector3(0, 0, 0)
      };

      this.droplets.push(droplet);
      this.dropletGroup.add(droplet);
    }

    this.scene.add(this.dropletGroup);
  }

  createMistParticles() {
    const mistCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(mistCount * 3);
    const scales = new Float32Array(mistCount);

    for (let i = 0; i < mistCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 16;
      positions[i + 2] = (Math.random() - 0.5) * 8;
      scales[i / 3] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const mistMat = new THREE.PointsMaterial({
      color: 0xe0f7fa,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.mistPoints = new THREE.Points(geometry, mistMat);
    this.scene.add(this.mistPoints);
  }

  initEvents() {
    window.addEventListener('resize', () => this.onResize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    }, { passive: true });

    // Click splash boost
    this.canvas.addEventListener('click', () => this.triggerSplashBurst());
  }

  triggerSplashBurst() {
    this.droplets.forEach((d) => {
      const dir = d.position.clone().normalize();
      d.userData.burstOffset.add(dir.multiplyScalar(2.2 + Math.random() * 2));
    });

    if (window.gsap) {
      gsap.to(this.splashGroup.scale, {
        x: 1.18,
        y: 1.15,
        z: 1.18,
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }
  }

  onResize() {
    if (!this.canvas) return;
    const width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    const height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setScrollProgress(prog) {
    this.scrollProgress = prog;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();
    const delta = this.clock.getDelta();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Splash Group Rotation & Mouse Wobble
    if (this.splashGroup) {
      this.splashGroup.rotation.y = elapsed * 0.45 + this.mouse.x * 0.6 + this.scrollProgress * Math.PI;
      this.splashGroup.rotation.x = Math.sin(elapsed * 0.7) * 0.12 + this.mouse.y * 0.3;
      this.splashGroup.position.y = Math.sin(elapsed * 1.5) * 0.25;

      // Animate Individual Splash Tubes
      this.splashTubes.forEach((item, idx) => {
        item.mesh.rotation.y = item.baseRot + elapsed * item.speed * 0.5;
        item.mesh.position.y = Math.sin(elapsed * 2 + idx) * 0.3;
      });
    }

    // Droplets Movement and Damping of bursts
    this.droplets.forEach((d) => {
      const u = d.userData;
      u.angle += u.speed * 0.015;

      // Return burst offset smoothly to zero
      u.burstOffset.multiplyScalar(0.92);

      const r = u.baseRadius + Math.sin(elapsed * u.pulsingSpeed) * 0.35;
      d.position.x = Math.cos(u.angle) * r + u.burstOffset.x;
      d.position.z = Math.sin(u.angle) * r + u.burstOffset.z;
      d.position.y = u.yBase + Math.sin(elapsed * 1.8 + u.angle) * u.yRange + u.burstOffset.y;

      d.rotation.x += 0.02;
      d.rotation.y += 0.03;
    });

    // Mist particle subtle drift
    if (this.mistPoints) {
      this.mistPoints.rotation.y = elapsed * 0.08;
      this.mistPoints.position.y = Math.sin(elapsed * 0.5) * 0.4;
    }

    // Subtle Camera Tracking
    this.camera.position.x = this.mouse.x * 1.2;
    this.camera.position.y = this.mouse.y * 0.8;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate when DOM loads
window.addEventListener('DOMContentLoaded', () => {
  window.waterSplashApp = new WaterSplashScene('three-splash-canvas');
});
