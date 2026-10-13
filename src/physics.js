/**
 * Modulo de calculo fisico e cinematico orbital para o Prisma Cosmico 3D.
 */

const MAX_SHOCKWAVE_OFFSET = 40;

/**
 * Cria o estado de um satelite orbital.
 * @param {Object} config
 * @param {number} config.radius - Raio base da orbita
 * @param {number} config.speed - Velocidade angular (rad/s)
 * @param {number} config.inclination - Inclinacao orbital (radianos)
 * @param {number} config.phase - Fase inicial da orbita (radianos)
 * @returns {Object}
 */
export function createOrbitalSatellite({ radius = 10, speed = 1, inclination = 0, phase = 0 } = {}) {
  return {
    radius,
    speed,
    inclination,
    phase,
    shockwaveOffset: 0
  };
}

/**
 * Atualiza e retorna as coordenadas espaciais 3D em funcao do tempo decorrido.
 * @param {Object} satellite
 * @param {number} elapsedTime
 * @returns {{ x: number, y: number, z: number }}
 */
export function updateSatellitePosition(satellite, elapsedTime) {
  const theta = satellite.phase + satellite.speed * elapsedTime;
  const currentRadius = satellite.radius + satellite.shockwaveOffset;

  const x = currentRadius * Math.cos(theta);
  const y = currentRadius * Math.sin(theta) * Math.sin(satellite.inclination);
  const z = currentRadius * Math.sin(theta) * Math.cos(satellite.inclination);

  return { x, y, z };
}

/**
 * Aplica um impulso de onda de choque gravitacional, repelindo o satelite.
 * @param {Object} satellite
 * @param {number} force
 */
export function applyShockwaveImpulse(satellite, force) {
  satellite.shockwaveOffset = Math.min(satellite.shockwaveOffset + force, MAX_SHOCKWAVE_OFFSET);
}

/**
 * Amortiza gradualmente o deslocamento de choque para restaurar a orbita base.
 * @param {Object} satellite
 * @param {number} dampingFactor - Fator multiplicativo de decaimento (ex: 0.95)
 */
export function decayShockwaveOffset(satellite, dampingFactor = 0.95) {
  satellite.shockwaveOffset *= dampingFactor;
  if (satellite.shockwaveOffset < 0.001) {
    satellite.shockwaveOffset = 0;
  }
}
