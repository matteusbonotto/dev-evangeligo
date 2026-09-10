/**
 * Rotas do fluxo de autenticação ainda não presentes em
 * `src/app/routePaths.ts` — por restrição da T-005, aquele arquivo não deve
 * ser editado por este agente. Mantidas aqui para uso interno da feature
 * (páginas e `AuthContext`) e para que a integração final precise apenas
 * copiar estas duas entradas para `ROUTE_PATHS`.
 *
 * `signIn`/`signUp` já existem em `ROUTE_PATHS` (`/entrar`, `/cadastro`) e
 * continuam sendo importados de lá pelas páginas desta feature.
 */
export const AUTH_ROUTE_PATHS = {
  forgotPassword: "/recuperar-senha",
  resetPassword: "/redefinir-senha",
} as const;
