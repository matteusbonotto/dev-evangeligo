# Correções

## FIX-001 — Ícones inexistentes em react-icons/fi
- **Bug**: BUG-001
- **Descrição**: `FiCoins` e `FiFlame` não são exportados por `react-icons/fi`, quebrando o typecheck do DashboardPage.
- **Correção**: Substituídos por `FiDollarSign` (ouro) e `FiZap` (sequência).
- **Teste**: `npm run typecheck` passando.
- **Data**: 2026-08-21

## FIX-002 — Teste do HomePage sem AuthProvider
- **Bug**: BUG-002
- **Descrição**: Após adicionar `useAuth` ao HomePage, os testes falhavam com "useAuth deve ser usado dentro de <AuthProvider>".
- **Correção**: Teste agora envolve o HomePage em `AuthProvider`.
- **Teste**: `npm run test` passando (2/2).
- **Data**: 2026-08-21

## FIX-003 — Binário nativo do rollup ausente (npm bug)
- **Bug**: BUG-003
- **Descrição**: `@rollup/rollup-win32-x64-msvc` instalado sem o binário `.node` (bug de dependências opcionais do npm, npm/cli#4828), quebrando o Vitest.
- **Correção**: Baixado o tarball do registry e extraído o binário manualmente no diretório do pacote.
- **Teste**: `npm run test` passando.
- **Data**: 2026-08-21

## FIX-004 — Ícones inexistentes em react-icons/gi
- **Bug**: BUG-004
- **Descrição**: `GiSword` e `GiHeart` não são exportados por `react-icons/gi`, quebrando o typecheck do HUD RPG.
- **Correção**: Substituídos por `GiBroadsword` (espada) e `GiHearts` (corações).
- **Teste**: `npm run typecheck` passando.
- **Data**: 2026-08-22

## FIX-005 — Nome do usuário sobrepondo o badge de nível no HUD
- **Bug**: BUG-005
- **Descrição**: `.hud-name-below` (absolute, `bottom: -28px`) sobrepunha `.hud-level` (absolute, `bottom: -8px`) por causa do `line-height` herdado inflando a altura real das caixas.
- **Correção**: Nome do usuário movido para fluxo normal (irmão do `.hud-ring`, não mais filho absoluto do `.hud-avatar`); impossível sobrepor por construção. `line-height` explícito adicionado a `.hud-level` e `.hud-name-below`.
- **Teste**: `npm run validate` passando; screenshot Playwright confirmando nome e badge sem sobreposição e slot de armadura vazio (calçados) visível por inteiro.
- **Data**: 2026-08-22

## FIX-006 — Inventário espremido em vez de ficar à direita da armadura/perfil
- **Bug**: BUG-006
- **Descrição**: `.hud-card { grid-column: span 1 }` não dava largura suficiente para o layout interno de 2 colunas (anel + inventário) em telas largas, espremendo o inventário numa fatia estreita.
- **Correção**: `.hud-card { grid-column: span 2 }` (a partir de 640px), garantindo largura mínima suficiente vinda do grid externo.
- **Teste**: `npm run validate` passando; screenshot Playwright em 1400×1000 confirmando inventário à direita da armadura/perfil, dentro do mesmo card.
- **Data**: 2026-08-22

## FIX-007 — Inventário vazando para fora do card
- **Bug**: BUG-007
- **Descrição**: `grid-template-columns: auto 1fr` deixava os stat-pills (que não quebram linha) determinarem a largura da coluna esquerda, zerando o espaço do inventário.
- **Correção**: Coluna esquerda fixada em `var(--hud-ring-size)` em vez de `auto`; stats agora quebram linha dentro dessa largura.
- **Teste**: `npm run validate` passando; sem overflow horizontal em 360/375/414/1400px (Playwright).
- **Data**: 2026-08-22

## FIX-008 — Cabeçalho do dashboard vazando em telas estreitas
- **Bug**: BUG-008
- **Descrição**: `.dash-header`/`.dash-user` sem `flex-wrap`, causando rolagem horizontal da página abaixo de ~410px.
- **Correção**: `flex-wrap: wrap` + `row-gap` em `.dash-header`; `flex-wrap: wrap` + `justify-content: flex-end` em `.dash-user`.
- **Teste**: `npm run validate` passando; sem overflow em 360/375/414px (Playwright).
- **Data**: 2026-08-22

## FIX-009 — Inventário vazando ao forçar largura fixa igual ao anel
- **Bug**: BUG-009
- **Descrição**: `.item-grid` com `width/height: var(--hud-ring-size)` fixo vazava no mobile (coluna `1fr` mais estreita que o anel).
- **Correção**: `width: min(var(--hud-ring-size), 100%); aspect-ratio: 1`, mais escala mobile do anel reduzida (168px→136px) para caber os dois lado a lado no mesmo tamanho.
- **Teste**: `npm run validate` passando; `getBoundingClientRect()` idêntico entre anel e grid em 375px/1400px.
- **Data**: 2026-08-22

## FIX-010 — Badges de nível/quantidade/tempo desproporcionais no mobile
- **Bug**: BUG-010
- **Descrição**: `.hud-slot-level`, `.hud-level`, `.item-tile-qty`, `.item-tile-timer` com tamanho fixo em px, não escalavam com o anel/slots.
- **Correção**: `font-size`/`padding` trocados para `clamp()` proporcional a `--hud-slot-size`/`--hud-avatar-size`.
- **Teste**: `npm run validate` passando; conferido visualmente em 375px/1400px.
- **Data**: 2026-08-22

## FIX-011 — Padding mobile do `.dash-card` nunca era aplicado (ordem das regras CSS)
- **Bug**: BUG-011
- **Descrição**: `@media (max-width: 639px) { .dash-card { padding: 14px } }` vinha antes de `.dash-card { padding: 24px }` (sem condição) no arquivo; mesma especificidade, a regra posterior vencia sempre, ignorando o ajuste mobile.
- **Correção**: Bloco `@media (max-width: 639px)` movido para depois de todas as regras base que sobrescreve.
- **Teste**: `npm run validate` passando; tamanhos de anel/grid conferidos via Playwright em 7 larguras (320 a 1400px).
- **Data**: 2026-08-22

## FIX-012 — `--hud-ring-size` via container query (`cqi`) em vez de estimativa de viewport
- **Bug**: BUG-012
- **Descrição**: `.hud-layout` ganhou `container-type: inline-size` e colunas iguais (`repeat(2, minmax(0,1fr))`); `--hud-ring-size: clamp(130px, calc(50cqi - 8px), 250px)` movida para `.hud-left`/`.hud-right` (único lugar onde a unidade `cqi` resolve corretamente — não pode ficar em `.hud-card` nem no próprio `.hud-layout`, ver ADR-011); `max-width:516px; margin-inline:auto` no `.hud-layout` centraliza o excesso em telas largas. Removido o `@media (min-width:640px)` que fixava as 5 variáveis do HUD em valores de desktop — a fórmula fluida já chega a 250px sozinha.
- **Correção**: `src/styles/global.css` (`.hud-card`, `.hud-layout`, `.hud-left, .hud-right`, `.item-grid`).
- **Teste**: Playwright medindo anel/grid/coluna em 13 larguras (320-1400px), espaço morto 0px em todas (exceto 3px em 320px). `npm run validate` passando.
- **Data**: 2026-08-22

## FIX-013 — Animação `hud-pop` migrada de `transform: scale()` para a propriedade `scale`
- **Bug**: BUG-013
- **Descrição**: `@keyframes hud-pop` usava `transform: scale(...)`, mesma propriedade do posicionamento do slot no anel; migrado para a propriedade `scale` isolada, que não é sobrescrita pelo `transform` estático. Corrigida também a regra `prefers-reduced-motion` que apontava para `.hud-slot` (classe inexistente) em vez de `.hud-ring-slot`.
- **Correção**: `src/styles/global.css` (`@keyframes hud-pop`, bloco `prefers-reduced-motion`).
- **Teste**: Playwright com `getAnimations()[0].finish()` forçado, `transform` computado confere posição correta durante e depois da animação.
- **Data**: 2026-08-22

## Formato de registro
- **ID**: FIX-001
- **Bug**: BUG-001
- **Descrição**: ...
- **Correção**: ...
- **Teste**: ...
- **Data**: ...
