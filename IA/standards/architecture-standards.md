# Padrões de Arquitetura

## Camadas
- **Domínio**: regras puras, tipos, schemas. Sem dependência de React/navegador/Supabase.
- **Aplicação**: hooks, serviços, casos de uso.
- **Infraestrutura**: Supabase client, storage, API.
- **Apresentação**: páginas, componentes.

## Regras
- Regras de domínio não dependem de framework.
- Feature-first.
- Estado remoto via TanStack Query.
- Persistência via Supabase com RLS.
- `service_role` nunca no frontend.

## Dependências
- Dependências apontam para dentro (apresentação → aplicação → domínio).
- Infraestrutura é injetada, não importada diretamente no domínio.

## Migração
- Legado congelado; funcionalidades migram uma a uma.
- Permanecem ocultas até cumprirem testes e segurança.
