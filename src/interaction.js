/**
 * Modulo de validacao e gestao de ponteiros e eventos interativos.
 */

/**
 * Avalia se um evento de ponteiro concluido deve disparar uma onda de choque.
 * @param {Object} pointer
 * @param {number} pointer.dx
 * @param {number} pointer.dy
 * @param {number} pointer.dt
 * @param {boolean} pointer.isPrimary
 * @param {number} pointer.button
 * @param {Object} state
 * @param {boolean} state.isPaused
 * @returns {boolean}
 */
export function shouldTriggerShockwave(pointer, state = {}) {
  // IMP-01: Nunca dispara onda de choque se a cena estiver pausada
  if (state.isPaused) return false;

  // IMP-02: Ignora toques secundarios em gestos multi-touch (ex: pinch-to-zoom)
  if (pointer.isPrimary === false) return false;

  // IMP-03: Permite apenas o botao esquerdo do mouse (button 0)
  if (pointer.button !== undefined && pointer.button !== 0) return false;

  // Tolerancia de clique rapido sem arrasto significativo
  return pointer.dx < 6 && pointer.dy < 6 && pointer.dt < 350;
}

/**
 * Cria um gerenciador de ponteiro unico para evitar conflitos em multi-touch.
 * @returns {Object}
 */
export function createPointerTracker() {
  let activeId = null;
  let startData = null;

  return {
    getActiveId() {
      return activeId;
    },
    onPointerDown(e) {
      if (e.isPrimary === false || (e.button !== undefined && e.button !== 0)) return;
      if (activeId !== null) return;

      activeId = e.pointerId;
      startData = {
        x: e.clientX,
        y: e.clientY,
        time: e.time !== undefined ? e.time : performance.now()
      };
    },
    onPointerUp(e) {
      if (activeId === null || e.pointerId !== activeId || !startData) return null;

      const dx = Math.abs(e.clientX - startData.x);
      const dy = Math.abs(e.clientY - startData.y);
      const now = e.time !== undefined ? e.time : performance.now();
      const dt = now - startData.time;

      activeId = null;
      startData = null;

      return {
        dx,
        dy,
        dt,
        isPrimary: e.isPrimary !== undefined ? e.isPrimary : true,
        button: e.button !== undefined ? e.button : 0
      };
    },
    onPointerCancel() {
      activeId = null;
      startData = null;
    }
  };
}

/**
 * Calcula a intensidade da luz central combinando pulsacao senoidal e clarão amortecido.
 * @param {number} boost
 * @param {number} time
 * @returns {number}
 */
export function calculatePulseIntensity(boost = 0, time = 0) {
  const base = 2.8 + Math.sin(time * 3.5) * 0.8;
  return base + boost;
}
