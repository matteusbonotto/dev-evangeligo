# Banco de Dados

## Visão geral
PostgreSQL via Supabase. Migrations versionadas. RLS em todas as tabelas.

## Tabelas principais (planejadas)

### auth (Supabase gerenciado)
- `auth.users` — usuários.

### public
- `profiles` — perfil do usuário (nome, sobrenome, nascimento, estado civil, avatar).
- `user_progress` — XP, nível, ouro, sequência.
- `trilhas` — trilhas de estudo.
- `aulas` — aulas por trilha.
- `aula_progresso` — progresso do usuário por aula.
- `quizzes` — perguntas de quiz.
- `quiz_resultados` — resultados do usuário.
- `missoes` — missões do usuário.
- `modelos_missao` — modelos de missão.
- `conquistas` — catálogo de conquistas.
- `conquistas_usuario` — conquistas desbloqueadas.
- `itens` — catálogo de itens.
- `inventario` — itens do usuário.
- `armadura` — slots equipados (6 peças).
- `devocionais` — feed de devocionais.
- `amigos` — amizades.
- `mensagens` — chat.
- `missoes_colaborativas` — missões em grupo.
- `consentimentos` — registro auditável de aceite de Termos de Uso e Política de Privacidade (LGPD, RF-06). Ver detalhamento abaixo.

### `consentimentos` (LGPD — consentimento explícito e auditável)
Registra cada aceite de documento legal feito pelo usuário, de forma imutável (nunca é atualizada — um novo aceite gera uma nova linha). Usada para provar, a qualquer momento, quando e o que um usuário consentiu (RF-06; `IA/docs/security.md`, seção Privacidade; ADR-006).

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `id` | `uuid` (PK, default `gen_random_uuid()`) | Identificador do registro de consentimento. |
| `user_id` | `uuid` (FK → `auth.users.id`, `not null`) | Usuário que consentiu. |
| `terms_version` | `text` (`not null`) | Versão dos Termos de Uso aceita (`LEGAL_DOCUMENT_VERSIONS.terms.version` em `src/pages/public/LegalPage.tsx`, formato `AAAA-MM-DD`). |
| `privacy_version` | `text` (`not null`) | Versão da Política de Privacidade aceita (`LEGAL_DOCUMENT_VERSIONS.privacy.version`). |
| `accepted_sensitive_data` | `boolean` (`not null`, default `true`) | Confirma que o usuário foi informado de que dados de engajamento religioso/doutrinário são dado sensível (LGPD art. 11) e consentiu com esse tratamento especificamente. |
| `consent_source` | `text` (`not null`) | Onde o consentimento foi coletado (ex.: `"onboarding_signup"`, `"reconsent_modal"`), para diferenciar aceite inicial de reaceite por mudança material dos documentos. |
| `ip_address` | `inet` (nullable) | IP no momento do aceite, se disponível — evidência adicional de auditabilidade. |
| `user_agent` | `text` (nullable) | User-agent no momento do aceite. |
| `created_at` | `timestamptz` (`not null`, default `now()`) | Timestamp do aceite — junto com as versões, é o núcleo do requisito "consentimento explícito e auditável" (timestamp + versão dos termos). |

**Regras:**
- Tabela **append-only**: nunca fazer `UPDATE`/`DELETE` de linhas existentes via aplicação; um novo aceite (ex.: após mudança material dos documentos) insere uma nova linha. Isso preserva o histórico completo de consentimento do usuário, mesmo que ele revogue e reaceite depois.
- RLS: usuário só pode `SELECT`/`INSERT` linhas com o próprio `user_id`; nenhum `UPDATE`/`DELETE` liberado para o role `user` (somente `admin`/`service_role`, para casos excepcionais de correção, com auditoria própria).
- O onboarding (T-005/T-006) deve inserir uma linha em `consentimentos` no momento do aceite de Termos/Privacidade, usando as versões atuais exportadas por `LEGAL_DOCUMENT_VERSIONS` (`src/pages/public/LegalPage.tsx`).
- Quando `LEGAL_DOCUMENT_VERSIONS.terms.version` ou `.privacy.version` mudar (alteração material dos documentos, ver comentário no topo de `LegalPage.tsx`), o app deve detectar que o `terms_version`/`privacy_version` mais recente do usuário está desatualizado e solicitar novo consentimento (nova linha em `consentimentos`) antes de liberar funcionalidades que dependam dele.
- Exclusão de conta: linhas de `consentimentos` do usuário são mantidas durante o prazo de retenção pós-exclusão descrito em `IA/docs/privacy.md` (prova de que houve consentimento válido durante o uso do serviço), mesmo que os demais dados pessoais sejam apagados/anonimizados antes.

## Roles
- `user` — usuário comum (acesso aos próprios dados).
- `admin` — administrador (CRUD de conteúdo).

## RLS
- Toda tabela com RLS habilitada.
- Usuário acessa apenas seus dados.
- Conteúdo público (trilhas, quizzes, itens) legível por todos autenticados.
- `service_role` nunca no frontend.

## Migrations
- Versionadas em `supabase/migrations/`.
- Reproduzíveis via `supabase db reset`.
- Testadas com pgTAP.
