/* ======================================================================
   ABDUL RAFAY AKHTAR — CINEMATIC PORTFOLIO
   webgl.js
   Contents: Scene / Camera / Renderer / Theme-aware particles /
   Mouse interaction / Animation loop / Resize / Performance /
   Visibility handling / Mobile settings / Fallback
   ====================================================================== */

(() => {
  'use strict';

  const canvas = document.getElementById('webgl-background');
  if (!canvas || typeof THREE === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 760;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch (err) {
    canvas.style.display = 'none';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.3 : 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 480;

  /* ---------- Theme configuration ---------- */
  const THEMES = {
    cosmos: { colors: [0x8b93ff, 0xc39bff, 0xffffff], count: isMobile ? 900 : 2200, size: 1.6, speed: 0.06, spread: 1400, fog: 0x05060a },
    lumen: { colors: [0x33415c, 0xa08f76, 0xffffff], count: isMobile ? 500 : 1100, size: 2.0, speed: 0.03, spread: 1200, fog: 0xf6f4ee },
    sunset: { colors: [0xff8a63, 0xf2c265, 0xffd7b0], count: isMobile ? 700 : 1600, size: 2.1, speed: 0.045, spread: 1300, fog: 0x1a1310 },
    ocean: { colors: [0x38c7ff, 0x2f6fff, 0x9fe8ff], count: isMobile ? 800 : 1900, size: 1.8, speed: 0.07, spread: 1400, fog: 0x030b15 },
  };

  let currentTheme = document.body.getAttribute('data-appearance') || 'cosmos';
  let points = null;
  let material = null;
  let geometry = null;
  let velocities = null;

  function buildField(themeKey) {
    const cfg = THEMES[themeKey] || THEMES.cosmos;

    if (points) {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    }

    const count = cfg.count;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    velocities = new Float32Array(count * 3);
    const colorObjs = cfg.colors.map(c => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // depth-layered distribution
      const depthLayer = Math.random();
      const spread = cfg.spread;
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread * 0.6 - depthLayer * 200;

      velocities[i3] = (Math.random() - 0.5) * cfg.speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * cfg.speed * 0.6 - cfg.speed * 0.2;
      velocities[i3 + 2] = (Math.random() - 0.5) * cfg.speed * 0.3;

      const c = colorObjs[Math.floor(Math.random() * colorObjs.length)];
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
    }

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
      size: cfg.size,
      vertexColors: true,
      transparent: true,
      opacity: themeKey === 'lumen' ? 0.55 : 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);

    scene.fog = new THREE.FogExp2(cfg.fog, 0.0009);
  }

  buildField(currentTheme);

  window.addEventListener('appearance-change', (e) => {
    currentTheme = (e.detail && e.detail.theme) || 'cosmos';
    buildField(currentTheme);
  });

  /* ---------- Mouse parallax ---------- */
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  /* ---------- Resize ---------- */
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  /* ---------- Visibility handling ---------- */
  let isVisible = true;
  document.addEventListener('visibilitychange', () => {
    isVisible = document.visibilityState === 'visible';
  });

  /* ---------- Animation loop ---------- */
  const clock = new THREE.Clock();
  let rafId = null;

  function animate() {
    rafId = requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = Math.min(clock.getDelta(), 0.05);

    if (!prefersReducedMotion && points) {
      const posAttr = geometry.attributes.position;
      const arr = posAttr.array;
      const cfg = THEMES[currentTheme] || THEMES.cosmos;
      const bound = cfg.spread / 2;

      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += velocities[i] * delta * 12;
        arr[i + 1] += velocities[i + 1] * delta * 12;
        arr[i + 2] += velocities[i + 2] * delta * 12;

        // wrap particles that drift out of bounds
        if (arr[i + 1] < -bound) arr[i + 1] = bound;
        if (arr[i + 1] > bound) arr[i + 1] = -bound;
        if (arr[i] < -bound) arr[i] = bound;
        if (arr[i] > bound) arr[i] = -bound;
      }
      posAttr.needsUpdate = true;

      points.rotation.y += delta * 0.012;
    }

    // gentle mouse parallax on camera, not full scene, keeps content readable
    targetRotX = mouseY * 0.06;
    targetRotY = mouseX * 0.09;
    camera.rotation.x += (targetRotX - camera.rotation.x) * 0.02;
    camera.rotation.y += (targetRotY - camera.rotation.y) * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  /* ---------- Pause entirely when tab hidden for a long time (extra safety) ---------- */
  window.addEventListener('blur', () => { isVisible = false; });
  window.addEventListener('focus', () => { isVisible = true; });

  /* ---------- Cleanup on unload ---------- */
  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (geometry) geometry.dispose();
    if (material) material.dispose();
    renderer.dispose();
  });

})();
