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
import {
  shouldTriggerShockwave,
  createPointerTracker,
  calculatePulseIntensity
} from './interaction.js';
import {
  THEMES,
  getTheme,
  getThemeList,
  applyTheme
} from './themes.js';
import {
  createEnergyBeamsMesh,
  updateEnergyBeamsMesh
} from './beams.js';
import {
  toggleSound,
  isSoundEnabled,
  playShockwaveSound
} from './audio.js';

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

  const { scene, camera, renderer, controls, pointLights } = sceneContext;

  // 1. Instanciacao dos elementos 3D
  const cube = createCentralCube(THREE);
  scene.add(cube.group);

  const satellites = createOrbitingTriangles(THREE, 24);
  satellites.forEach(sat => scene.add(sat.group));

  const stars = createCosmicParticleField(THREE, 1400);
  scene.add(stars.pointsMesh);

  // Feixes de energia / constelacao tridimensional
  const energyBeams = createEnergyBeamsMesh(THREE, 32);
  scene.add(energyBeams.lineMesh);

  // 2. Estado de animacao, temas e som
  let isPaused = false;
  let virtualTime = 0;
  let lightBoost = 0;
  let flashTimer = null;
  const clock = new THREE.Clock();

  const themeKeys = getThemeList();
  let currentThemeIndex = 0;
  let currentTheme = getTheme(themeKeys[currentThemeIndex]);

  // Posicao padrao da camera para reset
  const defaultCamPos = new THREE.Vector3(0, 16, 36);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  // 3. Disparo da Onda de Choque Gravitacional
  function triggerShockwave() {
    if (isPaused) return;

    // Efeito sonoro procedural sintetizado
    playShockwaveSound();

    // Flash sutil na interface
    if (flashEl) {
      if (flashTimer) clearTimeout(flashTimer);
      flashEl.classList.add('active');
      flashTimer = setTimeout(() => {
        flashEl.classList.remove('active');
        flashTimer = null;
      }, 250);
    }

    // Clarão com amortecimento suave
    lightBoost = 6.0;

    // Impulso físico em cada satélite
    satellites.forEach((sat, idx) => {
      const impulse = 9.0 + (idx % 4) * 2.5 + Math.random() * 3.0;
      applyShockwaveImpulse(sat.satelliteState, impulse);
    });
  }

  // 4. Gestao de eventos de ponteiro
  const pointerTracker = createPointerTracker();

  container.addEventListener('pointerdown', (e) => {
    pointerTracker.onPointerDown(e);
  });

  container.addEventListener('pointerup', (e) => {
    const result = pointerTracker.onPointerUp(e);
    if (result && shouldTriggerShockwave(result, { isPaused })) {
      triggerShockwave();
    }
  });

  container.addEventListener('pointercancel', () => {
    pointerTracker.onPointerCancel();
  });

  // 5. Controles do HUD
  const btnTheme = document.getElementById('btn-theme');
  const themeLabel = document.getElementById('theme-label');
  const btnAudio = document.getElementById('btn-audio');
  const audioIconOff = document.getElementById('audio-icon-off');
  const audioIconOn = document.getElementById('audio-icon-on');
  const audioLabel = document.getElementById('audio-label');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // Alternador de Temas Estéticos
  if (btnTheme) {
    btnTheme.addEventListener('click', (e) => {
      e.stopPropagation();
      currentThemeIndex = (currentThemeIndex + 1) % themeKeys.length;
      const key = themeKeys[currentThemeIndex];
      currentTheme = getTheme(key);

      applyTheme(key, { cube, satellites, pointLights, scene }, THREE);

      if (themeLabel) themeLabel.textContent = currentTheme.name;
    });
  }

  // Alternador de Áudio Procedural
  if (btnAudio) {
    btnAudio.addEventListener('click', (e) => {
      e.stopPropagation();
      const newState = !isSoundEnabled();
      toggleSound(newState);

      if (audioIconOff && audioIconOn) {
        audioIconOff.style.display = newState ? 'none' : 'block';
        audioIconOn.style.display = newState ? 'block' : 'none';
      }
      if (audioLabel) {
        audioLabel.textContent = newState ? 'Som: Ativo' : 'Som: Mudo';
      }
      btnAudio.classList.toggle('active', newState);
    });
  }

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
      if (typeof controls.reset === 'function') {
        controls.reset();
      } else {
        controls.update();
      }
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

      // Clarão com amortecimento suave
      lightBoost *= 0.92;
      if (cube.internalLight) {
        cube.internalLight.intensity = calculatePulseIntensity(lightBoost, virtualTime);
      }

      // Atualizacao e translacao orbital dos 24 satelites
      satellites.forEach((sat) => {
        const pos = updateSatellitePosition(sat.satelliteState, virtualTime);
        sat.group.position.set(pos.x, pos.y, pos.z);

        // Auto-rotacao de cada satelite em torno do proprio eixo
        sat.group.rotation.x += delta * sat.spinSpeed * sat.spinAxis.x;
        sat.group.rotation.y += delta * sat.spinSpeed * sat.spinAxis.y;
        sat.group.rotation.z += delta * sat.spinSpeed * sat.spinAxis.z;

        // Amortecimento continuo de choque
        decayShockwaveOffset(sat.satelliteState, 0.95);
      });

      // Atualizacao dos feixes de conexao de energia dinamicos
      updateEnergyBeamsMesh(
        energyBeams,
        cube.group.position,
        satellites,
        currentTheme.beamColor,
        14
      );

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
