# API e Integrações

## Supabase
- **Auth**: cadastro, login, Google OAuth, recuperação de senha, sessão.
- **Database**: PostgreSQL com RLS.
- **RPC**: funções protegidas para regras de domínio (ex.: concluir missão, ganhar XP, desbloquear conquista).
- **Storage**: avatares, materiais (PDF), áudios.

## Integrações externas
- **VLibras**: plugin de Libras (`https://vlibras.gov.br/app/vlibras-plugin.js`).
- **YouTube**: vídeos de aulas (embed por ID).
- **Google OAuth**: login social.

## Princípios
- `service_role` nunca no frontend.
- Chave `anon` é pública; segurança depende de RLS e funções protegidas.
- Regras de domínio validadas com Zod.
- Funções RPC com `SECURITY DEFINER` usadas com cuidado (nunca expor dados de outros usuários).

## Endpoints RPC planejados
- `concluir_aula(aula_id)` — marca aula concluída, concede XP.
- `concluir_quiz(quiz_id, acertos, total)` — registra resultado, concede XP.
- `concluir_missao(missao_id)` — conclui missão, concede recompensas.
- `desbloquear_conquista(conquista_id)` — valida e desbloqueia conquista.
- `equipar_item(item_id, slot)` — equipa item na armadura.
- `publicar_devocional(texto, versiculos)` — publica no feed.
- `enviar_mensagem(amigo_id, texto)` — envia mensagem.
