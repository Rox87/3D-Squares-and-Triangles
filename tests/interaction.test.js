import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldTriggerShockwave,
  createPointerTracker,
  calculatePulseIntensity
} from '../src/interaction.js';

test('shouldTriggerShockwave rejeita cliques quando pausado (IMP-01)', () => {
  const pointer = { dx: 2, dy: 2, dt: 100, isPrimary: true, button: 0 };
  const canTrigger = shouldTriggerShockwave(pointer, { isPaused: true });
  assert.strictEqual(canTrigger, false, 'Nao deve disparar shockwave enquanto pausado');
});

test('shouldTriggerShockwave permite disparos validos quando ativo', () => {
  const pointer = { dx: 2, dy: 2, dt: 100, isPrimary: true, button: 0 };
  const canTrigger = shouldTriggerShockwave(pointer, { isPaused: false });
  assert.strictEqual(canTrigger, true, 'Deve permitir disparo para clique valido');
});

test('shouldTriggerShockwave ignora botoes secundarios como botao direito ou do meio (IMP-03)', () => {
  // Botao direito (button 2) e roda do meio (button 1)
  const rightClick = { dx: 2, dy: 2, dt: 100, isPrimary: true, button: 2 };
  const middleClick = { dx: 2, dy: 2, dt: 100, isPrimary: true, button: 1 };

  assert.strictEqual(shouldTriggerShockwave(rightClick, { isPaused: false }), false);
  assert.strictEqual(shouldTriggerShockwave(middleClick, { isPaused: false }), false);
});

test('shouldTriggerShockwave ignora ponteiros secundarios em pinch-to-zoom (IMP-02)', () => {
  const secondaryTouch = { dx: 2, dy: 2, dt: 100, isPrimary: false, button: 0 };
  assert.strictEqual(shouldTriggerShockwave(secondaryTouch, { isPaused: false }), false);
});

test('createPointerTracker gerencia id ativo e cancelamentos', () => {
  const tracker = createPointerTracker();
  assert.strictEqual(tracker.getActiveId(), null);

  tracker.onPointerDown({ pointerId: 42, isPrimary: true, button: 0, clientX: 100, clientY: 100, time: 500 });
  assert.strictEqual(tracker.getActiveId(), 42);

  // Ignora segundo ponteiro
  tracker.onPointerDown({ pointerId: 99, isPrimary: false, button: 0, clientX: 200, clientY: 200, time: 510 });
  assert.strictEqual(tracker.getActiveId(), 42);

  const result = tracker.onPointerUp({ pointerId: 42, clientX: 102, clientY: 101, time: 600 });
  assert.ok(result, 'Deve retornar dados do ponteiro');
  assert.strictEqual(result.dx, 2);
  assert.strictEqual(result.dy, 1);
  assert.strictEqual(result.dt, 100);
  assert.strictEqual(tracker.getActiveId(), null);
});

test('calculatePulseIntensity amortece o clarão suavemente ao longo de múltiplos frames (IMP-05)', () => {
  let boost = 5.5;
  const initialIntensity = calculatePulseIntensity(boost, 0);
  assert.ok(initialIntensity > 5.0, 'Clarão inicial deve ser alto');

  // Após 10 frames de amortecimento
  for (let i = 0; i < 10; i++) {
    boost *= 0.92;
  }
  const decayedIntensity = calculatePulseIntensity(boost, 0);
  assert.ok(decayedIntensity < initialIntensity, 'Clarão deve decair suavemente');
  assert.ok(decayedIntensity > 2.0, 'Ainda deve manter brilho base perceptível');
});
