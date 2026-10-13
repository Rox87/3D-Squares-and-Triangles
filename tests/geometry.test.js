import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CUBE_CONFIG,
  SATELLITE_CONFIG,
  getSatelliteColorPalette,
  createCentralCube,
  createOrbitingTriangles,
  createCosmicParticleField
} from '../src/geometry.js';

test('CUBE_CONFIG define dimensoes e cores ciano/azul eletrico conforme spec', () => {
  assert.ok(CUBE_CONFIG.size > 0);
  assert.strictEqual(typeof CUBE_CONFIG.wireframeColor, 'number');
  assert.strictEqual(typeof CUBE_CONFIG.coreColor, 'number');
  // Ciano vibrante e emissao
  assert.strictEqual(CUBE_CONFIG.wireframeColor, 0x00f0ff);
});

test('SATELLITE_CONFIG possui contagem de 24 satelites e paleta neon variada', () => {
  assert.strictEqual(SATELLITE_CONFIG.count, 24);
  const palette = getSatelliteColorPalette();
  assert.ok(palette.length >= 4, 'Paleta deve incluir tons de magenta, violeta, ciano e azul');
  assert.ok(palette.includes(0xff007f), 'Deve conter magenta');
  assert.ok(palette.includes(0x00f0ff), 'Deve conter ciano');
});

test('createCentralCube cria malhas com mock de THREE', () => {
  const dummyMesh = { add: () => {} };
  const mockTHREE = {
    Group: class { add() {} },
    BoxGeometry: class {},
    EdgesGeometry: class {},
    LineBasicMaterial: class {},
    LineSegments: class { constructor() { return dummyMesh; } },
    MeshPhysicalMaterial: class {},
    Mesh: class { constructor() { return dummyMesh; } },
    PointLight: class { constructor() { return dummyMesh; } }
  };

  const result = createCentralCube(mockTHREE);
  assert.ok(result.group, 'Deve retornar o grupo principal');
  assert.ok(result.coreMesh, 'Deve retornar a malha do nucleo');
  assert.ok(result.wireframeMesh, 'Deve retornar a malha de wireframe');
});

test('createOrbitingTriangles cria 24 instancias triangulares com estados orbitais', () => {
  const dummyMesh = { add: () => {}, position: { set: () => {} }, rotation: { set: () => {} } };
  const mockTHREE = {
    Group: class {
      constructor() {
        this.add = () => {};
        this.position = { set: () => {} };
      }
    },
    TetrahedronGeometry: class {},
    ConeGeometry: class {},
    EdgesGeometry: class {},
    LineBasicMaterial: class {},
    LineSegments: class { constructor() { return dummyMesh; } },
    MeshStandardMaterial: class {},
    Mesh: class { constructor() { return dummyMesh; } }
  };

  const satellites = createOrbitingTriangles(mockTHREE, 24);
  assert.strictEqual(satellites.length, 24);
  assert.ok(satellites[0].satelliteState, 'Cada satelite deve ter estado fisico associado');
  assert.ok(satellites[0].satelliteState.radius >= SATELLITE_CONFIG.minRadius);
  assert.ok(satellites[0].satelliteState.radius <= SATELLITE_CONFIG.maxRadius);
});

test('createCosmicParticleField instancia nuvem de poeira estelar', () => {
  const mockTHREE = {
    BufferGeometry: class {
      setAttribute() {}
    },
    Float32BufferAttribute: class {},
    PointsMaterial: class {},
    Points: class {
      constructor(geo, mat) {
        this.geometry = geo;
        this.material = mat;
      }
    }
  };

  const field = createCosmicParticleField(mockTHREE, 500);
  assert.ok(field.pointsMesh, 'Deve retornar a malha Points de particulas');
});
