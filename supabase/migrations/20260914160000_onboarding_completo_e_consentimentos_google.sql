-- Login com Google completo (T-043/ADR-037): o cadastro por e-mail/senha
-- só cria a conta no passo final do onboarding (T-006), então
-- `profiles.objetivo`/`estado_civil`/`nascimento` ficam sempre preenchidos
-- (ou explicitamente vazios) para essas contas. Contas criadas via Google
-- OAuth, porém, são criadas pelo próprio Supabase no exato momento do
-- redirect — SEM passar pelos passos do onboarding (nascimento/estado
-- civil/objetivo/aceite de termos) — então `handle_new_user()` roda com
-- `raw_user_meta_data` vindo do Google (nome/e-mail/avatar), não com os
-- campos que nosso onboarding coleta. Precisamos de uma forma explícita de
-- saber "esta conta ainda precisa terminar o cadastro" sem depender de
-- inferir isso a partir de um campo opcional estar vazio (algo que uma
-- conta por e-mail/senha legitimamente pode ter).

alter table public.profiles
  add column if not exists onboarding_completo boolean not null default false;

comment on column public.profiles.onboarding_completo is
  'true quando a pessoa passou pelo fluxo completo do onboarding (termos + dados). Contas por e-mail/senha marcam true no fim de finalizarCadastro(); contas Google marcam true no fim da retomada em OnboardingPage (modo Google) — até lá, AuthCallbackPage redireciona de volta para o onboarding em vez do dashboard.';

-- Contas já existentes (criadas antes desta coluna existir, via e-mail/
-- senha, portanto já passaram pelo onboarding completo) são retroativamente
-- marcadas como concluídas — só um caso a esta altura (T-005/T-006 já
-- validados contra o banco antigo, mas este é um projeto novo, então isto
-- é só uma garantia caso algum teste manual já tenha criado uma conta).
update public.profiles set onboarding_completo = true where objetivo is not null;
