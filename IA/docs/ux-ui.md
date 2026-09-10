# UX/UI

## Princípios
- Experiência serena, acolhedora e respeitosa.
- Clareza acima de decoração.
- Feedback imediato em cada ação.
- Mobile-first.
- Acessibilidade WCAG AA.

## Design system

Tokens definidos em `src/styles/global.css` (`:root`), consolidados a partir dos
valores que já vinham emergindo das iterações do HUD (T-023 a T-030). Ver
`IA/memory/decisions.md` ADR-015 para a convenção de nomes.

### Cor
- **Primitivas** (`--verde-*`, `--dourado-*`): paleta bruta. Verde institucional
  herdado do legado (`--verde-600: #25633b`); dourado para destaque/moeda.
  Primitivas adicionais por domínio: `--coracao-*` (vidas), `--slot-*`
  (armadura/inventário vazio), `--raridade-*` (comum/raro/épico/lendário,
  mesma taxonomia usada em conquistas e bônus de conjunto), `--carne-*`
  (lado "obras da carne" da Vida Interior).
- **Aliases semânticos** (`--color-*`): papel de uso, sempre apontando para
  uma primitiva — nunca redefinem o valor diretamente. Usar estes no CSS de
  componente sempre que existir um alias aplicável:
  `--color-primary` / `-hover` / `-strong` / `-strongest` / `-surface` /
  `-surface-subtle`, `--color-accent`, `--color-text`, `--color-text-muted`,
  `--color-border`, `--color-background`, `--color-surface`, `--color-danger`,
  `--color-danger-surface`.
- Cores sem alias semântico (ex.: `--raridade-*`, `--coracao-*`) são usadas
  diretamente pelas primitivas — são específicas de domínio (RPG/gamificação),
  não papéis de UI genéricos.

### Espaçamento, raio e sombra
- `--space-2` a `--space-60` (em px, passo denso o suficiente para casar com
  os valores já usados nas telas existentes sem forçar arredondamento visual).
- `--radius-sm` (8px) a `--radius-2xl` (20px), mais `--radius-pill` (999px)
  para botões/badges arredondados. `--raio` (14px) é um alias legado usado
  por componentes mais antigos do dashboard — preferir `--radius-*` em código
  novo.
- `--shadow-sm`, `--shadow-lg`, `--shadow-text` (sombra de texto sobre
  imagem/cor sólida). `--sombra` é o alias legado equivalente a `--shadow-lg`.

### Tipografia
- `--fonte`: pilha `system-ui` (sem carregamento de fonte externa, carregamento
  instantâneo, consistente com o princípio de performance/PWA).
- `--font-size-10` a `--font-size-40`: escala em px cobrindo de rótulo pequeno
  (badges, `eyebrow`) a título de destaque.

### Componentes
- Botões, cards, modais, barras de progresso, badges — todos construídos sobre
  os tokens acima; não introduzir cor/espaçamento/raio literal novo em CSS de
  componente sem antes verificar se já existe um token para o caso.

## Fluxos principais

### Onboarding (estilo Duolingo)
1. Boas-vindas + Termos/Privacidade (consentimento).
2. Nome.
3. Nascimento (opcional).
4. E-mail.
5. Senha (com indicador de força).
6. Estado civil (opcional).
7. Objetivo.
- Barra de progresso, contador de passos, botão voltar.

### Core loop
- Aprender (trilha/aula) → Praticar (quiz) → Ser recompensado (XP/ouro/itens) → Voltar (sequência diária).

### Quiz
- Pergunta → alternativas → feedback imediato (correto/errado) → explicação + referência bíblica → próximo.

### Missões
- Lista de missões ativas → detalhe → concluir → recompensa.

### Perfil
- Nível, XP, ouro, sequência, conquistas, armadura, inventário.

## Feedback
- Microinterações suaves.
- Confirmações claras (modais).
- Estados de carregamento e vazio bem definidos.

## Acessibilidade
- Contraste adequado.
- ARIA e semântica.
- Navegação por teclado.
- VLibras.
