# Padrões de Segurança

## Obrigatório
- RLS em toda tabela.
- `service_role` nunca no frontend.
- Secrets nunca no código (usar env vars).
- Validação de entrada com Zod.
- Não logar dados sensíveis.

## Autenticação
- Sessão persistente com refresh.
- Google OAuth e recuperação de senha.

## Privacidade
- Dados religiosos como sensíveis (LGPD).
- Consentimento explícito e auditável.
- Exportação e exclusão de dados.

## Revisão
- Auditoria de segurança antes do release.
- Revisar OWASP Top 10.
