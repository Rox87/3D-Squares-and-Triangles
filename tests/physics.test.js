import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOrbitalSatellite,
  updateSatellitePosition,
  applyShockwaveImpulse,
  decayShockwaveOffset
} from '../src/physics.js';

test('createOrbitalSatellite inicializa com valores corretos', () => {
  const sat = createOrbitalSatellite({ radius: 10, speed: 1.5, inclination: 0.2, phase: 0 });
  assert.strictEqual(sat.radius, 10);
  assert.strictEqual(sat.speed, 1.5);
  assert.strictEqual(sat.inclination, 0.2);
  assert.strictEqual(sat.phase, 0);
  assert.strictEqual(sat.shockwaveOffset, 0);
});

test('updateSatellitePosition calcula coordenadas espaciais 3D em funcao do tempo', () => {
  const sat = createOrbitalSatellite({ radius: 10, speed: 1, inclination: 0, phase: 0 });
  const pos0 = updateSatellitePosition(sat, 0);
  assert.ok(Math.abs(pos0.x - 10) < 1e-4, `Expected x near 10, got ${pos0.x}`);
  assert.ok(Math.abs(pos0.y) < 1e-4, `Expected y near 0, got ${pos0.y}`);
  assert.ok(Math.abs(pos0.z) < 1e-4, `Expected z near 0, got ${pos0.z}`);

  const posQuarter = updateSatellitePosition(sat, Math.PI / 2);
  assert.ok(Math.abs(posQuarter.x) < 1e-4, `Expected x near 0, got ${posQuarter.x}`);
  assert.ok(Math.abs(posQuarter.z - 10) < 1e-4, `Expected z near 10, got ${posQuarter.z}`);
});

test('applyShockwaveImpulse aplica deslocamento e decayShockwaveOffset amortiza suavemente', () => {
  const sat = createOrbitalSatellite({ radius: 10, speed: 1, inclination: 0, phase: 0 });
  applyShockwaveImpulse(sat, 15);
  assert.strictEqual(sat.shockwaveOffset, 15);

  decayShockwaveOffset(sat, 0.9);
  assert.ok(sat.shockwaveOffset < 15, 'Offset deve diminuir com decay');
  assert.ok(sat.shockwaveOffset > 0, 'Offset deve ser positivo enquanto decai');
});

test('applyShockwaveImpulse limita deslocamento maximo para evitar overflow por multiplos cliques', () => {
  const sat = createOrbitalSatellite({ radius: 10, speed: 1, inclination: 0, phase: 0 });
  applyShockwaveImpulse(sat, 100);
  applyShockwaveImpulse(sat, 100);
  assert.ok(sat.shockwaveOffset <= 40, 'Deve limitar a repulsao maxima para evitar perda de satelites');
});
