# Padrões de Git

## Commits
- Mensagens claras e descritivas.
- Prefixo de tipo: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Ex.: `feat: adiciona onboarding estilo Duolingo`.

## Branches
- `main` — estável.
- `feature/<nome>` — novas funcionalidades.
- `fix/<nome>` — correções.

## Regras
- Não commitar secrets.
- Não commitar `node_modules`, `dist`, `.env`.
- Revisar antes de merge.
- Manter histórico (não reescrever sem necessidade).

## Fluxo
1. Branch a partir de `main`.
2. Implementar + testar.
3. Commit com mensagem clara.
4. Merge após validação.
