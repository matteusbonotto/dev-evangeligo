# Changelog

## [0.1.0] — 2026-08-21
### Adicionado
- Framework IA/ (núcleo operacional de conhecimento).
- Agentes especialistas (teologia reformada, jurídico, privacidade, gamificação, RPG, game design, engenharia).
- Memória global.
- Configuração inicial.

### Em andamento
- Design system e tema profissional.
- Autenticação completa (Supabase).
- Onboarding estilo Duolingo.
- Trilhas, quizzes, gamificação, RPG, bíblia, harpa, social, admin.

### Concluído
- Documentação técnica.
- Standards, commands.
- Checklist Kanban + tasks.json (roadmap).
- Fundação da nova versão profissional (Vite + React + TS + PWA) — build e testes passando.
- Botão de demonstração com usuário mock completo (T-004): AuthContext, demoUser, DashboardPage, rota `/jornada`, CSS do dashboard.
- Redesign do dashboard (T-023): HUD RPG compacto estilo Duolingo — avatar + armadura em grade isométrica, slots de itens permanentes/consumíveis com duração, mobile-first.
- Refinamento do HUD (T-024): armadura em anel uniforme ao redor da foto, nome abaixo, nível no rodapé, raridades/efeitos roguelike, empty state, 9 slots de itens (4 permanentes + 5 consumíveis) à direita, corações.
- Ajustes finos do HUD (T-025): nome colado abaixo do badge de nível, corações acima do anel, inventário grid único 3×3 de 9 tiles quadrados (44×44 px), barras Frutos da Carne / Obras do Espírito com porcentagem.
- Correção de sobreposição no HUD + "Vida interior" como 9 duelos de ícones (T-026): nome do usuário não sobrepõe mais o badge de nível (fluxo normal em vez de posicionamento absoluto); inventário corrigido para ficar à direita da armadura/perfil em telas largas (`.hud-card` span 2); "Frutos da Carne"/"Obras do Espírito" (nomes invertidos) substituídos por 9 pares Fruto do Espírito × Obra da Carne (Gl 5:19-23) com ícone próprio, competindo em barra dupla.
- HUD com layout único responsivo (T-027): mesmo layout (anel + inventário lado a lado) em mobile e desktop, escalado via variáveis CSS em vez de empilhar no mobile; nome mais próximo do badge de nível; corrigidos bug de inventário vazando (grid `auto` crescendo com os stat-pills) e bug pré-existente de overflow no cabeçalho em telas estreitas.
- Reorganização do HUD + arcos de conjunto e bônus + Vida Interior em % (T-028): nome no topo do card, corações no rodapé centralizados, badges de stats sempre em uma linha; anel de armadura e grid de inventário com exatamente o mesmo tamanho (largura/altura) lado a lado, com rótulos "Armadura · Ef 6:10-18"/"Inventário" alinhados na mesma linha; arcos SVG conectando slots de armadura adjacentes equipados (formam um círculo progressivo que pulsa na cor da raridade quando as 6 peças são iguais) com bônus de conjunto correspondente; badges de nível/quantidade/tempo dos itens agora escalam proporcionalmente; "Vida interior" trocou soma bruta por percentual e o troféu por um selo "VS".
- Escala fluida do HUD mobile (T-029): tamanhos fixos por breakpoint substituídos por uma variável base fluida (`clamp` ligado à largura real da tela) com o resto derivado por proporção; corrigido bug de ordem de regras CSS que impedia o ajuste de padding mobile de funcionar; regras de processo para escala responsiva documentadas em `IA/memory/rules.md`.
- HUD via container query (T-030): a estimativa de largura de tela (`vw`) do HUD mobile trocada por medição real do container (`cqi`), eliminando até 233px de espaço morto entre anel e inventário em telas de 414-639px de largura; anel de armadura ganhou contorno hexagonal sempre visível ligando os 6 slots (mesmo vazios); corrigido bug em que a animação de entrada dos slots colapsava a posição deles no centro do anel por 0.3s a cada carregamento da página.
- Traduções bíblicas ao vivo (T-036): dropdown de tradução com as 3 traduções reais do legado (Almeida Atualizada local + ARIB/Bíblia Livre buscadas ao vivo em bible-api.com/api.getbible.net), substituindo as 2 opções que ficavam bloqueadas "em breve".
- Cores de fala na leitura bíblica (T-037): Jesus em vermelho (487 faixas, dataset público-domínio) e Deus Pai em azul (30 faixas curadas, cobertura inicial não exaustiva), com toggle na toolbar de leitura.
- Busca por versículo (T-038): filtro livro/capítulo/versículo em `LivrosPage`, com destaque temporário do versículo encontrado.
- Bíblia Livre como tradução padrão (T-039).
- Significado da palavra/frase no idioma original (T-040): hebraico/grego com números de Strong e definição léxica completa, via `bolls.life`.
- "Quem fala" (T-041/T-042): autor de cada um dos 66 livros + biografia ao vivo da Wikipédia + 7 momentos curados de falantes nomeados (Pedro, Paulo, Tomé, Maria, Estêvão) além de Jesus/Deus.
- `npm run lint`/`typecheck`/`test`/`build` limpos (o `format:check` do projeto inteiro já tinha pendências pré-existentes antes destas rodadas, não relacionadas).
