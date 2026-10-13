/**
 * Modulo de inicializacao e gerenciamento da cena WebGL, camera, iluminacao e redimensionamento.
 */

/**
 * Inicializa a cena Three.js, camera de perspectiva, luzes neon e OrbitControls.
 * @param {HTMLElement} container
 * @param {Object} THREE
 * @param {any} OrbitControls
 * @returns {{ scene: any, camera: any, renderer: any, controls: any, pointLights: any[] }}
 */
export function setupScene(container, THREE, OrbitControls) {
  const width = container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 800);
  const height = container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);

  // 1. Cena com atmosfera cosmica e neblina sutil
  const scene = new THREE.Scene();
  const bgCol = 0x03030c;
  if (THREE.Color) scene.background = new THREE.Color(bgCol);
  if (THREE.FogExp2) scene.fog = new THREE.FogExp2(bgCol, 0.008);

  // 2. Camera de perspectiva
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 16, 36);
  camera.lookAt(0, 0, 0);

  // 3. Iluminacao Neon & Espacial
  const ambientLight = new THREE.AmbientLight(0x0a1128, 1.4);
  scene.add(ambientLight);

  const lightCyan = new THREE.PointLight(0x00f0ff, 3.0, 50);
  if (lightCyan.position?.set) lightCyan.position.set(0, 0, 0);
  scene.add(lightCyan);

  const lightMagenta = new THREE.PointLight(0xff007f, 2.2, 60);
  if (lightMagenta.position?.set) lightMagenta.position.set(16, 12, -12);
  scene.add(lightMagenta);

  const lightViolet = new THREE.PointLight(0x7928ca, 2.2, 60);
  if (lightViolet.position?.set) lightViolet.position.set(-16, -12, 12);
  scene.add(lightViolet);

  // 4. Renderer WebGL otimizado
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });

  const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height);

  if (THREE.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
  }

  if (container.appendChild && renderer.domElement) {
    container.appendChild(renderer.domElement);
  }

  // Tratamento de perda e restauracao de contexto WebGL (IMP-04)
  if (renderer.domElement && typeof renderer.domElement.addEventListener === 'function') {
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      const fallbackEl = document.getElementById('webgl-fallback');
      if (fallbackEl) {
        const h3 = fallbackEl.querySelector('h3');
        const p = fallbackEl.querySelector('p');
        if (h3) h3.textContent = 'Contexto WebGL Interrompido';
        if (p) p.textContent = 'A conexão com a GPU foi temporariamente perdida. Recarregue a página se a imagem não retornar.';
        fallbackEl.style.display = 'block';
      }
    }, false);

    renderer.domElement.addEventListener('webglcontextrestored', () => {
      const fallbackEl = document.getElementById('webgl-fallback');
      if (fallbackEl) fallbackEl.style.display = 'none';
    }, false);
  }

  // 5. Controles de camera orbitais com amortecimento
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 8;
  controls.maxDistance = 85;
  controls.maxPolarAngle = Math.PI * 0.92;

  return {
    scene,
    camera,
    renderer,
    controls,
    pointLights: [lightCyan, lightMagenta, lightViolet]
  };
}

/**
 * Atualiza projecao da camera e dimensoes do renderer ao redimensionar a janela.
 * @param {{ camera: any, renderer: any }} sceneContext
 * @param {number} width
 * @param {number} height
 */
export function handleResize(sceneContext, width, height) {
  if (!sceneContext || !sceneContext.camera || !sceneContext.renderer) return;
  if (width <= 0 || height <= 0) return;

  sceneContext.camera.aspect = width / height;
  if (typeof sceneContext.camera.updateProjectionMatrix === 'function') {
    sceneContext.camera.updateProjectionMatrix();
  }
  if (typeof sceneContext.renderer.setPixelRatio === 'function') {
    const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    sceneContext.renderer.setPixelRatio(pixelRatio);
  }
  if (typeof sceneContext.renderer.setSize === 'function') {
    sceneContext.renderer.setSize(width, height);
  }
}
