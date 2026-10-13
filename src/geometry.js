import { createOrbitalSatellite } from './physics.js';

export const CUBE_CONFIG = {
  size: 4.5,
  coreColor: 0x051329,
  wireframeColor: 0x00f0ff,
  emissiveIntensity: 0.8
};

export const SATELLITE_CONFIG = {
  count: 24,
  minRadius: 8,
  maxRadius: 26,
  minSpeed: 0.4,
  maxSpeed: 1.6
};

/**
 * Retorna a paleta de cores neon vibrantes para os satelites triangulares.
 * @returns {number[]}
 */
export function getSatelliteColorPalette() {
  return [
    0xff007f, // Neon Magenta
    0xa855f7, // Cosmic Purple / Violet
    0x00f0ff, // Electric Cyan
    0x38bdf8, // Sky Blue
    0xf43f5e, // Bright Coral Rose
    0x818cf8  // Indigo Glow
  ];
}

/**
 * Cria a estrutura 3D do cubo central (o "quadrado" no espaco 3D).
 * @param {Object} THREE
 * @returns {{ group: any, coreMesh: any, wireframeMesh: any, internalLight: any }}
 */
export function createCentralCube(THREE) {
  const group = new THREE.Group();

  const boxGeo = new THREE.BoxGeometry(CUBE_CONFIG.size, CUBE_CONFIG.size, CUBE_CONFIG.size);

  // Material fisico translúcido com reflexos
  const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;
  const coreMat = new MatClass({
    color: CUBE_CONFIG.coreColor,
    roughness: 0.15,
    metalness: 0.85,
    transmission: 0.6,
    transparent: true,
    opacity: 0.85,
    emissive: 0x002244,
    emissiveIntensity: 0.4
  });

  const coreMesh = new THREE.Mesh(boxGeo, coreMat);
  group.add(coreMesh);

  // Arestas de wireframe neon ciano
  const edgesGeo = new THREE.EdgesGeometry(boxGeo);
  const wireMat = new THREE.LineBasicMaterial({
    color: CUBE_CONFIG.wireframeColor,
    linewidth: 2
  });
  const wireframeMesh = new THREE.LineSegments(edgesGeo, wireMat);
  group.add(wireframeMesh);

  // Luz pontual interna do nucleo
  const internalLight = new THREE.PointLight(0x00f0ff, 3, 35);
  group.add(internalLight);

  return { group, coreMesh, wireframeMesh, internalLight };
}

/**
 * Cria os múltiplos triângulos orbitais (piramides e tetraedros) ao redor do cubo.
 * @param {Object} THREE
 * @param {number} count
 * @returns {Array<{ group: any, mesh: any, wireframe: any, satelliteState: Object, baseScale: number, spinAxis: {x:number, y:number, z:number} }>}
 */
export function createOrbitingTriangles(THREE, count = SATELLITE_CONFIG.count) {
  const satellites = [];
  const palette = getSatelliteColorPalette();

  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();
    const color = palette[i % palette.length];

    // Alterna entre Tetraedro regular e Piramide triangular (Cone com 3 lados)
    const isTetra = i % 2 === 0;
    const baseRadius = 0.8 + (i % 3) * 0.35;
    const geo = isTetra
      ? new THREE.TetrahedronGeometry(baseRadius)
      : new THREE.ConeGeometry(baseRadius, baseRadius * 1.6, 3);

    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.25,
      metalness: 0.7,
      emissive: color,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // Contorno em aresta neon brilhante
    const edgesGeo = new THREE.EdgesGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5 });
    const wireframe = new THREE.LineSegments(edgesGeo, wireMat);
    group.add(wireframe);

    // Parametrizacao orbital fisica
    const radiusProgress = i / count;
    const radius = SATELLITE_CONFIG.minRadius + radiusProgress * (SATELLITE_CONFIG.maxRadius - SATELLITE_CONFIG.minRadius);
    const direction = i % 3 === 0 ? -1 : 1;
    const speed = direction * (SATELLITE_CONFIG.minSpeed + Math.random() * (SATELLITE_CONFIG.maxSpeed - SATELLITE_CONFIG.minSpeed));
    // Inclinacao orbital em diferentes planos tridimensionais
    const inclination = ((i % 5) - 2) * (Math.PI / 6) + (Math.random() - 0.5) * 0.2;
    const phase = (i / count) * Math.PI * 2;

    const satelliteState = createOrbitalSatellite({
      radius,
      speed,
      inclination,
      phase
    });

    satellites.push({
      group,
      mesh,
      wireframe,
      satelliteState,
      baseScale: baseRadius,
      spinSpeed: 0.5 + Math.random() * 1.5,
      spinAxis: {
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
        z: Math.random() - 0.5
      }
    });
  }

  return satellites;
}

/**
 * Cria campo de poeira e estrelas cosmicas ao fundo.
 * @param {Object} THREE
 * @param {number} count
 * @returns {{ pointsMesh: any, geometry: any }}
 */
export function createCosmicParticleField(THREE, count = 1200) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const starColors = [
    [0.0, 0.94, 1.0],  // Cyan
    [1.0, 0.0, 0.5],   // Magenta
    [0.66, 0.33, 0.97],// Purple
    [0.9, 0.95, 1.0]   // Pale white/blue
  ];

  for (let i = 0; i < count; i++) {
    // Distribuicao esferica ampla
    const dist = 40 + Math.random() * 140;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = dist * Math.cos(phi);

    const c = starColors[i % starColors.length];
    colors[i * 3] = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (THREE.Float32BufferAttribute) {
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  const pointsMesh = new THREE.Points(geometry, material);
  return { pointsMesh, geometry };
}
