# Documento de Design: Arte 3D Prisma Cósmico

## 1. Visão Geral e Intenção
Criar uma experiência artística tridimensional interativa e imersiva para a web, inspirada no conceito de formas geométricas puras em um ambiente cósmico futurista. O usuário solicitou especificamente uma composição com **um quadrado (cubo 3D central)** e **vários triângulos (pirâmides e tetraedros em órbita)** com estética **Prisma Cósmico** (Sci-Fi / Neon Glow / Wireframe) e dinâmica de **Gravidade & Órbitas Cósmicas**.

A obra visa proporcionar uma experiência visual hipnótica, elegante e fluida, com alta performance em navegadores modernos sem a necessidade de instalação de plugins ou softwares pesados.

---

## 2. Decisões do Usuário
- **Geometria Principal:** 
  - Um elemento quadrado central (materializado como um Cubo 3D de cristal translúcido com arestas em wireframe luminescente ciano/azul elétrico).
  - Múltiplos elementos triangulares (pirâmides de base triangular e tetraedros regulares) orbitando o centro em diferentes planos de inclinação e distâncias.
- **Estética & Atmosfera:** 
  - Estilo *Prisma Cósmico*: Espaço profundo com fundo em gradiente escuro/estrelado, partículas cósmicas de poeira estelar, contraste intenso, emissão neon vibrante (ciano, magenta, roxo/violeta e toques de azul celeste) e efeito de reflexos de luz.
- **Comportamento & Interatividade:**
  - *Gravidade & Órbitas*: O cubo central atua como um atrator gravitacional em rotação contínua. Os triângulos seguem órbitas suaves e oscilatórias ao redor do centro.
  - *Onda de Choque / Pulso*: Ao clicar ou tocar na tela, o cubo central emite uma onda de choque que repele dinamicamente os triângulos para longe com uma explosão suave de luz, após a qual eles desaceleram e são gradualmente atraídos de volta às suas órbitas originais.
  - *Controle de Câmera 360°*: Rotação livre de câmera por arrasto de mouse/touch (OrbitControls com amortecimento inercial suave) e zoom pela roda do mouse.

---

## 3. Metas, Não-Metas e Anti-Metas

### Metas (Goals)
1. **Fidelidade Visual:** Reproduzir a estética neon de alto impacto com materiais emissivos e reflexivos bem equilibrados.
2. **Desempenho Estável:** Garantir 60 FPS estáveis na renderização WebGL utilizando Three.js.
3. **Interatividade Fluida:** Resposta imediata e agradável ao toque/clique e movimento do mouse com interpolação suave (damping).
4. **Zero Dependências Pesadas:** Aplicação web estática (HTML/CSS/JS) pronta para ser aberta em qualquer navegador moderno diretamente (`index.html`).
5. **Responsividade:** Adaptação total a qualquer tamanho de janela (fullscreen com redimensionamento automático de canvas e câmera).

### Não-Metas (Non-Goals)
- Criação de interface complexa de modelagem 3D (não é um editor de modelos, é uma peça de arte interativa finalizada).
- Implementação de backend, banco de dados ou autenticação de usuários.
- Suporte a headsets VR/XR (a menos que seja uma adição futura opcional).

### Anti-Metas (Anti-Goals)
- Cenas estáticas ou sem vida (a obra deve ter movimento orgânico e contínuo mesmo quando o usuário não estiver interagindo).
- Poluição visual com menus e botões excessivos na tela (a arte deve ser a protagonista com controles mínimos ou discretos).
- Quedas bruscas de taxa de quadros causadas por excesso descontrolado de luzes ou partículas.

---

## 4. Restrições Técnicas
- **Tecnologia de Renderização:** WebGL via Three.js (carregado via CDN ou pacote local limpo).
- **Compatibilidade:** Funcionar de forma nativa no Chrome, Edge, Firefox e Safari em desktop e dispositivos móveis.
- **Estrutura de Arquivos:** Manter o projeto limpo e autossuficiente (e.g. `index.html`, `style.css`, `main.js` ou aplicação empacotada de fácil execução).

---

## 5. Deixado ao Desenvolvedor (Decisões do Builder)
- Número ideal de triângulos/pirâmides orbitais (recomendado entre 16 e 32 elementos para equilíbrio entre densidade e clareza visual).
- Efeitos pós-processamento opcionais (como Bloom / UnrealBloomPass ou iluminação volumétrica via shaders para intensificar o efeito neon, com fallback de alta performance).
- Controles de UI discretos (um pequeno botão sutil no canto para pausar/retomar rotação, alternar tela cheia e resetar a visão da câmera).
- Efeito sonoro sutil opcional (áudio procedural sintetizado via Web Audio API ativado apenas se o usuário interagir, mantendo mudo por padrão para não incomodar).
