/**
 * Modulo de temas visuais e paletas de cores para o Prisma Cosmico 3D.
 */

export const THEMES = {
  cosmic: {
    name: 'Prisma Cósmico',
    cubeCore: 0x051329,
    cubeWire: 0x00f0ff,
    cubeLight: 0x00f0ff,
    satellites: [0xff007f, 0xa855f7, 0x00f0ff, 0x38bdf8, 0xf43f5e, 0x818cf8],
    beamColor: 0x00f0ff,
    bg: 0x03030c,
    fog: 0x03030c,
    light1: 0xff007f,
    light2: 0x7928ca
  },
  solar: {
    name: 'Supernova Solar',
    cubeCore: 0x2b0e02,
    cubeWire: 0xffaa00,
    cubeLight: 0xff7700,
    satellites: [0xff3b30, 0xff9500, 0xffcc00, 0xff5e3a, 0xffa000],
    beamColor: 0xffbb00,
    bg: 0x0a0402,
    fog: 0x0a0402,
    light1: 0xff3b30,
    light2: 0xffaa00
  },
  matrix: {
    name: 'Cyber Matrix',
    cubeCore: 0x011a09,
    cubeWire: 0x00ff66,
    cubeLight: 0x00ff88,
    satellites: [0x00ff66, 0x10b981, 0x34d399, 0x059669, 0xa7f3d0],
    beamColor: 0x00ff88,
    bg: 0x010803,
    fog: 0x010803,
    light1: 0x00ff66,
    light2: 0x10b981
  },
  glacial: {
    name: 'Nebula Glacial',
    cubeCore: 0x0a192f,
    cubeWire: 0xe0f2fe,
    cubeLight: 0x7dd3fc,
    satellites: [0xf8fafc, 0xbae6fd, 0x7dd3fc, 0x38bdf8, 0xc7d2fe],
    beamColor: 0xbae6fd,
    bg: 0x020817,
    fog: 0x020817,
    light1: 0x38bdf8,
    light2: 0x818cf8
  }
};

/**
 * Retorna as chaves de temas disponiveis.
 * @returns {string[]}
 */
export function getThemeList() {
  return Object.keys(THEMES);
}

/**
 * Retorna a configuracao de um tema pelo identificador.
 * @param {string} key
 * @returns {Object}
 */
export function getTheme(key) {
  return THEMES[key] || THEMES.cosmic;
}

/**
 * Aplica um tema visual em tempo real nos materiais e luzes da cena Three.js.
 * @param {string} themeKey
 * @param {Object} context
 * @param {Object} context.cube
 * @param {Array} context.satellites
 * @param {Array} context.pointLights
 * @param {Object} context.scene
 * @param {Object} THREE
 */
export function applyTheme(themeKey, { cube, satellites, pointLights, scene }, THREE) {
  const theme = getTheme(themeKey);

  // 1. Atualizar cubo central
  if (cube) {
    if (cube.coreMesh?.material) {
      cube.coreMesh.material.color.setHex(theme.cubeCore);
    }
    if (cube.wireframeMesh?.material) {
      cube.wireframeMesh.material.color.setHex(theme.cubeWire);
    }
    if (cube.internalLight) {
      cube.internalLight.color.setHex(theme.cubeLight);
    }
  }

  // 2. Atualizar satelites
  if (Array.isArray(satellites)) {
    satellites.forEach((sat, i) => {
      const colorHex = theme.satellites[i % theme.satellites.length];
      if (sat.mesh?.material) {
        sat.mesh.material.color.setHex(colorHex);
        sat.mesh.material.emissive.setHex(colorHex);
      }
    });
  }

  // 3. Atualizar luzes pontuais
  if (Array.isArray(pointLights)) {
    if (pointLights[0]) pointLights[0].color.setHex(theme.cubeLight);
    if (pointLights[1]) pointLights[1].color.setHex(theme.light1);
    if (pointLights[2]) pointLights[2].color.setHex(theme.light2);
  }

  // 4. Atualizar fundo e neblina
  if (scene) {
    if (scene.background && THREE.Color) {
      scene.background.setHex(theme.bg);
    }
    if (scene.fog && THREE.Color) {
      scene.fog.color.setHex(theme.fog);
    }
  }
}
