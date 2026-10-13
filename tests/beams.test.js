import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateActiveBeams } from '../src/beams.js';

test('calculateActiveBeams conecta apenas satelites dentro do raio de proximidade', () => {
  const cubePos = { x: 0, y: 0, z: 0 };
  const satellites = [
    { group: { position: { x: 5, y: 0, z: 0 } }, satelliteState: {} }, // Dist 5 (< 12) -> conecta
    { group: { position: { x: 0, y: 8, z: 0 } }, satelliteState: {} }, // Dist 8 (< 12) -> conecta
    { group: { position: { x: 20, y: 0, z: 0 } }, satelliteState: {} } // Dist 20 (> 12) -> ignora
  ];

  const activeBeams = calculateActiveBeams(cubePos, satellites, 12);
  assert.strictEqual(activeBeams.length, 2);
  assert.strictEqual(activeBeams[0].satelliteIndex, 0);
  assert.strictEqual(activeBeams[1].satelliteIndex, 1);
  assert.ok(activeBeams[0].alpha > 0 && activeBeams[0].alpha <= 1);
});

test('calculateActiveBeams gera opacidade inversamente proporcional a distancia', () => {
  const cubePos = { x: 0, y: 0, z: 0 };
  const satellites = [
    { group: { position: { x: 4, y: 0, z: 0 } }, satelliteState: {} },
    { group: { position: { x: 10, y: 0, z: 0 } }, satelliteState: {} }
  ];

  const activeBeams = calculateActiveBeams(cubePos, satellites, 12);
  assert.ok(activeBeams[0].alpha > activeBeams[1].alpha, 'Satelite mais proximo deve ter feixe mais opaco/intenso');
});
