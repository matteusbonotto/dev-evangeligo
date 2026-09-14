-- Rate limiting de tentativas de login por senha (pedido explícito do
-- usuário: "tem que ter limite de tentativas a cada hora"). Enforcement no
-- SERVIDOR via Auth Hook "Password Verification Attempt" do Supabase — o
-- GoTrue chama esta função a CADA tentativa de login por senha, antes de
-- decidir sucesso/falha; a função pode rejeitar com uma mensagem
-- customizada. Isto não pode ser contornado pelo cliente (diferente de um
-- contador feito só no frontend). Formato de entrada/saída do hook
-- confirmado ao vivo contra a documentação oficial do Supabase antes de
-- escrever esta função (não copiado de memória):
--   entrada: {"user_id": "<uuid>", "valid": <boolean>}
--   saída (permitir):  {"decision": "continue"}
--   saída (bloquear):  {"decision": "reject", "message": "..."}
-- Ver IA/memory/decisions.md para a ADR completa desta decisão.

create table if not exists public.tentativas_login (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  tentativas int not null default 0,
  janela_iniciada_em timestamptz not null default now()
);

comment on table public.tentativas_login is
  'Contador de tentativas de login com senha errada por usuário, usado pelo Auth Hook hook_password_verification_attempt para bloquear após 5 tentativas em 1 hora. Nunca acessado pelo frontend — só pela função SECURITY DEFINER abaixo.';

-- RLS habilitada por padrão em toda tabela nova (regra 13 do projeto),
-- mas sem NENHUMA policy: nem o próprio usuário nem `authenticated` devem
-- ler/escrever aqui diretamente — só a função do hook (SECURITY DEFINER,
-- roda como o dono da função, ignora RLS) e `service_role` mexem nesta
-- tabela.
alter table public.tentativas_login enable row level security;

grant select, insert, update, delete on public.tentativas_login to service_role;

create or replace function public.hook_password_verification_attempt(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (event ->> 'user_id')::uuid;
  v_valido boolean := (event ->> 'valid')::boolean;
  v_registro public.tentativas_login%rowtype;
  v_limite constant int := 5;
  v_janela constant interval := interval '1 hour';
begin
  -- Login certo: zera o contador desse usuário e libera.
  if v_valido then
    delete from public.tentativas_login where usuario_id = v_usuario_id;
    return jsonb_build_object('decision', 'continue');
  end if;

  select * into v_registro
    from public.tentativas_login
    where usuario_id = v_usuario_id
    for update;

  -- Sem registro ainda, ou a última janela de 1h já expirou: começa uma nova.
  if v_registro is null or now() - v_registro.janela_iniciada_em > v_janela then
    insert into public.tentativas_login (usuario_id, tentativas, janela_iniciada_em)
      values (v_usuario_id, 1, now())
      on conflict (usuario_id) do update
        set tentativas = 1, janela_iniciada_em = now();
    return jsonb_build_object('decision', 'continue');
  end if;

  -- Dentro da janela atual e já bateu o limite: bloqueia com mensagem clara.
  if v_registro.tentativas >= v_limite then
    return jsonb_build_object(
      'decision', 'reject',
      'message', 'Muitas tentativas de login com senha incorreta. Tente novamente em 1 hora, ou redefina sua senha.'
    );
  end if;

  update public.tentativas_login
    set tentativas = tentativas + 1
    where usuario_id = v_usuario_id;
  return jsonb_build_object('decision', 'continue');
end;
$$;

comment on function public.hook_password_verification_attempt(jsonb) is
  'Auth Hook "Password Verification Attempt" — bloqueia login por senha após 5 tentativas erradas em 1 hora por usuário. Configurado em supabase/config.toml [auth.hook.password_verification_attempt].';

-- O GoTrue (serviço de auth do Supabase) chama esta função como o role
-- `supabase_auth_admin` — precisa de permissão explícita de execução.
grant execute on function public.hook_password_verification_attempt(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_password_verification_attempt(jsonb) from authenticated, anon, public;
