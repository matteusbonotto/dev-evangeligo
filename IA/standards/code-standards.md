# Padrões de Código

## TypeScript
- TypeScript estrito, sem `any`.
- Tipos explícitos em fronteiras (props, retornos de API).
- Zod para validação de entrada.

## React
- Componentes funcionais.
- Hooks com nomes `use*`.
- Componentes pequenos e reutilizáveis.
- Props tipadas.

## Estilo
- Prettier para formatação.
- ESLint para lint.
- Nomes descritivos.

## Estrutura
- Feature-first.
- Regras de domínio puras (sem dependência de framework).

## Qualidade
- `npm run validate` deve passar antes de concluir.
- Testes para regras de domínio e componentes.
