# Alterações

## 2026-08-21 — Criação do framework IA/
- Criada a estrutura `IA/` (núcleo operacional de conhecimento).
- Criados agentes especialistas (teologia reformada, jurídico, privacidade, gamificação, RPG, game design, engenharia).
- Criada memória global (project-memory, user-requirements, rules, decisions, bugs, fixes, changes, changelog).
- Criado `IA/config.json`.
- Análise do legado `dev-pwa-biblia-game` concluída.

## 2026-08-21 — Fundação do app profissional
- Criado scaffold Vite + React + TypeScript estrito + PWA no workspace `evangeligo`.
- Criado design system base (`src/styles/global.css`).
- Criadas páginas públicas (Home, Legal) e feature de autenticação (SignIn).
- Configurados ESLint, Prettier, Vitest, Playwright, TanStack Query, Supabase client.
- `npm run validate` passando (typecheck, lint, test, build).
- PWA gerado (manifest, service worker).

## 2026-08-21 — Renomeação para EvangeliGO
- Nome do app definido como **EvangeliGO** (substitui "Jornada da Fé").
- Atualizados: package.json, vite.config.ts (manifest PWA), index.html, HomePage, SignInPage, LegalPage, README, IA/ (README, agents, memory, checklist).
- Build regenerado e `npm run validate` passando.

## 2026-08-21 — Botão de demonstração com usuário mock (T-004)
- Criado `src/features/authentication/demo/demoUser.ts` com usuário mock completo ("Visitante", nível 7, XP 1240/1500, ouro 320, sequência 12, 4 conquistas, 3 itens, armadura completa).
- Criado `src/features/authentication/context/AuthContext.tsx` (AuthProvider, signInDemo, signOut, useAuth).
- Adicionado AuthProvider em `src/main.tsx`.
- Criado `src/features/dashboard/pages/DashboardPage.tsx` (perfil, progresso, armadura, conquistas, inventário).
- Adicionada rota `/jornada` em `routePaths.ts` e lazy load em `AppRouter.tsx`.
- Adicionado botão de demonstração na HomePage (FiPlay + useAuth + useNavigate).
- Adicionado CSS do dashboard em `src/styles/global.css`.
- Corrigido typecheck: `FiCoins`/`FiFlame` (inexistentes em react-icons/fi) substituídos por `FiDollarSign`/`FiZap`.
- Corrigido teste do HomePage para envolver em AuthProvider.
- Corrigido bug do npm/rollup (binário `@rollup/rollup-win32-x64-msvc` ausente) extraindo o tarball manualmente.
- `npm run validate` passando.

## 2026-08-22 — Redesign do dashboard (Duolingo + HUD RPG compacto) (T-023)
- Estendido `demoUser.ts`: `InventoryItem` ganhou `durationMinutes`/`expiresAt`; `DemoUser` ganhou `hearts`/`maxHearts`. Escudo da Fé agora tem duração de 30 min (ativo ao carregar).
- Criado `src/features/dashboard/hooks/useCountdown.ts` (timer "expira em X min", atualiza a cada 30s).
- Criados componentes: `StatBar` (barra de progresso acessível), `StatPill` (pill ouro/verde), `ArmorSlots`, `HeartsBar`, `AvatarRPG` (grade 3×3 isométrica: avatar central + 6 slots de armadura + corações + nível), `ItemSlots` (grupos permanente/consumível com quantidade e timer).
- Criado `src/features/dashboard/armorSlots.ts` (mapa slot→ícone `react-icons/gi`).
- Refatorado `DashboardPage.tsx` para compor os novos componentes; corrigida a classe `rarity-{...}` (antes virava classe literal) para `rarity--comum|raro|epico|lendario`.
- Adicionada seção "Dashboard RPG HUD" em `global.css` (grade, slots, barras, microinterações, `prefers-reduced-motion`, contraste AA do dourado).
- Corrigido typecheck: `GiSword`→`GiBroadsword` e `GiHeart`→`GiHearts` (não existem em react-icons/gi).
- `npm run validate` passando.

## 2026-08-22 — Refinamento do HUD (anel de armadura + 9 slots de itens) (T-024)
- Estendido `demoUser.ts`: `ArmorSlot` ganhou `rarity`, `level`, `effect`, `effectType` (passivo/reativo); `inventory` expandido para 9 itens (4 permanentes: Bíblia de Estudo, Catecismo de Heidelberg, Comentário de Calvino, Harpa Cristã; 5 consumíveis: Proteção da Fé 30min, Coração Extra, Poção de Foco 20min, Tocha da Verdade 15min, Pão da Vida 25min). Consumível "Escudo da Fé" renomeado para "Proteção da Fé" (evita colisão com a peça de armadura). Calçados do Evangelho deixados não equipados para demonstrar empty state.
- `armorSlots.ts`: adicionado `angle` ao meta (capacete -90°, espada -30°, couraça 30°, calçados 90°, cinto 150°, escudo 210°).
- `AvatarRPG.tsx`: refatorado de grade 3×3 para anel uniforme (posicionamento absoluto com `rotate(angle) translateX(88px) rotate(-angle)`); removido o check; nome abaixo da foto; nível no rodapé da foto; corações junto ao nome; slots com raridade (borda colorida) + badge de nível + tooltip/aria-label com efeito.
- `ItemSlots.tsx`: refatorado para grade 3×3 de tiles compactos (ícone + nome truncado + quantidade + tag); permanentes mostram "Permanente" (sem tempo), consumíveis mostram timer via `useCountdown`; novos ícones (GiOpenBook, GiMusicalNotes, GiTorch, GiBread, GiShield).
- `DashboardPage.tsx`: HUD + inventário fundidos em `.hud-layout` (esquerda: anel + stats; direita: 9 slots); removidos os cards "Seu personagem", "Armadura de Deus" e "Inventário" separados; pill de nível trocado por contagem de medalhas (conquistas).
- `global.css`: adicionados `.hud-layout`, `.hud-ring`, `.hud-ring-slot`, `.hud-identity`, `.hud-name`, `.hud-slot--rarity-*`, `.hud-slot-level`, `.item-grid`, `.item-tile`; corrigido contraste do `.rarity--lendario` (texto escuro sobre dourado); media query ≥640px para duas colunas.
- `npm run validate` passando.

## 2026-08-22 — Ajustes finos do HUD (anel + grid único + vida interior) (T-025)
- `demoUser.ts`: adicionados `fruitsOfFlesh: 35` e `worksOfSpirit: 65` (vida interior reformada em progresso).
- `AvatarRPG.tsx`: corações movidos para **acima do anel** (como barra de HP); nome do usuário posicionado logo abaixo do badge "Nv 7" (dentro do anel, colado ao avatar); removido o bloco `.hud-identity` separado; ring ampliado para 250×250 px e raio 100 px para evitar sobreposição com nome.
- `ItemSlots.tsx`: refatorado para grid único de 9 tiles quadrados (44×44 px, 3×3), mesmo tamanho dos slots de armadura; removidas as divisões "Permanentes"/"Consumíveis"; cada tile mostra apenas ícone, quantidade em badge e timer pequeno (só para consumíveis ativos); nomes não cabem no tile e ficam em `title`/`aria-label`.
- `SpiritFleshBars.tsx`: novo componente com duas barras — "Frutos da Carne" (vermelho, 35%) e "Obras do Espírito" (verde→dourado, 65%), acessíveis via `role="progressbar"`.
- `DashboardPage.tsx`: adicionada seção "Vida interior" com `SpiritFleshBars` abaixo do HUD; removido título "Seu personagem".
- `global.css`: atualizado `.hud-block` (corações com badge translúcido), `.hud-name-below`, `.hud-avatar` ajustado para acomodar nome, `.item-grid` e `.item-tile` para 44×44 px, `.item-tile-qty`, `.item-tile-timer`; adicionado `.spirit-flesh-bars`, `.sf-bar`, `.sf-label`, `.sf-track` e variáveis de gradiente; ajustado media query para alinhar grid de inventário à esquerda no desktop.
- `npm run validate` passando.

## 2026-08-22 — Correção de sobreposição no HUD + "Vida interior" como 9 duelos de ícones (T-026)
- Feedback do usuário (screenshot do HUD): (1) posicionamento do HUD ainda incorreto, (2) nome "Visitante" cortando o badge "Nv 7", (3) "Frutos da Carne"/"Obras do Espírito" não deveriam ser 2 barras, e sim um ícone por virtude/vício (bondade, domínio próprio, longanimidade etc.), com fruto do Espírito e obras da carne na mesma quantidade competindo entre si, e o objetivo do jogador é manter o fruto do Espírito sempre superior.
- **BUG-005/FIX-005**: `AvatarRPG.tsx` — nome do usuário movido de `position: absolute` (sobrepondo `.hud-level`) para fluxo normal, como irmão do `.hud-ring`; `global.css` — `.hud-name-below` reescrito sem `position: absolute`, `line-height` explícito adicionado a `.hud-level`/`.hud-name-below`. Corrige também o slot vazio de armadura (calçados) que aparecia visualmente colado ao nome.
- **ADR-007**: `demoUser.ts` — campos `fruitsOfFlesh`/`worksOfSpirit` (nomes doutrinariamente invertidos) removidos; novo `SpiritBattleEntry[]` (`spiritBattle`) com 9 pares Fruto do Espírito × Obra da Carne (Gl 5:19-23), obras da carne agrupadas de ~17 citações em 9 categorias para casar em quantidade com os 9 frutos.
- Criado `src/features/dashboard/components/SpiritBattle.tsx` (substitui `SpiritFleshBars.tsx`, removido): resumo no topo (soma total Fruto × Carne com troféu indicando quem está à frente + mensagem de incentivo), lista de 9 linhas com ícone de fruto (react-icons/gi) à esquerda, ícone de obra da carne à direita, e uma barra dupla (`role="progressbar"`) mostrando a proporção entre os dois valores; ícone do lado que está à frente fica em opacidade total, o outro esmaecido.
- `DashboardPage.tsx`: import/uso trocado de `SpiritFleshBars` para `SpiritBattle`; título da seção atualizado para "Vida interior — Gálatas 5:16-23".
- `global.css`: `.spirit-flesh-bars`/`.sf-*` removidos; adicionados `.spirit-battle`, `.sb-summary`, `.sb-goal`, `.sb-list`, `.sb-row`, `.sb-icon`, `.sb-track`, `.sb-fill-fruit`, `.sb-fill-flesh`, `.sb-track-label`.
- Verificado visualmente: dev server (`npm run dev`) + Playwright headless navegando até `/jornada` via botão "Ver demonstração", screenshots confirmando nome/badge sem sobreposição, slot de armadura vazio visível por inteiro, e os 9 duelos de ícones renderizando corretamente (nenhum erro no console do navegador).
- `npm run validate` passando (format, lint, typecheck, test, build).
- **Pendência**: pareamento fruto×obra (ADR-007) é decisão de design/UX, não validação doutrinária formal — recomendado revisão do agente `teologia-reformada` antes de tratar como conteúdo final (hoje é dado mock).

## 2026-08-22 — BUG-006/FIX-006: inventário espremido em telas largas
- Feedback do usuário (screenshot em janela larga): inventário não estava à direita da armadura/perfil, aparecia espremido numa fatia estreita entre os cards.
- Causa: `.hud-card { grid-column: span 1 }` não reservava largura suficiente do `.dash-grid` externo (`repeat(auto-fit, minmax(300px, 1fr))`) para o `.hud-layout` interno de 2 colunas (anel 250px + inventário 148px mín. + gaps/padding ≈ 474px necessários).
- Correção: `.hud-card { grid-column: span 2 }` a partir de 640px.
- Verificado visualmente via Playwright em 1400×1000: inventário corretamente à direita da armadura/perfil.
- `npm run validate` passando.

## 2026-08-22 — HUD com layout único responsivo (mobile = desktop, escalado) (T-027)
- Feedback do usuário: (1) no desktop a escala do HUD estava "irregular"/desalinhada; (2) o nome do usuário deve ficar logo abaixo do badge de nível (não mais distante, no fluxo normal abaixo do anel inteiro); (3) o mesmo layout lado a lado (anel + inventário) deve valer tanto em mobile quanto em desktop, reduzindo a escala no mobile em vez de empilhar verticalmente — pedido explícito para "conferir com os agentes" antes de decidir a abordagem (ver ADR-008).
- **ADR-008**: `global.css` — dimensões do HUD (`--hud-ring-size`, `--hud-ring-radius`, `--hud-slot-size`, `--hud-avatar-size`, `--hud-avatar-font`) viraram variáveis CSS escopadas em `.hud-card`, com valores compactos por padrão (mobile: anel 168px) e valores atuais a partir de 640px (desktop: anel 250px). `.hud-ring-slot`, `.hud-avatar`, `.item-grid`, `.item-tile`, `.item-tile-icon` passaram a usar `var()`/`calc()` em vez de pixels fixos. `.hud-layout` (`grid-template-columns`, `align-items: start`) e `.hud-right` (flex column) deixaram de ser exclusivos do breakpoint ≥640px — agora é o layout único, em todas as larguras.
- `AvatarRPG.tsx`/`global.css`: nome do usuário aproximado do badge de nível via `margin-bottom` calibrado visualmente em `.hud-ring` (`--hud-name-pull`, diferente por escala — a folga real entre o badge e o slot de baixo não escala linearmente com o anel, então foi calibrado por captura de tela, não por fórmula pura).
- **BUG-007/FIX-007**: `.hud-layout` não podia usar `grid-template-columns: auto 1fr` — os stat-pills (ouro/dias/medalhas), que não quebram linha, faziam a coluna "auto" crescer e zerar o espaço do inventário (vazava para fora do card). Corrigido fixando a coluna esquerda em `var(--hud-ring-size)`.
- `.hud-left { gap: 32px }` (era 16px) para o bloco de stats não colidir com o slot de armadura vazio (calçados) depois que o nome foi aproximado do badge.
- **BUG-008/FIX-008**: achado ao testar em telas estreitas — `.dash-header`/`.dash-user` (cabeçalho da página, não relacionado ao HUD) vazava horizontalmente abaixo de ~410px. Corrigido com `flex-wrap: wrap`.
- `.dashboard`/`.dash-card`: padding reduzido abaixo de 640px (24px→18px) para sobrar espaço ao layout lado a lado no mobile.
- Verificado visualmente via Playwright em 360, 375, 414 e 1400px: sem rolagem horizontal em nenhuma largura (`document.body.scrollWidth` = largura do viewport), nome sem sobrepor o badge, slot vazio de armadura sem colidir com nome/stats, layout idêntico (anel + inventário lado a lado) em todas as larguras testadas.
- `npm run validate` passando (format, lint, typecheck, test, build).

## 2026-08-22 — Reorganização do HUD (nome no topo, armadura=inventário, arcos de conjunto, bônus, Vida Interior em %) (T-028)
- Feedback do usuário em 3 rodadas sobre o mesmo HUD:
  1. "Coloca o nome no lugar dos corações. Abaixo do nome, armadura ao lado de inventário, alinhadinhos na mesma linha. Os 3 badges devem ser lado a lado, não um em cima do outro. Corações centralizados no rodapé. Tempos/quantidades dos itens desproporcionais. Vida interior tem uma conta que não entendi e um troféu que deveria ser um símbolo VS."
  2. "Consegue fazer uma linha curvada conectando cada slot equipado da armadura, dando impressão de círculo? Se todas as peças forem da mesma raridade, deve pulsar na cor da raridade. E com todas as peças o usuário ganha um bônus especial por build."
  3. "Falta o rótulo 'Armadura'/Efésios discreto na mesma linha do título 'Inventário'." → depois: "o grid do inventário ainda não tem o mesmo tamanho/altura do componente de armadura" → depois: "o versículo ainda quebra linha e os badges de nível/quantidade/tempo estão desproporcionalmente grandes comparados aos slots".
- **ADR-009**: `AvatarRPG.tsx` reduzido a renderizar só o anel (avatar + badge de nível + slots de armadura + arcos SVG + badge de bônus de conjunto); `HeartsBar` e o nome saíram do componente.
- `DashboardPage.tsx`: `hud-username` (nome, topo do card) → `hud-layout` (rótulo "Armadura · Ef 6:10-18" + `AvatarRPG` | rótulo "Inventário" + `ItemSlots`) → `hud-stats` (3 pills, linha própria, largura cheia do card) → `hud-hearts-row` (corações centralizados, rodapé).
- **Arcos de conjunto**: `AvatarRPG.tsx` calcula, para cada par de slots adjacentes (na ordem de `ARMOR_SLOTS`, que já é sequencial por ângulo), se ambos estão equipados; se sim, desenha um arco SVG (`viewBox 0 0 100 100`, raio 40, um `<path>` por par) conectando os dois. Se as 6 peças estiverem equipadas e forem da mesma raridade, os arcos ganham `.hud-ring-arc--pulse` (animação `hud-ring-pulse`) e a cor daquela raridade.
- **Bônus de conjunto**: `armorSlots.ts` ganhou `ARMOR_SET_BONUSES` (um efeito de XP/ouro/coração por raridade — comum/raro/épico/lendário — tema Efésios 6:11 "toda a armadura de Deus"; efeito de jogo, não mérito espiritual, ver `IA/agents/rpg.md`). Exibido como badge abaixo do anel só quando o conjunto está completo e uniforme. Testado temporariamente igualando todas as raridades a "lendário" e equipando "calçados" (revertido depois, sem alterar o dado de demonstração real) — círculo fechado dourado + badge "Armadura Completa de Deus" confirmados via screenshot.
- **Vida interior**: `SpiritBattle.tsx` — `GiTrophy` removido; resumo agora mostra `fruitShare%`/`fleshShare%` (somam 100) em vez da soma bruta (624/180), com um selo `.sb-vs` ("VS") entre os dois lados.
- **Alinhamento anel × inventário**: 3 iterações até acertar. 1ª: `item-grid` com `width/height: var(--hud-ring-size)` fixo — vazava no mobile (BUG-009) porque a coluna `1fr` do grid é mais estreita que o anel em telas pequenas. 2ª: `width: min(var(--hud-ring-size), 100%); aspect-ratio: 1` — resolvia o overflow mas o grid ficava menor que o anel no mobile (136 vs 168, não alinhava topo/fundo) porque a escala mobile do anel (168px) já quase esgotava a largura disponível, sem sobrar para o inventário chegar ao mesmo tamanho. 3ª: escala mobile do anel reduzida de 168px para 136px (ADR-009 item 7) — aí os dois cabem lado a lado no mesmo tamanho até 360px de viewport; confirmado via `getBoundingClientRect()` (anel e grid com `top`/`bottom`/`width`/`height` idênticos em 375px e 1400px).
- **BUG-010/proporção de badges**: `.hud-slot-level`, `.hud-level`, `.item-tile-qty`, `.item-tile-timer` usavam `font-size`/`padding` fixos em px, nunca escalados por breakpoint — ficavam desproporcionalmente grandes quando o anel/slots encolheram para a escala mobile (136/26px). Trocados para `clamp(mín, calc(var(--hud-*-size) * fator), máx)`, com piso legível (7-9px) e teto igual ao valor desktop atual.
- **Rótulo "Armadura · Ef 6:10-18"**: abreviado de "Efésios" para "Ef" e reduzido para 10px/letter-spacing 0.3px abaixo de 640px para caber numa linha ao lado de "Inventário"; `.hud-layout .eyebrow { min-height: 2.2em }` garante que, mesmo se ainda quebrar em alguma tela muito estreita, os dois rótulos reservam a mesma altura e o anel/grid abaixo continuam alinhados pelo topo.
- Verificado visualmente via Playwright em 375px e 1400px (screenshots + `getBoundingClientRect`), sem erros de console, sem overflow horizontal.
- `npm run validate` passando (format, lint, typecheck, test, build).

## 2026-08-22 — Escala fluida do HUD mobile (fim do ciclo de "tudo pequeno demais") (T-029)
- Feedback do usuário: "ta tão pititiquinho, ta tudo pequeno... mal posicionado... mal distribuído" — e uma pergunta direta sobre se as regras de `IA/agents/ux-ui-specialist.md` estavam sendo seguidas, apontando um padrão de erro repetido (ajustar valores de CSS reativamente a cada rodada, sem projetar a escala como um todo).
- **ADR-010**: os 5 valores fixos do HUD mobile (168/66/32/56/22, depois 136/53/26/45/18) substituídos por 1 variável base fluida (`--hud-ring-size: clamp(126px, calc(50vw - 34px), 168px)`) + 4 variáveis derivadas por proporção fixa (`calc(var(--hud-ring-size) * fator)`, mesmo fator do desktop). Resultado: anel varia de 126px (pior caso, 320px) a 168px (≥414px), em vez de um único valor pequeno fixo para qualquer tela.
- **BUG-011/FIX-011**: causa raiz do "grid do inventário nunca alcança o tamanho do anel" (reportado 2x): o bloco `@media (max-width: 639px)` com o padding mobile reduzido estava posicionado ANTES da regra base `.dash-card { padding: 24px }` no arquivo — mesma especificidade, a regra posterior (sem condição) sempre vencia, então o padding mobile nunca surtia efeito de verdade. Corrigido reordenando o arquivo.
- `IA/memory/rules.md`: adicionadas regras 10a-10e (UI/CSS responsivo) capturando a lição de processo — escala primeiro (variável base + proporções derivadas), fórmula fluida em vez de valor fixo pro pior caso, testar em faixa de larguras (não só 2 pontos), verificar a página inteira (não só o componente isolado), e o cuidado com ordem de regras CSS/media query.
- Verificado via Playwright em 320/360/375/390/414/430/1400px: `getBoundingClientRect()` do anel e do grid do inventário batendo em todas (±2px de arredondamento), sem overflow (`document.body.scrollWidth` = largura do viewport) em nenhuma. Screenshot de página inteira em 390px conferido visualmente para comparar o peso visual do HUD com o card "Vida interior" vizinho.
- `npm run validate` passando (format, lint, typecheck, test, build).

## 2026-09-14 — Traduções ao vivo + cores de fala na leitura bíblica (T-036, T-037)
- **T-036**: `src/features/bible/traducoes.ts` (cliente multi-tradução, porta `apiBiblia.js` do legado) + `traducaoPreferida.ts` (persistência). `arib`/`livre` buscam ao vivo em `bible-api.com`/`api.getbible.net` com fallback e cache em `localStorage`; `versoes.ts` perdeu `VERSAO_ATIVA`/`VERSOES_EM_BREVE` (agora `TRADUCOES_BIBLIA`, as 3 reais). `LeituraPage.tsx`: dropdown de tradução totalmente funcional, troca de tradução não reinicia rolagem/progresso do capítulo. Ver ADR-031.
- **T-037**: `src/features/bible/data/falasEspeciais.ts` (487 faixas de fala de Jesus extraídas mecanicamente de marcação OSIS pública-domínio do KJV + 30 faixas de fala de Deus curadas manualmente) + `coresFala.ts` (preferência persistida). Botão "Cores de fala" na toolbar de leitura, ligado por padrão. Ver ADR-032 (inclui as limitações de escopo registradas).
- **Achado no processo**: `.claude/worktrees/` (cópias temporárias de sessões de agente anteriores) não estava excluído do glob de teste do Vitest nem do `.gitignore` — `npm run test` rodava a suíte inteira várias vezes (645 testes em vez de ~480). Corrigido em `vite.config.ts` (`exclude`) e `.gitignore` (`.claude/worktrees/`, `.abacusai/`).
- Removidas as classes CSS `.btrad-opcao--bloqueada`/`.btrad-opcao-badge--lock` (estado "em breve" do dropdown, agora obsoleto).
- 11 testes novos (`falasEspeciais.test.ts`), 8 testes novos (`traducoes.test.ts`), 2 testes reescritos em `LeituraPage.test.tsx`. Verificado em Chromium real via Playwright com rede de verdade: Sermão do Monte (Mateus 5) em vermelho, Dez Mandamentos (Êxodo 20) em azul, troca de tradução em João 1:1 muda o texto de fato (ARIB/Bíblia Livre), sem erro de console.
- `npm run lint`/`typecheck`/`test`/`build` limpos; todos os arquivos tocados nesta rodada passam `npm run format:check` individualmente. **`npm run format:check` do projeto inteiro já falhava antes desta sessão** (~70 arquivos nunca formatados, nenhum deles tocado aqui) — não é uma regressão desta tarefa, mas fica registrado porque impede `npm run validate` (que encadeia format:check primeiro) de passar de ponta a ponta no repositório como um todo; corrigir isso é uma limpeza maior e separada, fora do escopo pedido.

## 2026-09-14 (rodada seguinte) — Busca por versículo, significado original e "quem fala" (T-038 a T-042)
- **T-038**: `BuscaVersiculo` em `LivrosPage.tsx` (3 selects em cascata) + `buildLeituraPath` com 3º parâmetro opcional `versiculo` (`?v=N`). `LeituraPage.tsx` lê via `useSearchParams`, rola até o versículo e aplica `.biblia-versiculo-destaque` (anel pulsante, ~2.4s). Ver ADR-033.
- **T-039**: `traducaoPreferida.ts`/`versoes.ts` — padrão trocado de `aa` para `livre`. `LivrosPage.tsx` mostra o nome da tradução realmente ativa em vez do título fixo "Almeida Atualizada". Ver ADR-034.
- **T-040**: novo `src/features/bible/linguaOriginal.ts` — busca ao vivo em `bolls.life` (hebraico via `WLCa`, grego via `TISCH`, ambos com números de Strong embutidos) + definição léxica completa (`dictionary-definition/BDBT`). Ver ADR-035.
- **T-041/T-042**: novos `data/autoresLivros.ts` (66 livros), `data/biografias.ts` (~32 pessoas), `data/falasNomeadas.ts` (7 momentos curados), `biografiaExterna.ts` (resumo ao vivo da Wikipédia PT) e `pages/PainelInfoVersiculo.tsx` (painel compartilhado, aberto ao tocar no número do versículo). Ver ADR-036.
- Novos agentes: `IA/agents/linguistica-biblica.md`, `IA/agents/historia-cultura-biblica.md`.
- Bug real corrigido (achado em Chromium real): posicionamento do popup usava uma altura estimada fixa; corrigido para calcular `maxHeight` dinamicamente contra o espaço real da tela, com altura mínima de 200px garantida.
- Testes novos: `autoresLivros.test.ts`, `biografias.test.ts`, `falasNomeadas.test.ts`, `biografiaExterna.test.ts`, `linguaOriginal.test.ts`, `traducaoPreferida.test.ts`, mais testes novos em `LivrosPage.test.tsx`/`LeituraPage.test.tsx`. 158 testes na suíte da Bíblia (515 no total).
- `npm run typecheck`/`lint`/`test`/`build` limpos. Verificado em Chromium real via Playwright (desktop popup + mobile bottom sheet 390×844, rede de verdade): Gênesis 3:15 (15 palavras hebraicas reais + definição BDB), Moisés (biografia da Wikipédia ao vivo), Mateus 16:16 (Pedro como falante), 1 Coríntios 11:24 (Paulo + Jesus combinados) — sem erro de console, sem overflow horizontal no mobile.

## 2026-09-14 (rodada seguinte) — Banco de dados real, Google OAuth completo e rate limiting (T-043)
- **Achado crítico corrigido antes de qualquer coisa**: `.env` tinha `SB_PROJECT` apontando para o projeto Supabase ANTIGO (`egqimhgieypjyzyjslmn`) enquanto `PROJ_ID`/`SB_CALLBACK`/`GC_JSON` já apontavam para um projeto NOVO "evangeligogame" (`mblunwkcdwoodrizkjwe`), criado no mesmo dia. Corrigido `.env`/`.env.local` (não versionados). Projeto novo confirmado vazio via REST — nada precisou ser apagado.
- As 5 migrations pré-existentes (`profiles`/roles, `consentimentos`, `onboarding_objetivo`, grants) aplicadas pela primeira vez de verdade a este projeto via `supabase db push`.
- **Gap corrigido**: `consentimentos` nunca era gravado por nenhum fluxo de cadastro (e-mail/senha incluso) — `AuthContext.tsx` ganhou `registrarConsentimento()`, chamado em `signUpWithPassword`/`signInWithPassword` e no novo fluxo Google.
- **Google OAuth completo** (antes só existia o botão): nova rota `/auth/retorno` (`AuthCallbackPage.tsx`) decide entre `/jornada` (cadastro já concluído) e retomar `OnboardingPage` (`?google=1`) pulando nome/e-mail/senha, ainda coletando nascimento/estado civil/objetivo/termos. Nova coluna `profiles.onboarding_completo`. Habilitado de verdade no Supabase (`[auth.external.google]`, client secret via `supabase secrets set`, nunca em arquivo versionado).
- `keepalive` finalmente deployado (autorizado explicitamente nesta rodada) + agendado via `pg_cron`/`pg_net` a cada 3 dias — pendência registrada desde 2026-09-04.
- **Rate limiting parcialmente bloqueado**: função SQL de bloqueio por conta (`hook_password_verification_attempt`, 5 tentativas/hora) escrita e migrada, mas o Auth Hook que a ativaria retornou HTTP 402 (recurso pago, fora do plano atual). Mitigado com `auth.rate_limit.sign_in_sign_ups` nativo reduzido de 30 para 15.
- **Achado de processo evitado a tempo**: `supabase config push` sincroniza TODA propriedade declarada em `config.toml` — o arquivo recém-gerado por `supabase init` continha dezenas de defaults de template que divergiam dos valores já corretos no projeto hospedado. Confirmado via `supabase config diff` antes de qualquer push real; `config.toml` final reescrito para declarar só as 3 propriedades pretendidas. Ver ADR-037.
- Fase 2 (Comunidade/Ranking/Chat/Missões colaborativas, pedida na mesma mensagem) deliberadamente **não** incluída nesta rodada — fica para um plano próprio dedicado, ver `project-memory.md`.
- `npm run typecheck`/`lint`/`test`/`build` limpos.

## 2026-09-14 (rodada seguinte) — Fix de CI (T-044), filtro mobile em accordion + sublinhado removido (T-046)
- **T-044**: `.github/workflows/deploy-pages.yml` não passava `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` pro passo de build — site publicado sempre caía no aviso "use o modo de demonstração". Corrigido com secrets do GitHub Actions + `env:` no passo Build. Ver ADR-038.
- **T-046**: `BuscaVersiculo` (`LivrosPage.tsx`) virou accordion fechado por padrão abaixo de 640px (100% CSS via `data-aberto`, sem detecção de largura em JS); `.biblia-versiculo-num-btn` perdeu o `border-bottom` pontilhado (achado feio pelo usuário), ganhou realce só em hover/foco. Ver ADR-039.
- **Achado crítico**: nenhuma conta REAL (e-mail/senha ou Google) consegue abrir o Dashboard hoje — `user` de `useAuth()` só é populado pelo modo demonstração; uma sessão Supabase real nunca chama `setUser`, e `DashboardPage` redireciona pra home quando `user` é `null`. Plano aprovado (`soft-singing-haven.md`) pra resolver isso junto com o pedido de "mais tabelas no banco" (Etapa B: `rpg_progresso`/`rpg_inventario`/`rpg_armadura` + ponte real no `AuthContext`), em andamento.
- 1 teste novo em `LivrosPage.test.tsx` (accordion `aria-expanded`). 521 testes na suíte total.
- `npm run typecheck`/`lint`/`test`/`build` limpos. Verificado em Chromium real (Playwright contra `vite preview`, build de produção): desktop sem accordion, mobile fechado por padrão e abrindo ao clicar, número do versículo sem sublinhado.

## 2026-09-14 (rodada seguinte) — RPG real para contas autenticadas (T-047)
- **Achado crítico**: nenhuma conta real (e-mail/senha ou Google) conseguia abrir Dashboard/Loja/Inventário — só o modo demonstração populava `user` (`DemoUser | null` de `useAuth()`); as 3 páginas redirecionavam pra home sempre que `user` era `null`.
- Novas tabelas `rpg_progresso`/`rpg_inventario`/`rpg_armadura`/`rpg_efeitos_ativos`/`rpg_conquistas_usuario` (RLS + grants, `supabase/migrations/20260914180000_rpg_estado_real.sql`) — catálogos (itens/armadura/conquistas) continuam estáticos em código, só a posse por usuário mora no banco.
- Novo módulo `src/features/rpg/estadoReal.ts` (carrega/cria estado inicial, persiste mutações) + novo `useEffect` em `AuthContext.tsx` fazendo a ponte conta-real → `DemoUser`-shaped `user`. `DashboardPage`/`LojaPage`/`InventarioPage` pararam de redirecionar antes do carregamento terminar.
- **Bug real de concorrência encontrado e corrigido durante a verificação ao vivo**: `updateUser` chamava a gravação no Supabase de dentro do updater passado a `setUser` — o `StrictMode` do React invoca essa função 2x de propósito em dev, causando `23505 duplicate key` de verdade ao comprar um item com uma conta de teste real. Corrigido lendo `user` direto em vez da forma funcional de `setUser`.
- 8 testes novos (`estadoReal.test.ts`, funções puras de mapeamento). 529 testes na suíte total.
- **Verificado de ponta a ponta contra o projeto Supabase real**: conta de teste criada via Admin API (pré-confirmada, evitando gastar mais da cota de e-mail do projeto — uma tentativa de cadastro real bateu em `over_email_send_rate_limit` durante a investigação), login real pela UI, Dashboard carregando com nível 1/50 ouro/4 itens iniciais, compra de item debitando ouro e persistindo depois de reload completo da página, zero erros de console. Conta de teste apagada ao final.
- `npm run typecheck`/`lint`/`test`/`build` limpos. Ver ADR-040.

## 2026-09-14 (rodada seguinte) — "Ver texto original" na seleção (T-048)
- Item 1.1 do plano de UX do painel de leitura. `PainelSignificadoOriginal` extraído de `PainelInfoVersiculo.tsx` para `src/features/bible/components/PainelSignificadoOriginal.tsx`, reaproveitado sem duplicação.
- Novo `BalaoTextoOriginal` (mesma pasta) — popup/sheet ancorado acima da seleção, aberto por um novo botão "Ver texto original" em `MenuContextoBiblico`. Limitação real (sem mapeamento exato palavra-a-palavra com o trecho selecionado) explicada na própria UI.
- `npm run typecheck`/`lint`/`test` (529 testes)/`build` limpos. Verificado em Chromium real (Playwright, build de produção) desktop + mobile: seleção → menu → balão com hebraico real de Gênesis 1:1 → fecha, zero erros de console. Ver ADR-041.

## 2026-09-14 (rodada seguinte) — Painel do versículo em 4 seções + biografia estruturada (T-049)
- `PainelInfoVersiculo.tsx`: de 2 para 4 seções — "Quem fala" (só identidade), "Contexto da passagem" (período/idioma/gênero/contexto histórico, promovidos daqui de dentro de "Quem fala"), "Biografia do autor", "Biografia de quem fala" (quando diferente), "Significado original" (inalterado).
- `data/biografias.ts`: `Biografia` ganhou `ondeViveu`/`comoMorreu`/`filhoDe`/`escreveu` (opcionais), preenchidos para as 35 pessoas já cadastradas. Cuidado doutrinário deliberado: tradição extra-bíblica de martírio (Pedro, Paulo, Tiago, etc.) sempre rotulada como tal, nunca como fato bíblico — só Estêvão (Atos 7) e Moisés (Deuteronômio 34) têm morte narrada na própria Bíblia. `deus` (Deus Pai) não recebeu esses campos — não se aplicam teologicamente.
- Novo `GradeFatosBiografia` — grade ícone+rótulo+valor, só com os campos que a pessoa realmente tem, sempre antes da prosa da Wikipédia (ao vivo, inalterada).
- 3 testes novos em `biografias.test.ts`. 532 testes na suíte total.
- `npm run typecheck`/`lint`/`test`/`build` limpos. Verificado em Chromium real (Playwright, build de produção) com 1 Coríntios 11:24 (autor Paulo + falante Jesus): as 4 seções aparecem separadas e corretas, grades de fatos distintas pras duas biografias. Ver ADR-042.
