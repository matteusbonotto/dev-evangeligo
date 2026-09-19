-- =============================================================================
-- Migration: comunidade
-- Task: T-014 (Comunidade: amigos, chat 1:1, missões colaborativas) — pedido
-- explícito do usuário: "3 tem que ter também", confirmando a prioridade
-- máxima desta rodada de pendências (ver IA/memory/decisions.md ADR-057).
--
-- Escopo desta migration (MVP real, não o pedido de 48 seções de uma
-- sessão anterior cujo plano de 6 fases foi perdido — ver ADR-057 pro
-- raciocínio completo de escopo):
--   1. `amigos` — solicitação/aceite/recusa de amizade (1 linha por par).
--   2. RPC `buscar_usuarios_para_amizade` — busca por nome, devolve só
--      id/nome/sobrenome/avatar (nunca e-mail — dado de terceiro, regra 15).
--   3. `mensagens` — chat 1:1, com `conversa_id` calculado no cliente
--      (par de uuids ordenado) pra habilitar filtro de Realtime por
--      conversa sem precisar de uma tabela de "conversas" separada.
--   4. `missoes_colaborativas_convites` — convite de um amigo pra uma
--      missão do tipo "colaborativa" (`missoes_catalogo.tipo` ou
--      `gamification/domain/missions.ts`, sem FK — mesmo padrão de
--      `aulas_catalogo.trilha_id`). Só o CONVITE é implementado aqui —
--      rastrear progresso conjunto de uma missão fica pra quando o
--      sistema de missões for ligado a contas reais (pendência já
--      registrada em ADR-052, anterior a esta sessão).
-- =============================================================================

create table if not exists public.amigos (
  id uuid primary key default gen_random_uuid(),
  solicitante_id uuid not null references auth.users (id) on delete cascade,
  destinatario_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('pendente', 'aceita', 'recusada')) default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint amigos_nao_consigo_mesmo check (solicitante_id <> destinatario_id),
  constraint amigos_par_unico unique (solicitante_id, destinatario_id)
);

comment on table public.amigos is
  'Solicitações e amizades confirmadas (T-014/ADR-057) — 1 linha por par ordenado (solicitante→destinatário); ver função is_amigo_de() para checar amizade em qualquer direção.';

alter table public.amigos enable row level security;

drop policy if exists amigos_select_proprio on public.amigos;
create policy amigos_select_proprio
  on public.amigos for select to authenticated
  using (auth.uid() in (solicitante_id, destinatario_id));

drop policy if exists amigos_insert_proprio on public.amigos;
create policy amigos_insert_proprio
  on public.amigos for insert to authenticated
  with check (auth.uid() = solicitante_id);

drop policy if exists amigos_update_destinatario on public.amigos;
create policy amigos_update_destinatario
  on public.amigos for update to authenticated
  using (auth.uid() = destinatario_id)
  with check (auth.uid() = destinatario_id);

drop policy if exists amigos_delete_participante on public.amigos;
create policy amigos_delete_participante
  on public.amigos for delete to authenticated
  using (auth.uid() in (solicitante_id, destinatario_id));

drop trigger if exists amigos_set_updated_at on public.amigos;
create trigger amigos_set_updated_at
  before update on public.amigos
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.amigos to authenticated;

-- -----------------------------------------------------------------------------
-- Busca de usuários para amizade — nunca expõe e-mail (dado de terceiro).
-- -----------------------------------------------------------------------------
create or replace function public.buscar_usuarios_para_amizade(termo text)
returns table (id uuid, nome text, sobrenome text, avatar_config jsonb)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.nome, p.sobrenome, p.avatar_config
  from public.profiles p
  where p.id <> auth.uid()
    and (p.nome ilike '%' || termo || '%' or p.sobrenome ilike '%' || termo || '%')
  order by p.nome
  limit 20;
$$;

comment on function public.buscar_usuarios_para_amizade(text) is
  'Busca pública (qualquer autenticado) de usuários por nome/sobrenome, pra enviar solicitação de amizade (T-014). Nunca devolve e-mail.';

revoke all on function public.buscar_usuarios_para_amizade(text) from public;
grant execute on function public.buscar_usuarios_para_amizade(text) to authenticated;

-- -----------------------------------------------------------------------------
-- Leitura de amigos/solicitações JÁ COM NOME/AVATAR — `profiles_select_own`
-- só permite ler a própria linha (regra 11/12), então listar amigos por
-- nome exige RPC (SECURITY DEFINER, com join em profiles) em vez de uma
-- policy nova abrindo profiles pra qualquer autenticado.
-- -----------------------------------------------------------------------------
create or replace function public.listar_amigos()
returns table (amigo_id uuid, nome text, sobrenome text, avatar_config jsonb)
language sql
security definer
stable
set search_path = public
as $$
  select
    case when a.solicitante_id = auth.uid() then a.destinatario_id else a.solicitante_id end as amigo_id,
    p.nome, p.sobrenome, p.avatar_config
  from public.amigos a
  join public.profiles p
    on p.id = case when a.solicitante_id = auth.uid() then a.destinatario_id else a.solicitante_id end
  where a.status = 'aceita' and auth.uid() in (a.solicitante_id, a.destinatario_id);
$$;

revoke all on function public.listar_amigos() from public;
grant execute on function public.listar_amigos() to authenticated;

create or replace function public.listar_solicitacoes_pendentes()
returns table (
  id uuid, direcao text, outro_id uuid, nome text, sobrenome text,
  avatar_config jsonb, created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    a.id,
    case when a.solicitante_id = auth.uid() then 'enviada' else 'recebida' end as direcao,
    case when a.solicitante_id = auth.uid() then a.destinatario_id else a.solicitante_id end as outro_id,
    p.nome, p.sobrenome, p.avatar_config, a.created_at
  from public.amigos a
  join public.profiles p
    on p.id = case when a.solicitante_id = auth.uid() then a.destinatario_id else a.solicitante_id end
  where a.status = 'pendente' and auth.uid() in (a.solicitante_id, a.destinatario_id)
  order by a.created_at desc;
$$;

revoke all on function public.listar_solicitacoes_pendentes() from public;
grant execute on function public.listar_solicitacoes_pendentes() to authenticated;

-- -----------------------------------------------------------------------------
-- mensagens — chat 1:1
-- -----------------------------------------------------------------------------
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  -- Par de uuids ordenado (menor:maior) calculado no cliente — habilita
  -- filtro de Realtime por conversa (`conversa_id=eq.<valor>`) sem
  -- depender de uma tabela de conversas à parte.
  conversa_id text not null,
  remetente_id uuid not null references auth.users (id) on delete cascade,
  destinatario_id uuid not null references auth.users (id) on delete cascade,
  conteudo text not null check (char_length(conteudo) between 1 and 2000),
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.mensagens is
  'Chat 1:1 (T-014/ADR-057) — append-only do lado da aplicação (sem UPDATE de conteúdo, só a marcação `lida`).';

create index if not exists mensagens_conversa_idx on public.mensagens (conversa_id, created_at);

alter table public.mensagens enable row level security;

drop policy if exists mensagens_select_participante on public.mensagens;
create policy mensagens_select_participante
  on public.mensagens for select to authenticated
  using (auth.uid() in (remetente_id, destinatario_id));

drop policy if exists mensagens_insert_remetente on public.mensagens;
create policy mensagens_insert_remetente
  on public.mensagens for insert to authenticated
  with check (auth.uid() = remetente_id);

drop policy if exists mensagens_update_marcar_lida on public.mensagens;
create policy mensagens_update_marcar_lida
  on public.mensagens for update to authenticated
  using (auth.uid() = destinatario_id)
  with check (auth.uid() = destinatario_id);

grant select, insert, update on public.mensagens to authenticated;

alter publication supabase_realtime add table public.mensagens;

-- -----------------------------------------------------------------------------
-- missoes_colaborativas_convites — convite de amigo pra missão colaborativa
-- -----------------------------------------------------------------------------
create table if not exists public.missoes_colaborativas_convites (
  id uuid primary key default gen_random_uuid(),
  mission_template_id text not null,
  convidante_id uuid not null references auth.users (id) on delete cascade,
  convidado_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('pendente', 'aceito', 'recusado')) default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mcc_nao_convido_mim_mesmo check (convidante_id <> convidado_id)
);

comment on table public.missoes_colaborativas_convites is
  'Convite de amigo pra uma missão colaborativa (T-014/ADR-057) — só o convite; progresso conjunto rastreado fica para quando o sistema de missões for ligado a contas reais (ADR-052).';

alter table public.missoes_colaborativas_convites enable row level security;

drop policy if exists mcc_select_participante on public.missoes_colaborativas_convites;
create policy mcc_select_participante
  on public.missoes_colaborativas_convites for select to authenticated
  using (auth.uid() in (convidante_id, convidado_id));

drop policy if exists mcc_insert_convidante on public.missoes_colaborativas_convites;
create policy mcc_insert_convidante
  on public.missoes_colaborativas_convites for insert to authenticated
  with check (auth.uid() = convidante_id);

drop policy if exists mcc_update_convidado on public.missoes_colaborativas_convites;
create policy mcc_update_convidado
  on public.missoes_colaborativas_convites for update to authenticated
  using (auth.uid() = convidado_id)
  with check (auth.uid() = convidado_id);

drop trigger if exists mcc_set_updated_at on public.missoes_colaborativas_convites;
create trigger mcc_set_updated_at
  before update on public.missoes_colaborativas_convites
  for each row execute function public.set_updated_at();

grant select, insert, update on public.missoes_colaborativas_convites to authenticated;
