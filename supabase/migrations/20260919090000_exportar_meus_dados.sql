-- =============================================================================
-- Migration: exportar_meus_dados
-- Task: T-020 (auditoria de segurança/privacidade) — achado do agente
-- Explore: "exportar meus dados" estava documentado em IA/docs/privacy.md
-- (seção 2) desde 2026-08-24, mas nunca foi implementado (zero UI, zero
-- função no banco). Esta migration cobre exatamente as tabelas que hoje
-- guardam dado real de usuário (profiles/consentimentos/rpg_*/
-- vida_interior_checkins) — trilhas/quizzes/progresso de estudo/social
-- (amigos/mensagens) continuam só `localStorage` ou nem existem ainda
-- (ver IA/memory/project-memory.md), então não entram aqui; quando essas
-- tabelas existirem de verdade, esta função precisa ser estendida (regra
-- de minimização em IA/docs/privacy.md, seção 4).
--
-- SECURITY DEFINER + `auth.uid()` lido de dentro da função (nunca um
-- user_id recebido por parâmetro do cliente) — impossível pedir o export
-- de outra conta, mesmo com essa função rodando com privilégio elevado.
-- =============================================================================

create or replace function public.exportar_meus_dados()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  resultado jsonb;
begin
  if uid is null then
    raise exception 'Não autenticado.' using errcode = '28000';
  end if;

  select jsonb_build_object(
    'gerado_em', now(),
    'aviso', 'Dados religiosos/doutrinários neste export (marcações, check-ins de Vida Interior, missões) são dado sensível conforme LGPD art. 5º, II.',
    'perfil', (
      select to_jsonb(p) - 'id'
      from public.profiles p
      where p.id = uid
    ),
    'consentimentos', coalesce((
      select jsonb_agg(to_jsonb(c) - 'user_id' order by c.created_at)
      from public.consentimentos c
      where c.user_id = uid
    ), '[]'::jsonb),
    'rpg_progresso', (
      select to_jsonb(rp) - 'user_id'
      from public.rpg_progresso rp
      where rp.user_id = uid
    ),
    'rpg_inventario', coalesce((
      select jsonb_agg(to_jsonb(ri) - 'user_id' - 'id')
      from public.rpg_inventario ri
      where ri.user_id = uid
    ), '[]'::jsonb),
    'rpg_armadura', coalesce((
      select jsonb_agg(to_jsonb(ra) - 'user_id')
      from public.rpg_armadura ra
      where ra.user_id = uid
    ), '[]'::jsonb),
    'rpg_efeitos_ativos', coalesce((
      select jsonb_agg(to_jsonb(re) - 'user_id' - 'id')
      from public.rpg_efeitos_ativos re
      where re.user_id = uid
    ), '[]'::jsonb),
    'rpg_conquistas', coalesce((
      select jsonb_agg(to_jsonb(rc) - 'user_id' order by rc.unlocked_at)
      from public.rpg_conquistas_usuario rc
      where rc.user_id = uid
    ), '[]'::jsonb),
    'vida_interior_checkins', coalesce((
      select jsonb_agg(to_jsonb(vi) - 'user_id' - 'id' order by vi.created_at)
      from public.vida_interior_checkins vi
      where vi.user_id = uid
    ), '[]'::jsonb)
  ) into resultado;

  return resultado;
end;
$$;

comment on function public.exportar_meus_dados() is
  'Exportação LGPD (T-020/IA/docs/privacy.md seção 2) — retorna todos os dados do usuário autenticado (auth.uid()), nunca de terceiros. Estender ao adicionar tabelas novas de dado pessoal.';

revoke all on function public.exportar_meus_dados() from public;
grant execute on function public.exportar_meus_dados() to authenticated;
