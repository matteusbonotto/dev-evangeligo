# Bugs

## BUG-001 — Ícones inexistentes em react-icons/fi
- **Descrição**: `FiCoins` e `FiFlame` não são exportados por `react-icons/fi`, quebrando o typecheck do DashboardPage.
- **Causa**: Ícones usados não existem no conjunto Feather Icons.
- **Root cause**: Nome de ícones assumido sem verificar a API de `react-icons/fi`.
- **Correção**: Substituídos por `FiDollarSign` e `FiZap`.
- **Teste**: `npm run typecheck` passando.
- **Status**: corrigido

## BUG-002 — Teste do HomePage sem AuthProvider
- **Descrição**: Após adicionar `useAuth` ao HomePage, os testes falhavam com "useAuth deve ser usado dentro de <AuthProvider>".
- **Causa**: O teste renderizava o HomePage sem o provider de autenticação.
- **Root cause**: Novo hook de contexto adicionado sem atualizar o teste.
- **Correção**: Teste envolve o HomePage em `AuthProvider`.
- **Teste**: `npm run test` passando (2/2).
- **Status**: corrigido

## BUG-003 — Binário nativo do rollup ausente (npm bug)
- **Descrição**: `@rollup/rollup-win32-x64-msvc` instalado sem o binário `.node`, quebrando o Vitest.
- **Causa**: Bug de dependências opcionais do npm (npm/cli#4828).
- **Root cause**: npm não baixa o binário nativo da plataforma.
- **Correção**: Tarball baixado do registry e binário extraído manualmente.
- **Teste**: `npm run test` passando.
- **Status**: corrigido

## BUG-004 — Ícones inexistentes em react-icons/gi
- **Descrição**: `GiSword` e `GiHeart` não são exportados por `react-icons/gi`, quebrando o typecheck do HUD RPG.
- **Causa**: Nomes de ícones assumidos sem verificar a API de `react-icons/gi`.
- **Root cause**: Plano de design citou ícones inexistentes.
- **Correção**: Substituídos por `GiBroadsword` e `GiHearts`.
- **Teste**: `npm run typecheck` passando.
- **Status**: corrigido

## BUG-005 — Nome do usuário sobrepondo o badge de nível no HUD
- **Descrição**: `.hud-name-below` e `.hud-level` eram ambos `position: absolute` com offsets `bottom` calculados sem considerar o `line-height: 1.6` herdado do `body`; a caixa real do texto ficava mais alta que o previsto e o pill do nome sobrepunha ~6-8px do badge "Nv X", cortando-o visualmente. O mesmo posicionamento absoluto also deixava o slot vazio de armadura (calçados, ângulo 90°) visualmente colado ao pill do nome, parecendo um elemento "fantasma" cortado.
- **Causa**: Layout construído com offsets `bottom` mágicos (absolute) em vez de fluxo normal, já era a 2ª iteração de ajuste manual de posição (T-024 → T-025) no mesmo ponto.
- **Root cause**: Uso de posicionamento absoluto empilhado para elementos que deveriam estar em fluxo sequencial (avatar → nível → nome).
- **Correção**: `hud-name-below` movido para fora do `.hud-avatar`/`.hud-ring`, como irmão em fluxo normal logo abaixo do anel (`AvatarRPG.tsx`); CSS correspondente trocado de `position: absolute` para pill normal em fluxo, com `line-height` explícito.
- **Teste**: `npm run validate` passando; verificado visualmente via Playwright (screenshot do `/jornada` com usuário demo).
- **Status**: corrigido

## BUG-006 — Inventário espremido em vez de ficar à direita da armadura/perfil (telas largas)
- **Descrição**: Em viewports largos (ex.: 1400px), `.dash-grid` (`repeat(auto-fit, minmax(300px, 1fr))`) cria várias colunas de ~300-320px. `.hud-card` só ocupava 1 dessas colunas (`grid-column: span 1`), mas seu layout interno (`.hud-layout { grid-template-columns: auto 1fr }`) precisa de ~474px (anel 250px + gap 28px + grid de inventário 148px mín. + padding 48px) para caber anel e inventário lado a lado. Resultado: o inventário era espremido numa fatia estreita entre o card do HUD e o card "Vida interior", em vez de aparecer à direita da armadura/perfil como pretendido.
- **Causa**: `grid-column: span 1` no `.hud-card` não reservava largura suficiente do grid externo para o layout interno de 2 colunas.
- **Root cause**: A largura do card dependia do número de colunas que o grid externo decidisse criar (responsivo ao viewport), não da largura mínima real exigida pelo conteúdo interno.
- **Correção**: `.hud-card` passou a `grid-column: span 2` a partir de 640px, garantindo no mínimo 2×300px+gap ≈ 620px de largura — suficiente para o layout interno.
- **Teste**: `npm run validate` passando; verificado visualmente via Playwright em viewport 1400×1000 (inventário renderizando corretamente à direita da armadura/perfil, dentro do mesmo card).
- **Status**: corrigido

## BUG-007 — Inventário vazando para fora do card (coluna "auto" do grid crescia com os stat-pills)
- **Descrição**: Ao trocar `.hud-layout` para `grid-template-columns: var(--hud-ring-size) 1fr` (ADR-008), foi preciso abandonar `auto 1fr`: com `auto`, o grid mede a coluna esquerda pelo `max-content` do seu conteúdo, e `.hud-stats` (pills de ouro/dias/medalhas) não quebra linha por padrão — então a coluna "auto" crescia para caber os 3 pills lado a lado (~275px em vez dos 168px do anel em mobile), zerando o espaço da coluna `1fr` do inventário, que então vazava para fora do card (grid fixo do `.item-grid` não encolhe).
- **Causa**: `grid-template-columns: auto 1fr` mede pelo conteúdo mais largo da coluna esquerda (stats), não pelo anel.
- **Root cause**: A largura da coluna do HUD dependia do conteúdo variável (stats) em vez de uma dimensão controlada (o próprio anel).
- **Correção**: Coluna esquerda fixada em `var(--hud-ring-size)`; `.hud-stats` (já com `flex-wrap: wrap`) agora quebra em várias linhas dentro dessa largura fixa, como esperado.
- **Teste**: `npm run validate` passando; `document.body.scrollWidth` verificado igual à largura do viewport (sem overflow) em 360/375/414/1400px via Playwright.
- **Status**: corrigido

## BUG-008 — Cabeçalho do dashboard vazando em telas estreitas (pré-existente, achado ao testar T-027)
- **Descrição**: `.dash-header`/`.dash-user` (marca + avatar + nome + selo "Demonstração" + botão sair) não quebravam linha; abaixo de ~410px de largura o conjunto não cabia e causava rolagem horizontal na página inteira, independente do HUD.
- **Causa**: Nenhuma regra de wrap/responsividade no cabeçalho.
- **Root cause**: Cabeçalho nunca foi testado em larguras muito estreitas (<400px) desde sua criação (T-004).
- **Correção**: `.dash-header` e `.dash-user` ganharam `flex-wrap: wrap` (+ `row-gap`/`justify-content: flex-end` no `.dash-user`) para quebrar graciosamente em vez de vazar.
- **Teste**: `npm run validate` passando; sem overflow em 360/375/414px via Playwright.
- **Status**: corrigido

## BUG-009 — Inventário vazando ao forçar largura fixa igual ao anel
- **Descrição**: Ao tentar igualar `.item-grid` a `width/height: var(--hud-ring-size)` diretamente (para alinhar com o anel), o grid vazava para fora do card no mobile — a coluna `1fr` de `.hud-layout` é mais estreita que `--hud-ring-size` em telas pequenas (anel+gap já consomem quase toda a largura disponível), então forçar a mesma largura excede o espaço da coluna.
- **Causa**: Largura fixa não respeita o espaço real disponível na coluna do grid.
- **Root cause**: Tentativa de igualar tamanhos absolutos sem considerar que o espaço disponível varia por breakpoint.
- **Correção**: `width: min(var(--hud-ring-size), 100%); aspect-ratio: 1` (usa o tamanho do anel quando cabe, encolhe mantendo-se quadrado quando não cabe) — combinado com redução da escala mobile do anel (168px→136px, ver ADR-009) para que "quando cabe" seja sempre o caso até 360px de viewport.
- **Teste**: `npm run validate` passando; `getBoundingClientRect()` do anel e do grid idênticos em 375px e 1400px via Playwright.
- **Status**: corrigido

## BUG-010 — Badges de nível/quantidade/tempo desproporcionais ao encolher para o mobile
- **Descrição**: `.hud-slot-level`, `.hud-level`, `.item-tile-qty`, `.item-tile-timer` tinham `font-size`/`padding` fixos em px, sem relação com `--hud-slot-size`/`--hud-avatar-size`. Quando a escala mobile encolheu o anel/slots, esses badges continuaram do mesmo tamanho absoluto, ficando visualmente grandes demais em relação aos ícones minúsculos.
- **Causa**: Nenhuma dessas 4 regras usava as variáveis CSS de escala introduzidas no ADR-008.
- **Root cause**: Variáveis de escala foram aplicadas aos contêineres (slot, avatar, tile) mas não aos elementos de texto/badge dentro deles.
- **Correção**: `font-size` e `padding` trocados para `clamp(mínimo-legível, calc(var(--hud-*-size) * fator), teto-atual)` — proporcional dentro de uma faixa legível, em vez de fixo ou livre para encolher até ilegível.
- **Teste**: `npm run validate` passando; conferido visualmente em 375px e 1400px via Playwright.
- **Status**: corrigido

## BUG-011 — Padding mobile do `.dash-card` nunca era aplicado (ordem das regras CSS)
- **Descrição**: `@media (max-width: 639px) { .dash-card { padding: 14px } }` foi escrito ANTES da regra base `.dash-card { padding: 24px }` no arquivo. Com a mesma especificidade (mesmo seletor, nenhuma classe extra), a regra que vem DEPOIS no arquivo vence — mesmo a media query "batendo" no viewport, a regra base (posterior, incondicional) sobrescrevia o padding reduzido. Sintoma indireto: o grid do inventário calculado via `min(var(--hud-ring-size), 100%)` nunca alcançava o tamanho do anel em telas de 320-414px, porque o espaço real disponível era menor do que a fórmula assumia (padding real 24px, não os 14px pretendidos).
- **Causa**: Ordem de declaração no arquivo CSS.
- **Root cause**: Bloco de media query inserido no meio do arquivo, antes de uma regra base do mesmo seletor definida mais abaixo — nenhum erro de lint/build acusa isso, só aparece como sintoma visual indireto.
- **Correção**: Bloco `@media (max-width: 639px)` movido para depois de todas as regras base que ele sobrescreve (`.dash-card`, `.dashboard`, `.hud-stats`, `.stat-pill`, `.hud-layout .eyebrow`), ao lado do `@media (min-width: 640px)` já existente.
- **Teste**: `npm run validate` passando; `getBoundingClientRect()` do anel e do grid conferido em 320/360/375/390/414/430/1400px via Playwright — tamanhos batendo (±2px de arredondamento) em todos.
- **Status**: corrigido

## BUG-012 — Anel de armadura trava em 168px e deixa espaço morto crescente (até 233px) entre 414-639px de largura
- **Descrição**: usuário reportou "no mobile tem muito espaço em branco e poderia ser mais aproveitado". Medição via Playwright confirmou: o anel (`--hud-ring-size`, fórmula do ADR-010) tinha teto de 168px, mas a coluna do inventário (`1fr` no grid) continuava crescendo com a largura da tela — o grid do inventário ficava preso ao tamanho do anel (168px), sobrando um vão vazio só do lado direito, crescendo de 8px (414px) até 233px (639px de largura). O mesmo padrão (66-142px) se repetia em qualquer largura desktop ≥768px porque o teto ali era um valor fixo (250px) via media query, independente da largura real do card.
- **Causa**: `--hud-ring-size` estimado a partir da viewport (`vw`) com um teto escolhido sem checar o comportamento em larguras intermediárias; `.hud-layout` usava colunas assimétricas (`var(--hud-ring-size) 1fr`) em vez de colunas iguais.
- **Root cause**: a mesma classe de erro do BUG-011 — depender de uma estimativa (viewport) em vez de medir o container real. Qualquer teto fixo escolhido "no olho" eventualmente fica pequeno demais para alguma faixa de largura real, e como o inventário não tinha como saber o tamanho real da coluna, não tinha como acompanhar.
- **Correção**: ver ADR-011 — `.hud-layout` vira container query (`container-type: inline-size`) com colunas iguais (`repeat(2, minmax(0,1fr))`); `--hud-ring-size` passa a ser `clamp(130px, calc(50cqi - 8px), 250px)`, medida do próprio `.hud-layout`, com `max-width` + `margin-inline:auto` para centralizar o excesso em vez de deixá-lo de um lado só.
- **Teste**: Playwright medindo `getBoundingClientRect()` de anel/grid/coluna em 13 larguras (320-1400px) — espaço morto 0px em todas exceto 3px em 320px (arredondamento). `npm run validate` passando.
- **Status**: corrigido

## BUG-013 — Slots de armadura colapsam no centro do anel durante a animação de entrada (`hud-pop`)
- **Descrição**: descoberto ao investigar por que os slots do anel sumiam da tela em teste headless a 320px — na verdade acontece em qualquer largura, por 0.3s a cada montagem do componente, em qualquer navegador.
- **Causa**: `.hud-ring-slot` usa `transform` tanto para posicionar o slot no anel (`rotate()+translateX()+rotate()`) quanto, via `animation: hud-pop`, para o efeito de "pop" de entrada (`transform: scale()`). Uma animação CSS substitui o valor INTEIRO da propriedade animada enquanto está ativa — não combina com o valor estático da mesma propriedade definido fora do `@keyframes`.
- **Root cause**: posição (crítica para o layout) e efeito decorativo (escala) compartilhando a mesma propriedade CSS.
- **Correção**: `@keyframes hud-pop` migrado de `transform: scale(...)` para a propriedade `scale` isolada (CSS Transforms nível 2), que não conflita mais com `transform`. De brinde, corrigida a regra de `prefers-reduced-motion` que apontava para uma classe inexistente (`.hud-slot`, deveria ser `.hud-ring-slot`) e por isso nunca desativava essa animação para quem pediu menos movimento.
- **Teste**: Playwright com `getAnimations()[0].finish()` forçado — `transform` computado confere a posição correta (`translateY(-100px)` no slot do topo em escala desktop) tanto durante quanto depois da animação.
- **Status**: corrigido

## Formato de registro
- **ID**: BUG-001
- **Descrição**: ...
- **Causa**: ...
- **Root cause**: ...
- **Correção**: ...
- **Teste**: ...
- **Status**: aberto / corrigido
