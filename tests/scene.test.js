import test from 'node:test';
import assert from 'node:assert/strict';
import { setupScene, handleResize } from '../src/scene.js';

test('handleResize atualiza camera aspect, projecao e tamanho do renderer', () => {
  let matrixUpdated = false;
  let rendererSized = false;

  const mockCamera = {
    aspect: 1,
    updateProjectionMatrix: () => { matrixUpdated = true; }
  };

  const mockRenderer = {
    setSize: (w, h) => {
      if (w === 1280 && h === 720) rendererSized = true;
    }
  };

  handleResize({ camera: mockCamera, renderer: mockRenderer }, 1280, 720);

  assert.strictEqual(mockCamera.aspect, 1280 / 720);
  assert.ok(matrixUpdated, 'updateProjectionMatrix deve ser chamado');
  assert.ok(rendererSized, 'renderer.setSize deve ser chamado com nova largura e altura');
});

test('setupScene inicializa cena, camera, luzes e controles com amortecimento', () => {
  const container = { appendChild: () => {}, clientWidth: 800, clientHeight: 600 };
  let ambientAdded = false;
  let pointLightAdded = false;

  const mockTHREE = {
    Scene: class {
      constructor() {
        this.add = (obj) => {
          if (obj.isAmbient) ambientAdded = true;
          if (obj.isPoint) pointLightAdded = true;
        };
      }
    },
    Color: class {},
    FogExp2: class {},
    PerspectiveCamera: class {
      constructor(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = { set: () => {} };
        this.lookAt = () => {};
      }
    },
    WebGLRenderer: class {
      constructor() {
        this.domElement = {};
        this.setPixelRatio = () => {};
        this.setSize = () => {};
      }
    },
    AmbientLight: class {
      constructor() { this.isAmbient = true; }
    },
    PointLight: class {
      constructor() { this.isPoint = true; }
    },
    ACESFilmicToneMapping: 4
  };

  const mockOrbitControls = class {
    constructor(camera, domElement) {
      this.enableDamping = false;
      this.dampingFactor = 0.05;
    }
  };

  const ctx = setupScene(container, mockTHREE, mockOrbitControls);
  assert.ok(ctx.scene, 'Deve criar objeto Scene');
  assert.ok(ctx.camera, 'Deve criar objeto Camera');
  assert.ok(ctx.renderer, 'Deve criar objeto Renderer');
  assert.ok(ctx.controls, 'Deve criar objeto Controls com amortecimento inercial');
  assert.strictEqual(ctx.controls.enableDamping, true);
  assert.ok(ambientAdded, 'Deve adicionar luz ambiente');
  assert.ok(pointLightAdded, 'Deve adicionar luzes pontuais coloridas');
});
