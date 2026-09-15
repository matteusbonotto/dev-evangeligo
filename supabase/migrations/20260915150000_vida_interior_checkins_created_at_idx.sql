-- A rotação e a sequência de Vida Interior leem o histórico cronológico do
-- próprio usuário. Este índice não altera o schema nem a política RLS.
create index if not exists vida_interior_checkins_user_created_at_idx
  on public.vida_interior_checkins (user_id, created_at desc);
