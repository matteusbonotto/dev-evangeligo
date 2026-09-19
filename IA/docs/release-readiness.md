# Revisão multidisciplinar e gate de release (T-021)

Este documento é o "gate de conclusão final" citado no checklist (T-021,
`agente: project-manager`, depende de T-020). Consolida, de um só lugar, tudo
que já foi identificado ao longo do projeto como pendência para o
**lançamento público** — não para o dia a dia de desenvolvimento, onde a
maioria dessas tarefas já está `done` internamente.

**Veredito desta revisão (2026-09-19): o projeto NÃO está pronto para
lançamento público ainda.** Não é um bloqueio de qualidade de código (testes,
tipos, build e lint estão limpos, 664 testes passando) — são pendências
externas (jurídicas, de licença de conteúdo e de infraestrutura) que
precisam de uma decisão ou ação humana antes de abrir a porta para usuários
reais em massa. Cada item abaixo já estava registrado em algum ADR/memória;
este documento só os reúne com um dono e uma ação clara.

## 1. Bloqueios de infraestrutura (impedem QUALQUER coisa de chegar em produção hoje)

| Item | Descrição | Ação necessária |
|---|---|---|
| Push ao GitHub | `git push origin main` retorna 403 — a credencial local (Git Credential Manager) está autenticada como a conta `squidevs`, sem permissão de escrita em `matteusbonotto/dev-evangeligo`. | Usuário reautentica o Git com a conta certa, ou dá acesso de colaborador a `squidevs`. |
| `supabase db push` | Bloqueado pelo classificador de modo automático ("Production Deploy") — várias migrations escritas e nunca aplicadas (`onboarding_avatar` de T-077b, `exportar_meus_dados`/LGPD, `admin_painel`/T-015). | Usuário roda/aprova manualmente. |
| `supabase functions deploy` | Mesmo bloqueio — `delete-account` (nova) nunca foi deployada; `keepalive` tem uma correção pendente de deploy. | Usuário roda/aprova manualmente. |
| Primeiro admin | Não existe "auto-primeiro-admin" por design (T-015/ADR-054). | Usuário promove a própria conta via SQL direto no Supabase depois do deploy. |

## 2. Licenciamento de conteúdo (ADR-017, T-011/T-012 em `review`)

- **Bíblia Almeida** (`public/data/biblia-almeida.json`, fonte `api.getbible.net`, metadados internos dizem `GPL`) — licença nunca confirmada formalmente com a fonte original.
- **Harpa Cristã** (`public/data/harpa-crista.json`, mirror de terceiro `DanielLiberato/Harpa-Crista-JSON-640-Hinos-Completa` no GitHub) — sem licença documentada.
- Decisão do usuário em 2026-09-03: migrar mesmo assim, com aviso na tela, e resolver a licença antes do lançamento público — a decisão não mudou, só o prazo dela venceu (ainda pendente).
- **Ação necessária**: confirmar a licença da Almeida junto à fonte, e obter atribuição/permissão explícita do mantenedor do mirror da Harpa (ou trocar por fonte com licença clara).

## 3. Revisão jurídica formal (Termos de Uso e Política de Privacidade)

- Prazo de retenção de dados pós-exclusão (90 dias, ADR-012) e prazo de resposta ao titular (15 dias) são **placeholders explícitos**, nunca confirmados por advogado(a).
- **Mudança nova nesta sessão (T-020, ver ADR-053)**: a exclusão de conta implementada é **imediata e física** (cascade no banco), não com retenção de 90 dias como o desenho original de `IA/docs/privacy.md` previa — decisão de simplicidade/minimização, mas que também derruba a prova de consentimento histórico. Isso precisa entrar na mesma revisão jurídica, não foi decidido como definitivo.
- **Ação necessária**: revisão por advogado(a) real dos dois documentos e da política de retenção antes de tratar qualquer usuário real como "sob os termos vigentes" de forma juridicamente sólida.

## 4. Conteúdo doutrinário pendente de validação formal pelo agente `teologia-reformada`

Nenhum destes é um erro conhecido — são itens aceitos como conteúdo válido, mas nunca formalmente revisados por essa persona, seguindo o mesmo padrão não-bloqueante já registrado nos próprios ADRs:

- ADR-007 — pareamento Fruto do Espírito × Obra da Carne (Vida Interior).
- ADR-036 — momentos curados de "quem fala" além de Jesus/Deus.
- ADR-032 — dataset de "cores de fala" (vermelho/azul), especialmente as 30 faixas curadas manualmente para Deus Pai.
- T-013 (2026-09-19, esta sessão) — as 12 reflexões do Feed de Devocionais.
- T-007 (trilhas/aulas) e T-008 (quizzes) — conteúdo original desta reconstrução, nunca revisado formalmente apesar de seguir os Cinco Solas/TULIP com cuidado.

**Ação necessária**: uma rodada dedicada de revisão teológica antes do lançamento público — não precisa ser tudo de uma vez, mas precisa acontecer.

## 5. Segurança (T-020, ver ADR-053 — maior parte já resolvida)

- ✅ RLS revisada em todas as tabelas, sem achado crítico.
- ✅ LGPD (exportar/excluir dados) implementado — pendente só de deploy (seção 1).
- ✅ CSP via meta tag, keepalive parou de vazar erro interno.
- ⚠️ 3 vulnerabilidades de dependência (vitest/vite/react-router) exigem upgrade de versão major — deliberadamente NÃO feito às cegas nesta sessão (risco de regressão de toolchain sem janela de teste dedicada). Recomendado agendar uma rodada própria pra isso.
- ⚠️ Rate limit de login por CONTA (não por IP) segue bloqueado por exigir plano pago do Supabase.
- ⚠️ Auditoria de acessibilidade (T-017/ADR-024) foi dirigida por evidência, não uma varredura automatizada (axe-core/Lighthouse) — ainda recomendada.
- ⚠️ pgTAP (`supabase/tests/database/`) nunca rodou de verdade (precisa de Docker local, indisponível em todo ambiente usado até agora).

## 6. Funcionalidades incompletas em relação à visão original do produto

- **T-011/T-012** (Bíblia/Harpa): funcionais, `review` por causa da seção 2.
- **T-013** (Feed de Devocionais): `done`, pendente só de validação doutrinária (seção 4).
- **T-014** (Chat/amigos/missões colaborativas — "Comunidade"): `todo`. Um plano de 6 fases (A-F) foi aprovado numa sessão anterior, mas o arquivo do plano vivia na máquina de outra sessão e não está disponível aqui — precisa ser refeito ou resgatado antes de começar essa implementação (é a maior peça em aberto do produto).
- **T-015** (Painel admin): `review` (ver ADR-054) — CRUD de conquistas/missões/usuários implementado, mas deliberadamente sem trilhas/quiz (conflito com a seção 4/governança doutrinária) e pendente de deploy.
- **T-045** (Quiz por capítulo/livro da Bíblia): `backlog`, escala grande (~7.265 perguntas em potencial) — plano detalhado em `IA/docs/quiz-biblico-plano.md`, decisão de produto pendente sobre faseamento.

## Recomendação de ordem, quando o usuário estiver disponível para decidir

1. Resolver os bloqueios de infraestrutura (seção 1) — sem isso, nada do resto chega a lugar nenhum.
2. Confirmar/ajustar a decisão de retenção de dados (seção 3, o item novo) — afeta código já escrito, mais fácil corrigir agora do que depois de usuários reais existirem.
3. Encaminhar licenciamento de conteúdo (seção 2) e revisão jurídica (seção 3) em paralelo — são processos externos, começar cedo.
4. Agendar uma rodada de revisão doutrinária (seção 4) — não bloqueia o uso interno/teste, mas bloqueia o lançamento público de boa consciência.
5. Tratar segurança residual (seção 5) numa janela dedicada (upgrade de dependências major).
6. Só depois disso, priorizar as funcionalidades incompletas (seção 6) conforme o apetite do usuário para cada uma.
