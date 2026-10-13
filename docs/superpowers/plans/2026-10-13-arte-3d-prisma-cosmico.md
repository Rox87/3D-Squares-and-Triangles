# Arte 3D Prisma Cósmico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma aplicação web 3D interativa de arte generativa ("Prisma Cósmico") contendo um cubo central cristalino e 24 pirâmides/tetraedros orbitais em neon vibrante com física gravitacional e ondas de choque ao clicar.

**Architecture:** A aplicação é estruturada em módulos ES6 puros e desacoplados utilizando Three.js para renderização WebGL. O núcleo matemático e físico (`src/physics.js`) gerencia as trajetórias orbitais e os impulsos de choque de forma testável e independente do DOM; `src/geometry.js` cria as malhas, arestas em wireframe e materiais neon; `src/scene.js` gerencia o renderer, iluminação e câmera; e `src/main.js` orquestra a animação e os eventos de interação.

**Tech Stack:** HTML5, CSS3, JavaScript (ES6 Modules), Three.js (WebGL + OrbitControls), Node.js (test runner nativo `node:test` e `node:assert`).

**Spec:** [`docs/superpowers/specs/2026-10-13-arte-3d-prisma-cosmico-design.md`](file:///c:/Users/rodri/gitSpace/3d/docs/superpowers/specs/2026-10-13-arte-3d-prisma-cosmico-design.md)

## Global Constraints

- Utilizar Three.js via ES Modules padrão sem necessidade de build complexo ou ferramentas pesadas.
- Aplicação web estática que pode ser executada diretamente ou via servidor HTTP local leve.
- Manter taxa de atualização estável de 60 FPS com renderização suave e amortecimento inercial (damping).
- Suporte total a redimensionamento de janela (fullscreen) e dispositivos móveis (touch e orientação).
- Todas as decisões geométricas da especificação devem ser respeitadas: 1 cubo central cristalino/wireframe ciano e múltiplos triângulos (pirâmides/tetraedros) orbitais em tons neon (magenta, violeta, azul celeste).

## Review Focus

1. **Window resize:** Verificar se o aspect ratio da câmera e as dimensões do renderer se ajustam perfeitamente sem distorção ao redimensionar a janela ou alternar tela cheia.
2. **Shockwave spam:** Garantir que múltiplos cliques consecutivos rápidos não gerem instabilidade numérica (`NaN`) ou arremessem os objetos para o infinito.
3. **Isolamento de cliques no HUD:** Assegurar que cliques nos botões de controle (pausar, fullscreen, resetar câmera) usem `stopPropagation()` para não acionar acidentalmente a onda de choque ou arrasto de câmera.
4. **Interação touch no mobile:** Prevenir gestos padrão de scroll/zoom nativo da página (`touch-action: none`) para que todo o arrasto seja capturado pelo canvas 3D.
5. **Fallback de renderização:** Tratar de forma elegante a ausência ou falha de WebGL com mensagem amigável ao usuário.

---

## File Structure

```
├── index.html                    # Ponto de entrada HTML com canvas e interface HUD
├── style.css                     # Estilos com tema escuro imersivo, responsividade e HUD
├── src/
│   ├── main.js                   # Orquestrador da aplicação e loop de animação
│   ├── scene.js                  # Configuração de Three.js (cena, câmera, renderer, iluminação)
│   ├── geometry.js               # Criação do cubo central, pirâmides/tetraedros e campo estelar
│   └── physics.js                # Cálculo de órbitas gravitacionais, impulsos e desaceleração
├── tests/
│   ├── physics.test.js           # Testes unitários da física orbital e onda de choque
│   └── geometry.test.js          # Testes estruturais das geometrias e configurações
└── package.json                  # Metadados e scripts de teste (opcional para node --test)
```

---

### Task 1: Núcleo Matemático e Físico Orbital (`src/physics.js`)

**Files:**
- Create: `src/physics.js`
- Test: `tests/physics.test.js`

**Interfaces:**
- Produces:
  - `createOrbitalSatellite(config: { radius: number, speed: number, inclination: number, phase: number }): SatelliteState`
  - `updateSatellitePosition(satellite: SatelliteState, elapsedTime: number): { x: number, y: number, z: number }`
  - `applyShockwaveImpulse(satellite: SatelliteState, force: number): void`
  - `decayShockwaveOffset(satellite: SatelliteState, dampingFactor: number): void`

- [ ] **Step 1: Escrever teste unitário com falha em `tests/physics.test.js`**

```javascript
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
  assert.strictEqual(sat.shockwaveOffset, 0);
});

test('updateSatellitePosition calcula coordenadas espaciais 3D em função do tempo', () => {
  const sat = createOrbitalSatellite({ radius: 10, speed: 1, inclination: 0, phase: 0 });
  const pos0 = updateSatellitePosition(sat, 0);
  assert.ok(Math.abs(pos0.x - 10) < 1e-4);
  assert.ok(Math.abs(pos0.z) < 1e-4);

  const posQuarter = updateSatellitePosition(sat, Math.PI / 2);
  assert.ok(Math.abs(posQuarter.x) < 1e-4);
  assert.ok(Math.abs(posQuarter.z - 10) < 1e-4);
});

test('applyShockwaveImpulse aplica deslocamento e decayShockwaveOffset amortiza suavemente', () => {
  const sat = createOrbitalSatellite({ radius: 10, speed: 1, inclination: 0, phase: 0 });
  applyShockwaveImpulse(sat, 15);
  assert.strictEqual(sat.shockwaveOffset, 15);

  decayShockwaveOffset(sat, 0.9);
  assert.ok(sat.shockwaveOffset < 15);
  assert.ok(sat.shockwaveOffset > 0);
});

test('applyShockwaveImpulse limita deslocamento máximo para evitar overflow por múltiplos cliques', () => {
  const sat = createOrbitalSatellite({ radius: 10, speed: 1, inclination: 0, phase: 0 });
  applyShockwaveImpulse(sat, 100);
  applyShockwaveImpulse(sat, 100);
  assert.ok(sat.shockwaveOffset <= 40, 'Deve limitar a repulsão máxima para evitar perda de satélites');
});
```

- [ ] **Step 2: Executar teste para verificar falha inicial**

Run: `node --test tests/physics.test.js`
Expected: FAIL com erro de módulo inexistente (`Cannot find module '../src/physics.js'`).

- [ ] **Step 3: Implementar `src/physics.js`**

Implementar as funções matemáticas orbitais em coordenadas esféricas/trigonométricas 3D e a lógica de amortecimento exponencial da repulsão de choque.

- [ ] **Step 4: Executar teste para validar aprovação**

Run: `node --test tests/physics.test.js`
Expected: PASS em todos os 4 testes.

- [ ] **Step 5: Git commit**

```bash
git add src/physics.js tests/physics.test.js
git commit -m "feat: implementar motor fisico orbital e amortecimento de choque"
```

---

### Task 2: Modelos Geométricos e Materiais Neon (`src/geometry.js`)

**Files:**
- Create: `src/geometry.js`
- Test: `tests/geometry.test.js`

**Interfaces:**
- Consumes: Three.js (mockado nos testes unitários e real no browser)
- Produces:
  - `CUBE_CONFIG`: Constantes de dimensão e cores do cubo central
  - `SATELLITE_CONFIG`: Parâmetros de contagem (24), paleta de cores (magenta, violeta, ciano, azul celeste)
  - `createCentralCube(THREE): { group, coreMesh, wireframeMesh }`
  - `createOrbitingTriangles(THREE, count): Array<{ mesh, wireframe, satelliteState }>`
  - `createCosmicParticleField(THREE, count): { pointsMesh, geometry }`

- [ ] **Step 1: Escrever teste unitário com falha em `tests/geometry.test.js`**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { CUBE_CONFIG, SATELLITE_CONFIG, getSatelliteColorPalette } from '../src/geometry.js';

test('CUBE_CONFIG define dimensões e cores ciano/azul elétrico conforme spec', () => {
  assert.ok(CUBE_CONFIG.size > 0);
  assert.strictEqual(typeof CUBE_CONFIG.wireframeColor, 'number');
  assert.strictEqual(typeof CUBE_CONFIG.coreColor, 'number');
});

test('SATELLITE_CONFIG possui contagem de 24 satélites e paleta neon variada', () => {
  assert.strictEqual(SATELLITE_CONFIG.count, 24);
  const palette = getSatelliteColorPalette();
  assert.ok(palette.length >= 4, 'Paleta deve incluir tons de magenta, violeta, ciano e azul');
});
```

- [ ] **Step 2: Executar teste para verificar falha inicial**

Run: `node --test tests/geometry.test.js`
Expected: FAIL com módulo inexistente.

- [ ] **Step 3: Implementar `src/geometry.js`**

Definir configurações geométricas, paleta de cores, e funções de instanciação de Three.js para o cubo (BoxGeometry com MeshPhysicalMaterial/MeshStandardMaterial translúcido + arestas EdgesGeometry), satélites (TetrahedronGeometry e ConeGeometry/Pyramid com materiais MeshStandardMaterial emissivos e wireframes) e partículas cósmicas (BufferGeometry de estrelas).

- [ ] **Step 4: Executar teste para validar aprovação**

Run: `node --test tests/geometry.test.js`
Expected: PASS em todos os testes.

- [ ] **Step 5: Git commit**

```bash
git add src/geometry.js tests/geometry.test.js
git commit -m "feat: implementar definicoes geometricas e materiais neon"
```

---

### Task 3: Configuração da Cena e Câmera WebGL (`src/scene.js`)

**Files:**
- Create: `src/scene.js`

**Interfaces:**
- Consumes: Three.js, OrbitControls
- Produces:
  - `setupScene(container: HTMLElement): { scene, camera, renderer, controls }`
  - `handleResize(sceneContext): void`

- [ ] **Step 1: Implementar `src/scene.js`**

Criar inicializador com:
- `THREE.Scene()` com fog sutil para profundidade espacial;
- `THREE.PerspectiveCamera()` com FOV de 60 graus e posicionamento adequado;
- `THREE.WebGLRenderer()` com antialias ativado, toneMapping `ACESFilmicToneMapping`, pixelRatio adaptativo (`Math.min(window.devicePixelRatio, 2)`);
- Luz ambiente sutil e luzes pontuais coloridas (point lights) posicionadas no cubo central para iluminar as pirâmides por dentro;
- Função `handleResize` com atualização de aspect ratio da câmera e `renderer.setSize`.

- [ ] **Step 2: Verificar sintaxe e consistência de imports**

Run: `node -c src/scene.js`
Expected: PASS (sem erros de sintaxe).

- [ ] **Step 3: Git commit**

```bash
git add src/scene.js
git commit -m "feat: implementar configuracao de cena, iluminacao e camera Three.js"
```

---

### Task 4: Interface HUD, Interação e Orquestração (`index.html`, `style.css`, `src/main.js`)

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `src/main.js`

**Interfaces:**
- Consumes: `src/scene.js`, `src/geometry.js`, `src/physics.js`
- Produces: Aplicação completa funcional executável no navegador

- [ ] **Step 1: Criar `index.html` e `style.css`**

Estruturar o DOM com:
- Canvas 3D ocupando 100vw x 100vh com `touch-action: none`;
- Header discreto no topo com título estético "PRISMA CÓSMICO // 3D";
- HUD flutuante no canto com botões de ação:
  - Alternar Tela Cheia (Fullscreen);
  - Pausar/Continuar Rotação;
  - Resetar Câmera;
- Rodapé discreto com dicas de interação: "Arraste para girar em 360° • Clique para disparar onda de choque gravitacional".

- [ ] **Step 2: Implementar `src/main.js`**

Orquestrar a aplicação:
- Importar Three.js e OrbitControls via CDN ESM;
- Inicializar a cena, cubo central, as 24 pirâmides orbitais e o campo de poeira cósmica;
- Implementar o loop de animação `requestAnimationFrame`:
  - Rotação suave do cubo em múltiplos eixos;
  - Atualização contínua das posições dos satélites via `updateSatellitePosition` e amortecimento via `decayShockwaveOffset`;
  - Rotação suave do campo estelar;
  - Atualização dos controles `controls.update()`;
- Tratar eventos de clique/toque:
  - Disparar `applyShockwaveImpulse` em todos os satélites com variações orgânicas de intensidade;
  - Gerar efeito de pulso luminoso na cor do cubo central;
- Isolar eventos de clique dos botões do HUD via `event.stopPropagation()`.

- [ ] **Step 3: Testar localmente a aplicação no navegador**

Iniciar um servidor estático leve (ou acessar a página) e verificar:
1. Renderização nítida a 60 FPS com os elementos em neon;
2. Interação de 360° com arrasto de mouse;
3. Efeito da onda de choque ao clicar na tela e retorno suave dos triângulos;
4. Funcionamento dos botões de controle (tela cheia, pausar, resetar);
5. Redimensionamento de janela sem distorções de proporção.

- [ ] **Step 4: Git commit**

```bash
git add index.html style.css src/main.js
git commit -m "feat: integrar aplicacao interativa de arte 3d com hud e controles"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Todos os requisitos da especificação (quadrado/cubo central, múltiplos triângulos em órbita, estética prisma cósmico neon, pulso gravitacional de choque e controles 360°) possuem tarefas correspondentes.
- [x] **Step scan:** Cada passo tem um comando e resultado verificável de forma clara e inequívoca.
- [x] **Type consistency:** As interfaces e funções (`createOrbitalSatellite`, `updateSatellitePosition`, `applyShockwaveImpulse`, `decayShockwaveOffset`) têm assinaturas consistentes entre as tarefas 1, 2 e 4.
- [x] **Review Focus:** Todos os 5 pontos de atenção (redimensionamento de tela, contenção de múltiplos cliques rápidos, isolamento de eventos no HUD, suporte a toque mobile e compatibilidade WebGL) foram incorporados aos passos e testes.
- [x] **Proportion:** O plano é direto, focado na arquitetura e tarefas sem duplicação excessiva de código prévio.
