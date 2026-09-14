import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { supabaseClient } from "../../../infrastructure/supabase/client";
import { useAuth } from "../context/AuthContext";

/**
 * Página fina de retorno do OAuth do Google (T-043/ADR-037,
 * `ROUTE_PATHS.authCallback`, "/auth/retorno") — não renderiza nada de
 * verdade, só existe para o Supabase JS processar a sessão do redirect
 * (`onAuthStateChange` em `AuthContext`) e decidir para onde ir:
 *
 * - Sem sessão (OAuth cancelado/falhou): volta para a tela de entrada.
 * - Sessão existe e `profiles.onboarding_completo` já é `true`: é um
 *   login normal de alguém que já tinha concluído o cadastro — vai
 *   direto para o dashboard.
 * - Sessão existe mas `onboarding_completo` é `false`: é a PRIMEIRA vez
 *   dessa conta (criada pelo próprio Supabase no instante do redirect,
 *   sem passar pelos passos de nascimento/estado civil/objetivo/termos)
 *   — manda para `OnboardingPage` em modo "retomar Google"
 *   (`?google=1`), que pula nome/e-mail/senha (já vieram do Google) e
 *   pede só o que falta.
 */
export function AuthCallbackPage() {
  const { authStatus, supabaseUser } = useAuth();
  const [destino, setDestino] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!supabaseUser || !supabaseClient) {
      setDestino(ROUTE_PATHS.signIn);
      return;
    }
    let ativo = true;
    Promise.resolve(
      supabaseClient
        .from("profiles")
        .select("onboarding_completo")
        .eq("id", supabaseUser.id)
        .maybeSingle(),
    )
      .then(({ data }) => {
        if (!ativo) return;
        setDestino(
          data?.onboarding_completo
            ? ROUTE_PATHS.dashboard
            : `${ROUTE_PATHS.signUp}?google=1`,
        );
      })
      .catch(() => {
        if (ativo) setDestino(`${ROUTE_PATHS.signUp}?google=1`);
      });
    return () => {
      ativo = false;
    };
  }, [authStatus, supabaseUser]);

  if (!destino) {
    return <main className="loading-screen">Entrando...</main>;
  }
  return <Navigate to={destino} replace />;
}
