-- =============================================================================
-- Migration: rpg_estado_real
-- Task: T-047 (ver IA/memory/decisions.md ADR-040)
--
-- Achado real ao investigar o pedido do usuário ("só tem 3 tabelas no
-- banco"): NENHUMA conta autenticada de verdade consegue abrir o Dashboard
-- hoje — `DashboardPage.tsx` só renderiza com um `DemoUser` populado, e o
-- único código que popula isso é o modo demonstração (`signInDemo`,
-- localStorage). Esta migration cria o estado de RPG (nível/XP/ouro/
-- sequência, inventário, armadura equipada, efeitos de consumível ativos,
-- conquistas desbloqueadas) para contas reais. Catálogos (itens, peças de
-- armadura, conquistas) continuam como dado ESTÁTICO em código
-- (`src/features/rpg/catalogo.ts`, `gamification/domain/achievements.ts`)
-- — igual pra toda conta — só a POSSE/estado por usuário mora aqui.
--
-- Trilhas/aulas/quizzes/hearts/spiritBattle (progresso de estudo)
-- deliberadamente FORA desta migration — ficam com dado estático/placeholder
-- para contas reais até uma próxima rodada dedicada (ver ADR-040).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. rpg_progresso — 1 linha por usuário (nível, XP, ouro, sequência)
-- -----------------------------------------------------------------------------
create table if not exists public.rpg_progresso (
  user_id uuid primary key references auth.users (id) on delete cascade,

  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  xp_to_next_level integer not null default 500 check (xp_to_next_level > 0),
  gold integer not null default 0 check (gold >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),

  updated_at timestamptz not null default now()
);

comment on table public.rpg_progresso is
  'Nível/XP/ouro/sequência por usuário real (T-047/ADR-040) — 1 linha por conta, criada no primeiro acesso ao Dashboard.';

alter table public.rpg_progresso enable row level security;

drop trigger if exists rpg_progresso_set_updated_at on public.rpg_progresso;
create trigger rpg_progresso_set_updated_at
  before update on public.rpg_progresso
  for each row
  execute function public.set_updated_at();

drop policy if exists rpg_progresso_select_own on public.rpg_progresso;
create policy rpg_progresso_select_own
  on public.rpg_progresso
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists rpg_progresso_insert_own on public.rpg_progresso;
create policy rpg_progresso_insert_own
  on public.rpg_progresso
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists rpg_progresso_update_own on public.rpg_progresso;
create policy rpg_progresso_update_own
  on public.rpg_progresso
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. rpg_inventario — quantas unidades de cada item (catálogo estático) o
--    usuário possui; sem FK pro catálogo porque ele não mora no banco.
-- -----------------------------------------------------------------------------
create table if not exists public.rpg_inventario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  quantity integer not null default 1 check (quantity >= 0),
  updated_at timestamptz not null default now(),

  unique (user_id, item_id)
);

comment on table public.rpg_inventario is
  'Posse de itens do catálogo estático (rpg/catalogo.ts) por usuário real (T-047/ADR-040).';

alter table public.rpg_inventario enable row level security;

drop trigger if exists rpg_inventario_set_updated_at on public.rpg_inventario;
create trigger rpg_inventario_set_updated_at
  before update on public.rpg_inventario
  for each row
  execute function public.set_updated_at();

drop policy if exists rpg_inventario_select_own on public.rpg_inventario;
create policy rpg_inventario_select_own
  on public.rpg_inventario
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists rpg_inventario_insert_own on public.rpg_inventario;
create policy rpg_inventario_insert_own
  on public.rpg_inventario
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists rpg_inventario_update_own on public.rpg_inventario;
create policy rpg_inventario_update_own
  on public.rpg_inventario
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists rpg_inventario_delete_own on public.rpg_inventario;
create policy rpg_inventario_delete_own
  on public.rpg_inventario
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. rpg_armadura — até 6 linhas por usuário, uma por slot (ArmorSlot["slot"]
--    em demoUser.ts) — qual peça está naquele slot e se está equipada.
-- -----------------------------------------------------------------------------
create table if not exists public.rpg_armadura (
  user_id uuid not null references auth.users (id) on delete cascade,
  slot text not null check (
    slot in ('cinto', 'couraca', 'calçados', 'escudo', 'capacete', 'espada')
  ),
  item_id text not null,
  equipped boolean not null default false,
  level integer not null default 1 check (level >= 1),
  updated_at timestamptz not null default now(),

  primary key (user_id, slot)
);

comment on table public.rpg_armadura is
  'Peça de armadura equipada/possuída por slot, por usuário real (T-047/ADR-040) — 1 peça possível por slot, mesmo modelo do rpg/inventario.ts.';

alter table public.rpg_armadura enable row level security;

drop trigger if exists rpg_armadura_set_updated_at on public.rpg_armadura;
create trigger rpg_armadura_set_updated_at
  before update on public.rpg_armadura
  for each row
  execute function public.set_updated_at();

drop policy if exists rpg_armadura_select_own on public.rpg_armadura;
create policy rpg_armadura_select_own
  on public.rpg_armadura
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists rpg_armadura_insert_own on public.rpg_armadura;
create policy rpg_armadura_insert_own
  on public.rpg_armadura
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists rpg_armadura_update_own on public.rpg_armadura;
create policy rpg_armadura_update_own
  on public.rpg_armadura
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists rpg_armadura_delete_own on public.rpg_armadura;
create policy rpg_armadura_delete_own
  on public.rpg_armadura
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. rpg_efeitos_ativos — consumíveis em uso agora (ActiveEffect em
--    demoUser.ts) — lista SEPARADA do inventário (rpg/inventario.ts:
--    usar um consumível decrementa o estoque em rpg_inventario E cria uma
--    linha aqui; o limite de RPG_MAX_EFEITOS_ATIVOS continua sendo checado
--    em código, não em SQL).
-- -----------------------------------------------------------------------------
create table if not exists public.rpg_efeitos_ativos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  nome text not null,
  inicia_em timestamptz not null default now(),
  termina_em timestamptz not null
);

comment on table public.rpg_efeitos_ativos is
  'Efeitos de consumível em andamento por usuário real (T-047/ADR-040) — linhas com termina_em no passado são tratadas como expiradas pelo app, sem limpeza automática.';

alter table public.rpg_efeitos_ativos enable row level security;

drop policy if exists rpg_efeitos_ativos_select_own on public.rpg_efeitos_ativos;
create policy rpg_efeitos_ativos_select_own
  on public.rpg_efeitos_ativos
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists rpg_efeitos_ativos_insert_own on public.rpg_efeitos_ativos;
create policy rpg_efeitos_ativos_insert_own
  on public.rpg_efeitos_ativos
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists rpg_efeitos_ativos_delete_own on public.rpg_efeitos_ativos;
create policy rpg_efeitos_ativos_delete_own
  on public.rpg_efeitos_ativos
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. rpg_conquistas_usuario — conquistas desbloqueadas (catálogo estático em
--    gamification/domain/achievements.ts) — append-only, igual a
--    `consentimentos`: nunca UPDATE/DELETE pela aplicação.
-- -----------------------------------------------------------------------------
create table if not exists public.rpg_conquistas_usuario (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),

  primary key (user_id, achievement_id)
);

comment on table public.rpg_conquistas_usuario is
  'Conquistas desbloqueadas por usuário real (T-047/ADR-040) — append-only, catálogo em gamification/domain/achievements.ts.';

alter table public.rpg_conquistas_usuario enable row level security;

drop policy if exists rpg_conquistas_usuario_select_own on public.rpg_conquistas_usuario;
create policy rpg_conquistas_usuario_select_own
  on public.rpg_conquistas_usuario
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists rpg_conquistas_usuario_insert_own on public.rpg_conquistas_usuario;
create policy rpg_conquistas_usuario_insert_own
  on public.rpg_conquistas_usuario
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. Grants — RLS filtra LINHAS, mas a role ainda precisa do privilégio de
--    TABELA correspondente, senão PostgREST rejeita com "permission denied"
--    antes mesmo de aplicar a policy (mesmo achado real do
--    authenticated_grants.sql, 2026-09-04 — não repetir esse gap aqui).
-- -----------------------------------------------------------------------------
grant select, insert, update on public.rpg_progresso to authenticated;
grant select, insert, update, delete on public.rpg_inventario to authenticated;
grant select, insert, update, delete on public.rpg_armadura to authenticated;
grant select, insert, delete on public.rpg_efeitos_ativos to authenticated;
grant select, insert on public.rpg_conquistas_usuario to authenticated;
