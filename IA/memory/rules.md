# Regras Permanentes

## Regras de desenvolvimento
1. **Regra de não destruição**: nunca apagar código, arquivos ou funcionalidades sem necessidade; preservar histórico.
2. **Root cause**: corrigir a causa raiz, não aplicar remendos superficiais.
3. **Mínimo necessário**: fazer apenas o que foi pedido; evitar over-engineering.
4. **Consistência**: seguir o estilo do código existente.
5. **Verificação**: antes de concluir, verificar que o código funciona (lint, typecheck, build, testes).
6. **Gate de conclusão**: DONE exige código + testes + QA + regressão + documentação + memória + checklist.

## Regras de arquitetura
7. Regras de domínio não dependem de React, navegador ou Supabase.
8. Feature-first: cada feature agrupa páginas, hooks, serviços e schemas.
9. Estado remoto via TanStack Query.
10. Persistência via Supabase com RLS.

## Regras de UI/CSS responsivo
10a. **Escala primeiro, valores depois**: ao definir tamanho/espaçamento de um componente com várias partes (ex.: HUD com anel+slots+badges), escolher UMA variável base e derivar o resto por proporção fixa (`calc(var(--base) * fator)`), a mesma proporção em todo breakpoint. Nunca escolher cada subtamanho isoladamente "no olho" a cada rodada de feedback — isso gera um ciclo de regressões (aperta aqui, quebra ali). Ver `IA/memory/decisions.md` ADR-010.
10b. Para a variável base, preferir medir o CONTAINER real (`container-type: inline-size` + unidades `cqi`/`cqw`) em vez de estimar a partir da viewport (`vw` + offset manual somando padding de ancestrais). Uma estimativa de `vw` sempre depende de manter esse offset sincronizado com o padding real de todo ancestral no meio do caminho (`.dashboard`, `.dash-card`, gap) — se qualquer um mudar, a estimativa fica errada silenciosamente (ver ADR-011/BUG-012, que substituiu a estimativa em `vw` do ADR-010 por `cqi` pelo mesmo motivo do BUG-011). Nota técnica: `cqi`/`cqw` só resolvem corretamente em DESCENDENTES do elemento com `container-type` — nunca no próprio elemento nem em um ancestral dele.
10c. Testar responsividade numa FAIXA de larguras (ex.: 320/360/375/390/414/430 + desktop), não só 2 pontos — falhas de layout muitas vezes só aparecem nos tamanhos intermediários. Preferir medir com `getBoundingClientRect()` (Playwright) a estimar de cabeça — o cálculo mental de quanto espaço sobra/falta erra fácil (ver BUG-012, onde o espaço morto real medido foi de 233px, bem maior do que pareceria "no olho").
10d. Verificar visualmente a página INTEIRA (não só o componente isolado) comparando o peso visual entre seções vizinhas — ausência de overflow não significa que o layout está bem distribuído/proporcional.
10e. Cuidado com ordem de regras CSS: um bloco `@media` só vence uma regra sem media query de mesma especificidade se vier DEPOIS dela no arquivo. Colocar a media query antes da regra base faz o ajuste responsivo ser silenciosamente ignorado (nenhum erro de lint acusa isso).
10f. Nunca usar `transform` para posicionar um elemento (`rotate`/`translate`) E animar `transform` (`scale`) no mesmo elemento — uma animação CSS substitui o valor INTEIRO da propriedade enquanto roda, apagando a posição pela duração da animação. Usar as propriedades isoladas `scale`/`rotate`/`translate` (CSS Transforms nível 2) para o que for puramente decorativo, deixando `transform` livre para posicionamento (ver BUG-013).
10g. Ao trocar `prefers-reduced-motion` ou qualquer seletor "de guarda" que desativa algo, checar se o NOME da classe no seletor realmente existe no componente — um seletor com o nome errado não gera erro nenhum, só silenciosamente nunca casa com nada (mesmo defeito do BUG-011, mas em seletor de classe em vez de ordem de regra).

## Regras de segurança e privacidade
11. Nunca usar `service_role` no frontend.
12. Chave `anon` é pública; segurança depende de RLS e funções protegidas.
13. RLS obrigatório em toda tabela.
14. Nunca armazenar secrets no código.
15. Não logar dados sensíveis.
16. Dados religiosos tratados como sensíveis (LGPD).
17. Nunca vender dados a terceiros.

## Regras de conteúdo e doutrina
18. Toda afirmação doutrinária com base bíblica explícita.
19. Gamificação é ferramenta pedagógica, nunca mérito espiritual.
20. Não usar linguagem que sugira que obras humanas salvam.
21. Respeitar licenças de conteúdo (Bíblia Almeida, Harpa Cristã).
22. Não inventar versículos nem alterar texto bíblico.

## Regras de gamificação
23. Evitar mecânicas viciantes (loot boxes, pressão artificial).
24. Não punir de forma cruel.
25. Recompensas reforçam hábitos saudáveis.

## Regras de comunicação
26. Respostas ao usuário em português (BR).
27. Não repetir perguntas já respondidas.
28. Não marcar DONE sem evidência.

## Regras de migração do legado
29. **O app legado (`dev-pwa-biblia-game`) é a referência de funcionalidade desta reconstrução** — quando uma tela nova parecer incompleta ou "sem graça", abrir o legado (`npx serve` na pasta `public/game/`, ou ler o código-fonte) antes de redesenhar do zero. Diretriz permanente do usuário (2026-09-03, ver `IA/memory/project-memory.md`): "pode seguir o legado, e só deixe mais moderno o que já funcionou". Modernizar apresentação/UX é esperado; remover funcionalidade que já existia lá sem substituto equivalente não é.
30. Ao migrar uma tela/recurso do legado, aproveitar para corrigir bugs, gaps e falhas encontrados no processo (não é preciso pedir permissão para cada correção pontual encontrada durante uma migração já em andamento) — mas registrar cada correção real em `IA/memory/decisions.md`/`project-memory.md` como de costume (regra 6).
