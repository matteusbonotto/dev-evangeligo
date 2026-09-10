# Padrões de Nomenclatura

## Arquivos
- Componentes: `PascalCase.tsx` (ex.: `QuizCard.tsx`).
- Hooks: `useCamelCase.ts` (ex.: `useQuiz.ts`).
- Serviços: `camelCase.ts` (ex.: `quizService.ts`).
- Schemas: `camelCase.schema.ts` (ex.: `quiz.schema.ts`).
- Páginas: `PascalCasePage.tsx` (ex.: `QuizPage.tsx`).

## Variáveis e funções
- `camelCase`.
- Constantes: `UPPER_SNAKE_CASE`.

## Tipos e interfaces
- `PascalCase`.
- Preferir `type` para uniões e `interface` para objetos.

## Banco de dados
- Tabelas: `snake_case` plural (ex.: `user_progress`).
- Colunas: `snake_case`.
- Migrations: `YYYYMMDDHHMMSS_nome.sql`.

## Rotas
- `camelCase` (ex.: `/apresentacao`, `/entrar`, `/privacidade`).
