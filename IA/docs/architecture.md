# Arquitetura

## Visão geral
Aplicação organizada por feature. React consome hooks e serviços; regras de domínio não dependem de React, navegador ou Supabase. TanStack Query controla estado remoto e o Supabase implementa persistência e autorização por RLS.

## Camadas
- **Domínio**: regras puras, tipos, schemas (Zod). Sem dependência de framework.
- **Aplicação**: hooks, serviços, casos de uso.
- **Infraestrutura**: Supabase client, storage, API.
- **Apresentação**: páginas, componentes, UI.

## Estrutura de pastas (feature-first)
```
src/
  app/            # Router, rotas, providers
  config/         # Configuração e environment
  infrastructure/ # Supabase, storage, API
  features/       # Cada feature agrupa pages, hooks, services, schemas
    authentication/
    study/        # trilhas, aulas, quizzes
    bible/        # bíblia, harpa
    gamification/ # XP, níveis, sequências, conquistas, missões
    rpg/          # armadura, itens, inventário, loja
    social/       # feed, chat, missões colaborativas
    admin/
  pages/          # Páginas públicas (home, legal)
  shared/         # Componentes e utilitários compartilhados
```

## Fluxo de dados
- UI → Hook (TanStack Query) → Serviço → Supabase (RLS) → Banco.
- Regras de domínio validadas com Zod antes de persistir.

## PWA
- `vite-plugin-pwa` para manifest, service worker e offline.

## Backend
- Supabase: PostgreSQL, RLS, RPC, storage, auth.
- Migrations versionadas em `supabase/migrations/`.
- `service_role` nunca no frontend.

## Migração do legado
- Legado congelado em `legacy/` e `public/game/`.
- Funcionalidades migram uma a uma para React.
- Permanecem ocultas até cumprirem testes e segurança.
