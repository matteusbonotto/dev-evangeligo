import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { useAuth } from "../context/AuthContext";

/**
 * Guarda de rota reutilizável: redireciona para a tela de login quem não
 * está autenticado (nem em modo demonstração, nem com sessão Supabase real).
 *
 * NÃO está ligada a nenhuma rota em `src/app/AppRouter.tsx` — por restrição
 * da T-005, esse arquivo não deve ser editado por este agente. Para proteger
 * uma rota, envolva o elemento existente, por exemplo:
 *
 * ```tsx
 * <Route
 *   path={ROUTE_PATHS.dashboard}
 *   element={
 *     <RequireAuth>
 *       <DashboardPage />
 *     </RequireAuth>
 *   }
 * />
 * ```
 *
 * Observação: hoje `DashboardPage` só sabe renderizar o `DemoUser` mockado
 * (via `useAuth().user`), então um usuário com sessão Supabase real passaria
 * por este guard mas ainda veria a tela vazia até que os dados de jogo
 * (T-007+) sejam carregados a partir do `profiles`/`user_progress`. Ver
 * relatório da T-005 para detalhes.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, authStatus } = useAuth();
  const location = useLocation();

  if (authStatus === "loading") {
    return <main className="loading-screen">Carregando...</main>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTE_PATHS.signIn} replace state={{ from: location }} />
    );
  }

  return <>{children}</>;
}
