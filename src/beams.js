/**
 * Modulo de feixes de conexao de energia dinamicos (constelacao tridimensional).
 */

/**
 * Calcula os feixes ativos entre o cubo central e os satelites em funcao da proximidade.
 * @param {{ x: number, y: number, z: number }} cubePos
 * @param {Array<{ group: { position: { x: number, y: number, z: number } } }>} satellites
 * @param {number} maxDistance
 * @returns {Array<{ satelliteIndex: number, position: { x: number, y: number, z: number }, alpha: number }>}
 */
export function calculateActiveBeams(cubePos, satellites, maxDistance = 14) {
  const active = [];

  for (let i = 0; i < satellites.length; i++) {
    const sat = satellites[i];
    const pos = sat.group.position;

    const dx = pos.x - cubePos.x;
    const dy = pos.y - cubePos.y;
    const dz = pos.z - cubePos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < maxDistance) {
      const alpha = Math.max(0, Math.min(1, 1 - dist / maxDistance));
      active.push({
        satelliteIndex: i,
        position: pos,
        alpha
      });
    }
  }

  return active;
}

/**
 * Cria a malha de feixes de energia dinâmicos usando LineSegments.
 * @param {Object} THREE
 * @param {number} maxBeams
 * @returns {{ lineMesh: any, geometry: any, positions: Float32Array, colors: Float32Array }}
 */
export function createEnergyBeamsMesh(THREE, maxBeams = 32) {
  const geometry = new THREE.BufferGeometry();
  // 2 vertices por feixe, 3 floats por vertice
  const positions = new Float32Array(maxBeams * 2 * 3);
  const colors = new Float32Array(maxBeams * 2 * 3);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending || 2
  });

  const lineMesh = new THREE.LineSegments(geometry, material);
  return { lineMesh, geometry, positions, colors };
}

/**
 * Atualiza os feixes de energia em cada frame.
 * @param {Object} beamsContext
 * @param {{ x: number, y: number, z: number }} cubePos
 * @param {Array} satellites
 * @param {number} colorHex
 * @param {number} maxDistance
 */
export function updateEnergyBeamsMesh(beamsContext, cubePos, satellites, colorHex = 0x00f0ff, maxDistance = 14) {
  if (!beamsContext || !beamsContext.geometry) return;

  const { geometry, positions, colors } = beamsContext;
  const activeBeams = calculateActiveBeams(cubePos, satellites, maxDistance);
  const maxBeams = positions.length / 6;

  // Extrai componentes RGB da cor
  const r = ((colorHex >> 16) & 255) / 255;
  const g = ((colorHex >> 8) & 255) / 255;
  const b = (colorHex & 255) / 255;

  let vertexIndex = 0;

  for (let i = 0; i < maxBeams; i++) {
    if (i < activeBeams.length) {
      const beam = activeBeams[i];

      // Vertice 0: no cubo
      positions[vertexIndex] = cubePos.x;
      positions[vertexIndex + 1] = cubePos.y;
      positions[vertexIndex + 2] = cubePos.z;

      colors[vertexIndex] = r * beam.alpha;
      colors[vertexIndex + 1] = g * beam.alpha;
      colors[vertexIndex + 2] = b * beam.alpha;

      // Vertice 1: no satelite
      positions[vertexIndex + 3] = beam.position.x;
      positions[vertexIndex + 4] = beam.position.y;
      positions[vertexIndex + 5] = beam.position.z;

      colors[vertexIndex + 3] = r * beam.alpha;
      colors[vertexIndex + 4] = g * beam.alpha;
      colors[vertexIndex + 5] = b * beam.alpha;
    } else {
      // Desativa linhas extras
      positions[vertexIndex] = 0;
      positions[vertexIndex + 1] = 0;
      positions[vertexIndex + 2] = 0;
      positions[vertexIndex + 3] = 0;
      positions[vertexIndex + 4] = 0;
      positions[vertexIndex + 5] = 0;

      colors[vertexIndex] = 0;
      colors[vertexIndex + 1] = 0;
      colors[vertexIndex + 2] = 0;
      colors[vertexIndex + 3] = 0;
      colors[vertexIndex + 4] = 0;
      colors[vertexIndex + 5] = 0;
    }

    vertexIndex += 6;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
}
