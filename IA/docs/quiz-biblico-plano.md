# Plano futuro: Quiz por capítulo e por livro da Bíblia

> **Status: anotado para o futuro, NÃO iniciado.** Pedido explícito do usuário
> (2026-09-14, mesma rodada de T-044): "faz os quizes de todos os capitulos
> por favor com 5 questões... para o livro, fazer um quiz do livro com 20
> questões... só quero que anote para o futuro". Nenhum código, conteúdo ou
> migration deste plano foi criado ainda — este documento existe só para que
> a próxima rodada não comece do zero.

## 1. Pedido original

- **Quiz por capítulo**: 5 perguntas por capítulo, "bem completo para garantir
  que o leitor possa entender o texto e sair de lá com o capítulo concluído".
- **Quiz por livro**: 20 perguntas por livro.
- Sem pedido explícito de prioridade relativa a isso — está fora da lista
  1-6 priorizada na mesma mensagem (que cobre UX do painel de leitura, login,
  filtro mobile, banco de dados, edge functions, comunidade/ranking/chat).

## 2. Escala real (calculada, não estimada)

A Bíblia protestante tem **1.189 capítulos** (929 AT + 260 NT) em **66 livros**
(`src/features/bible/data/livros.ts` já tem `totalCapitulos` por livro, fonte
de verdade para esses números).

- Quiz de capítulo: 1.189 × 5 = **5.945 perguntas**
- Quiz de livro: 66 × 20 = **1.320 perguntas**
- **Total: ~7.265 perguntas**

Isso é maior do que qualquer conteúdo já escrito neste projeto até hoje (para
comparação, os 6 datasets de "quem fala"/biografias somados de T-041/T-042
têm dezenas de entradas, não milhares). Não é executável em uma única rodada
— precisa de faseamento (seção 7).

## 3. Não existe precedente no legado para isto

Verificado em `dev-pwa-biblia-game/public/game/docs/quizes.json` (regra de
"legado primeiro" do projeto): o legado tem quiz por **trilha de teologia**
(Solas, TULIP, Soberania, Pactos, Obras/Fruto — 5 trilhas × ~7 perguntas),
já portado e vivo em `src/features/study/quiz/`. **Não existe** quiz por
capítulo/livro da Bíblia no legado — isto é trabalho novo, não uma migração.

## 4. Reuso técnico: o motor de quiz já existe e serve

`src/features/study/quiz/engine.ts` (`startQuizSession`, `submitAnswer`,
`summarizeQuizSession`, `calculateQuizReward`) é **TypeScript puro, sem
dependência de React/Supabase/`study/`** — corações, Escudo da Fé, XP/ouro,
quiz perfeito. Pode ser reaproveitado tal como está para os quizzes da
Bíblia, sem duplicar lógica.

O que **não** dá para reaproveitar direto: `src/features/study/quiz/schemas.ts`
tem `quizSchema` com um campo `aulaId` obrigatório (amarrado a uma aula de
trilha de teologia). Antes de escrever conteúdo, extrair um schema-base
genérico (`id`, `title`, `questions`) sem `aulaId`, e cada feature (`study`,
`bible`) definir seu próprio wrapper de metadados por cima — refactor pequeno,
não é motivo para reescrever o motor.

3 tipos de pergunta já suportados (`escolha_unica`, `verdadeiro_falso`,
`multipla_selecao`), cada um com `explanation` + `bibleReference` obrigatórios
no feedback — o mesmo padrão serve perfeitamente para perguntas bíblicas.

## 5. "Capítulo concluído": decisão de produto a tomar na execução

Hoje `src/features/bible/progresso.ts` já marca um capítulo como "concluído"
por **rolagem de tela** (≥95% lido, `capituloConcluido`), guardado em
`localStorage`. O pedido novo ("sair de lá com o capítulo concluído") pode
significar duas coisas diferentes — **decidir com o usuário antes de
implementar**, não assumir:

1. O quiz vira um **requisito adicional** para o capítulo contar como
   concluído (ler sozinho não basta mais).
2. O quiz vira uma **conquista separada** ("compreensão confirmada"),
   paralela à leitura, sem bloquear nada — mais parecido com o padrão do
   legado (`quizAprovado` como flag própria, distinta de progresso de leitura).

Recomendação preliminar (a confirmar): opção 2 — não travar a leitura atrás
de um quiz obrigatório contradiz o pedido histórico do usuário de UX
"simples, dinâmica": quiz como reforço opcional ao final do capítulo, com seu
próprio selo de conclusão.

## 6. Persistência: Supabase desde o início, não `localStorage`

Diferente do progresso de leitura (que nasceu em `localStorage` antes do
banco existir), este recurso é novo e nasce **depois** do banco real existir
(ADR-037/T-043) — deve persistir direto em tabelas novas, evitando repetir a
dívida técnica já registrada (`IA/memory/project-memory.md`, item sobre
trilhas/aulas/quizzes ainda em `localStorage`). Também é necessário para
impedir farm trivial de XP/ouro (responder o mesmo quiz repetidamente) — a
recompensa (`calculateQuizReward`) só deveria valer na primeira aprovação por
capítulo/livro por usuário, o que exige estado do lado do servidor.

Tabelas propostas (a refinar na hora, junto com o restante do item 4 da
rodada de 2026-09-14 — "só 3 tabelas no banco"):
- `biblia_quiz_progresso` (`usuario_id`, `livro_codigo`, `capitulo` nullable
  — null = quiz do livro inteiro —, `aprovado boolean`, `acertos`, `total`,
  `aprovado_em`) com RLS por `usuario_id = auth.uid()`, mesmo padrão de
  `profiles`/`consentimentos` (ADR-037).
- Conteúdo das perguntas em si **não** precisa ir para o banco — pode
  continuar como dado estático versionado no repositório (mesmo padrão de
  `study/quiz/content.ts`), revisável por diff de código/PR em vez de
  escrita em produção. Só o *progresso do usuário* é dado dinâmico.

## 7. Autoria de conteúdo: diretrizes e faseamento

**Diretrizes por pergunta** (para as 5 do capítulo):
- Testar compreensão do PRÓPRIO capítulo (evento, personagem, ensino, ordem
  dos fatos, versículo-chave) — não trivia desconectada nem interpretação
  doutrinária controversa.
- Toda resposta verificável direto contra o texto usado no app (Almeida
  Atualizada local, `public/data/biblia-almeida.json` — a mesma fonte que já
  serve a leitura) — menor risco doutrinário que os datasets de fala
  (ADR-032), porque é conferível linha a linha contra o texto, não exige
  fonte externa validada.
- Capítulos muito curtos (ex.: Salmo 117, 2 versículos) podem não sustentar 5
  perguntas não-redundantes de forma honesta — nesses casos, preferir
  perguntas mais finas (sequência exata, palavra/frase específica) a inventar
  perguntas fracas só para bater o número.

**Diretrizes por livro** (as 20): mistura de perguntas que atravessam
capítulos (estrutura, temas centrais) + contexto/autoria (reaproveitar
`data/autoresLivros.ts`, já existente de T-041). Livros de 1 capítulo muito
curto (Obadias, Filemom, 2/3 João, Judas) provavelmente não sustentam 20
perguntas distintas de valor real — flag para decidir número menor caso a
caso na hora, em vez de forçar uniformidade.

**Revisão**: qualquer pergunta que toque interpretação (não só fato do texto)
passa pelo agente `teologia-reformada` antes de publicar — mesmo padrão já
usado para os datasets de fala (ADR-032) e biografias (ADR-036). Contexto
histórico/cultural usa `historia-cultura-biblica`; nuance de idioma original
usa `linguistica-biblica`.

**Faseamento proposto** (permite deploy incremental, como o usuário pediu
"a cada etapa concluída"):
1. **Fase 1**: os 4 Evangelhos (Mateus/Marcos/Lucas/João, 89 capítulos) — maior
   valor de engajamento, tamanho gerenciável (89×5 + 4×20 = **525 perguntas**).
2. **Fase 2**: resto do Novo Testamento (161 capítulos restantes, 23 livros).
3. **Fase 3+**: Antigo Testamento em lotes por grupo temático (já existe
   `grupo` em `LIVROS_BIBLIA` — lei, história, poético, profético — dá uma
   ordem natural de fatiar 929 capítulos em pedaços revisáveis).

Cada fase: escrever conteúdo → revisão pelos agentes especialistas acima →
`npm run typecheck`/`lint`/`test`/`build` → verificação em navegador real →
commit + deploy em `main`, exatamente como as rodadas anteriores desta sessão.

## 8. O que fica para quando esta rodada for de fato iniciada

- Confirmar com o usuário a decisão da seção 5 (quiz obrigatório vs. selo
  paralelo) antes de escrever qualquer schema.
- Decidir se vale criar um agente especialista novo dedicado à autoria de
  quiz bíblico (consistência de tom/dificuldade ao longo de milhares de
  perguntas) ou se `teologia-reformada`/`linguistica-biblica`/
  `historia-cultura-biblica` bastam em modo revisor.
- Medir o tamanho real de uma rodada de autoria (Fase 1, 525 perguntas) antes
  de prometer prazo para as fases seguintes — pode exigir várias sessões.
