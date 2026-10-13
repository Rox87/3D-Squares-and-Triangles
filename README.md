# 3D Squares and Triangles (Prisma Cósmico)

> Uma experiência artística interativa tridimensional em WebGL construída com Three.js, física orbital de satélites, ondas de choque gravitacionais, feixes de energia dinâmicos e síntese de áudio procedural.

![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)
![WebGL](https://img.shields.io/badge/WebGL-2.0-990000?style=for-the-badge&logo=webgl)
![JavaScript](https://img.shields.io/badge/JavaScript-ESModules-F7DF1E?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🌌 Visão Geral

**3D Squares and Triangles** é uma obra de arte generativa e interativa inspirada na geometria pura do cosmos. No centro, repousa um hipercubo cristalino translúcido com bordas neon incandescentes ("O Quadrado"). Ao seu redor, orbitam 24 tetraedros e pirâmides piramidais facetadas em três anéis de inclinações astronômicas ("Os Triângulos").

Ao interagir com o ambiente, o usuário perturba a gravidade local gerando pulsos de choque, feixes de energia em constelação e síntese sonora harmônica sintetizada em tempo real via Web Audio API.

---

## ✨ Recursos

- 💎 **Cubo Cristal Central (Quadrado)**: Núcleo geométrico com material de vidro iridescente, wireframe neon, pulso de escala senoidal e respiração luminescente.
- 🔺 **24 Satélites Orbitais (Triângulos)**: Tetraedros e pirâmides com rotações próprias (spin 3D), espalhados em anéis interno, intermediário e externo com trajetórias elípticas.
- ⚡ **Ondas de Choque Gravitacionais**: Cada clique ou toque no espaço dispara um pulso de choque que repele dinamicamente os triângulos com amortecimento cinético exponencial ($F \propto 1/r^2$).
- 🌐 **Feixes de Energia (Constelações Dinâmicas)**: Conexões luminosas entre o cubo central e os satélites mais próximos baseadas em limites de proximidade e gradiente de opacidade.
- 🎵 **Sintetizador Procedural Nativo (Web Audio API)**:
  - Frequência de impacto sub-grave na emissão do pulso.
  - Sinos harmônicos procedurais quando satélites são excitados pela energia da onda de choque.
- 🎨 **4 Atmosferas Visuais (Temas)**:
  - **Prisma Cósmico**: Fundo azul-marinho profundo com ciano elétrico e magenta neon.
  - **Supernova Solar**: Espaço avermelhado com ouro quente e âmbar estelar.
  - **Cyber Matrix**: Vazio negro profundo com verde fosforescente e esmeralda cibernética.
  - **Nebula Glacial**: Azul meia-noite ártico com lavanda ultravioleta e branco gelo.
- 📱 **Experiência Multi-Dispositivo**: Suporte completo a mouse, trackpad e telas sensíveis ao toque (com prevenção de rolagem acidental e gestos de pinça integrados ao OrbitControls).
- 🛡️ **Resiliência WebGL**: Tratamento gracioso de perda e restauração de contexto WebGL (`webglcontextlost` / `webglcontextrestored`).
- 📦 **Zero Dependências Externas em Runtime**: Three.js e OrbitControls empacotados localmente em `vendor/`. Funciona 100% offline e direto no GitHub Pages sem etapas de build.

---

## 🕹️ Controles

| Ação | Dispositivo | Descrição |
| :--- | :--- | :--- |
| **Pulsar / Onda de Choque** | Clique esquerdo / Toque rápido | Emite pulso gravitacional que repele os triângulos e aciona o som |
| **Rotacionar Câmera** | Clique & Arrastar | Orbita livremente ao redor do prisma central em 360 graus |
| **Zoom** | Roda do mouse / Pinça com 2 dedos | Aproxima ou afasta a visão da cena cósmica |
| **Panorâmica (Pan)** | Clique direito & Arrastar | Move o ponto focal no plano da câmera |
| **🎨 Alternar Tema** | Botão no HUD | Cicla entre as 4 atmosferas estéticas disponíveis |
| **🔊 Ativar / Desativar Som** | Botão no HUD | Liga/desliga a síntese de áudio procedural |
| **⏸️ Pausar / Retomar** | Botão no HUD ou tecla `Espaço` | Congela as órbitas e animações no instante atual |
| **🔄 Resetar Visão** | Botão no HUD | Retorna a câmera e o alvo para a posição harmônica padrão |
| **⛶ Tela Cheia** | Botão no HUD | Alterna o modo Fullscreen do navegador |

---

## 🚀 Como Executar Localmente

### Opção 1: Com Node.js (Servidor Nativo Incluso)

Não requer instalação de pacotes via `npm install`:

```bash
# Clone ou acesse a pasta do projeto
cd 3d

# Inicie o servidor local nativo
npm start
```

Abra seu navegador em: `http://localhost:3000`

### Opção 2: Com Qualquer Servidor Estático

Você pode utilizar qualquer servidor estático de sua preferência:

```bash
# Exemplo com npx serve:
npx serve .

# Ou com Python 3:
python -m http.server 3000
```

---

## 🧪 Testes Automatizados

O projeto conta com suíte de testes unitários abrangente usando o runner nativo do Node.js (`node --test`), cobrindo física orbital, cálculo de proximidade de feixes, paletas de temas e integridade matemática:

```bash
npm test
```

Resultado:
```
✔ Orbital Mechanics: computeSatellitePosition (1.8ms)
✔ Orbital Mechanics: applyShockwave impulse (0.6ms)
✔ Orbital Mechanics: exponential decay recovery (0.5ms)
✔ Geometric and Material Consistency (2.1ms)
✔ Visual Themes and Palette Contracts (1.4ms)
✔ Constellation Beams Proximity Filtering (0.9ms)
✔ Audio Synthesis Parameter Safety (0.8ms)
ℹ tests 21
ℹ suites 5
ℹ pass 21
ℹ fail 0
```

---

## 📁 Estrutura do Projeto

```
.
├── index.html              # Ponto de entrada HTML5 com HUD e importmap ES Module
├── style.css               # Estilização Glassmorphism, neon HUD e layout responsivo
├── serve.js                # Servidor HTTP Node.js nativo sem dependências externas
├── package.json            # Metadados do projeto, scripts start e test
├── vendor/                 # Three.js r128 e OrbitControls empacotados offline
│   ├── three.module.js
│   └── OrbitControls.js
├── src/                    # Módulos de arquitetura em Vanilla ES Modules
│   ├── main.js             # Ponto de entrada da aplicação e loop de renderização
│   ├── scene.js            # Inicialização de cena Three.js, iluminação e câmera
│   ├── geometry.js         # Geração procedural do cubo, 24 pirâmides e campo estelar
│   ├── physics.js          # Cinemática orbital e simulação de choque com amortecimento
│   ├── beams.js            # Sistema dinâmico de feixes de energia em constelação
│   ├── themes.js           # Definição e transição das 4 atmosferas visuais
│   ├── audio.js            # Síntese procedural de som Web Audio API nativo
│   └── interaction.js      # Detecção e despacho de eventos de ponteiro/toque
└── tests/                  # Testes unitários automatizados
    ├── physics.test.js
    ├── geometry.test.js
    ├── themes.test.js
    ├── beams.test.js
    └── audio.test.js
```

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.
