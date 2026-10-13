import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setupScene, handleResize } from './scene.js';
import {
  createCentralCube,
  createOrbitingTriangles,
  createCosmicParticleField
} from './geometry.js';
import {
  updateSatellitePosition,
  applyShockwaveImpulse,
  decayShockwaveOffset
} from './physics.js';

function init() {
  const container = document.getElementById('canvas-container');
  const flashEl = document.getElementById('shockwave-flash');
  const fallbackEl = document.getElementById('webgl-fallback');

  let sceneContext;
  try {
    sceneContext = setupScene(container, THREE, OrbitControls);
  } catch (err) {
    console.error('Falha ao inicializar WebGL:', err);
    if (fallbackEl) fallbackEl.style.display = 'block';
    return;
  }

  const { scene, camera, renderer, controls } = sceneContext;

  // 1. Instanciacao dos elementos 3D
  const cube = createCentralCube(THREE);
  scene.add(cube.group);

  const satellites = createOrbitingTriangles(THREE, 24);
  satellites.forEach(sat => scene.add(sat.group));

  const stars = createCosmicParticleField(THREE, 1400);
  scene.add(stars.pointsMesh);

  // 2. Estado de animacao
  let isPaused = false;
  let virtualTime = 0;
  const clock = new THREE.Clock();

  // Posicao padrao da camera para reset
  const defaultCamPos = new THREE.Vector3(0, 16, 36);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  // 3. Disparo da Onda de Choque Gravitacional
  function triggerShockwave() {
    // Flash sutil na interface
    if (flashEl) {
      flashEl.classList.add('active');
      setTimeout(() => flashEl.classList.remove('active'), 250);
    }

    // Aumento temporario na luz central
    if (cube.internalLight) {
      cube.internalLight.intensity = 8.5;
    }

    // Impulso em cada satelite com variacao organica
    satellites.forEach((sat, idx) => {
      const impulse = 9.0 + (idx % 4) * 2.5 + Math.random() * 3.0;
      applyShockwaveImpulse(sat.satelliteState, impulse);
    });
  }

  // 4. Distincao entre clique e arrasto no Canvas
  let pointerStart = { x: 0, y: 0, time: 0 };

  container.addEventListener('pointerdown', (e) => {
    pointerStart = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    };
  });

  container.addEventListener('pointerup', (e) => {
    const dx = Math.abs(e.clientX - pointerStart.x);
    const dy = Math.abs(e.clientY - pointerStart.y);
    const dt = performance.now() - pointerStart.time;

    // Se o ponteiro moveu menos de 6 pixels e durou menos de 350ms, trata como clique/toque
    if (dx < 6 && dy < 6 && dt < 350) {
      triggerShockwave();
    }
  });

  // 5. Controles do HUD (com stopPropagation para nao afetar o canvas)
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  if (btnPause) {
    btnPause.addEventListener('click', (e) => {
      e.stopPropagation();
      isPaused = !isPaused;
      btnPause.classList.toggle('active', isPaused);
      const span = btnPause.querySelector('span');
      if (span) span.textContent = isPaused ? 'Retomar' : 'Pausar';
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      e.stopPropagation();
      camera.position.copy(defaultCamPos);
      controls.target.copy(defaultTarget);
      controls.update();
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      }
    });
  }

  // 6. Redimensionamento responsivo
  function onWindowResize() {
    handleResize(sceneContext, window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(onWindowResize, 100);
  });

  // 7. Loop de Animacao a 60 FPS
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (!isPaused) {
      virtualTime += delta;

      // Rotação suave do cubo central em múltiplos eixos
      cube.group.rotation.x += delta * 0.35;
      cube.group.rotation.y += delta * 0.45;
      cube.group.rotation.z += delta * 0.15;

      // Pulsacao continua da luz do nucleo
      if (cube.internalLight) {
        cube.internalLight.intensity = 2.8 + Math.sin(virtualTime * 3.5) * 0.8;
      }

      // Atualizacao e translacao orbital dos 24 satelites
      satellites.forEach((sat) => {
        const pos = updateSatellitePosition(sat.satelliteState, virtualTime);
        sat.group.position.set(pos.x, pos.y, pos.z);

        // Auto-rotacao de cada satelite em torno do proprio eixo
        sat.group.rotation.x += delta * sat.spinSpeed * sat.spinAxis.x;
        sat.group.rotation.y += delta * sat.spinSpeed * sat.spinAxis.y;
        sat.group.rotation.z += delta * sat.spinSpeed * sat.spinAxis.z;

        // Amortecimento continuo de choque em direcao a orbita base
        decayShockwaveOffset(sat.satelliteState, 0.95);
      });

      // Rotacao sutil do campo de estrelas
      stars.pointsMesh.rotation.y += delta * 0.02;
      stars.pointsMesh.rotation.x += delta * 0.008;
    }

    // Amortecimento inercial da camera
    controls.update();

    // Renderizacao do frame
    renderer.render(scene, camera);
  }

  animate();
}

window.addEventListener('DOMContentLoaded', init);
