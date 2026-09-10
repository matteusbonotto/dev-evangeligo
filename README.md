# EvangeliGO

App gamificado estilo Duolingo de **Teologia Cristã Reformada Calvinista**, reconstruído de forma profissional a partir do legado funcional (`dev-pwa-biblia-game`).

## Stack

- **Frontend**: React, TypeScript estrito, Vite, PWA.
- **Estado remoto**: TanStack Query.
- **Backend**: Supabase (PostgreSQL, RLS, funções).
- **Testes**: Vitest, Playwright, pgTAP.
- **Formulários**: React Hook Form + Zod.

## Estrutura

- `IA/` — núcleo operacional de conhecimento (agentes, memória, docs, standards, commands, checklist).
- `src/` — código do app profissional (feature-first).
- `MASTER PROJECT BUILDER.md` — base metodológica.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha com credenciais do Supabase
npm run dev
```

Qualidade completa: `npm run validate`.

## Princípios

- Gamificação a serviço do aprendizado, nunca mérito espiritual.
- Privacidade real (LGPD, dados religiosos como sensíveis).
- Conteúdo doutrinário reformado validado por agente especialista.
- RLS em todas as tabelas; `service_role` nunca no frontend.

## Roadmap

Ver `IA/checklist/tasks.json` e abrir `IA/checklist/index.html` no navegador.
