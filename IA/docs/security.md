# Segurança e Privacidade

## Autenticação
- E-mail/senha, Google OAuth, recuperação de senha.
- Sessão persistente com refresh automático.
- Senhas nunca armazenadas em texto puro (Supabase gerencia).

## Autorização
- RLS em todas as tabelas.
- Usuário acessa apenas seus dados.
- Roles `user`/`admin`.
- `service_role` nunca no frontend.

## Secrets
- Nunca armazenar secrets no código.
- Usar variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Chave `anon` é pública por projeto.

## Privacidade (LGPD)
- Dados religiosos tratados como sensíveis.
- Consentimento explícito e auditável (timestamp + versão dos termos).
- Minimização de dados.
- Exportação (JSON) e exclusão de conta.
- Não vender dados a terceiros.

## Boas práticas
- Validação de entrada com Zod.
- Prevenção de injeção (parâmetros, RLS).
- Não logar dados sensíveis.
- Auditoria de segurança antes do release.

## OWASP
- Revisar XSS, CSRF, injeção, exposição de dados.
- Cabeçalhos de segurança.
- HTTPS.
