# Estratégia de Testes

## Níveis
- **Unitário**: Vitest — regras de domínio, utilitários, hooks.
- **Integração**: Vitest + Testing Library — componentes e fluxos.
- **E2E**: Playwright — fluxos críticos (onboarding, quiz, missão) desktop/mobile.
- **Banco**: pgTAP — roles, policies, RLS, funções.

## Comandos
- `npm run validate` — format, lint, typecheck, test, build.
- `npm run test` — testes unitários/integração.
- `npm run test:e2e` — testes E2E.
- `npm run supabase:test` — testes de banco (pgTAP).

## Cobertura alvo
- Regras de domínio: alta.
- Fluxos críticos (auth, onboarding, quiz, missão): E2E.
- RLS e policies: pgTAP.

## Fluxo de bug
IMPLEMENT → TEST → BUG → INVESTIGATE → FIX → RETEST → REGRESSION → APPROVE.

## Gate de conclusão
DONE exige: código + testes + QA + regressão + documentação + memória + checklist.
