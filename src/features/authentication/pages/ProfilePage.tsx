import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiUser } from "react-icons/fi";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../context/AuthContext";
import { montarUrlAvatar } from "../../avatar/avatarUrl";
import { supabaseClient } from "../../../infrastructure/supabase/client";

/**
 * Página de Perfil (T-054/ADR-047, Fase 3 do plano de UX) — pedido do
 * usuário: poder ver o avatar fora do Dashboard e "ver em configurações ou
 * perfil que já aceitou os termos e poder rever sempre que quiser" em vez
 * de ser perguntado de novo. Consentimento é só EXIBIDO aqui (a versão e a
 * data já aceitas, lidas de `consentimentos`) — nunca um novo aceite é
 * pedido nesta tela.
 */

interface ConsentimentoRecente {
  terms_version: string;
  privacy_version: string;
  created_at: string;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ProfilePage() {
  const { user, authStatus, supabaseUser } = useAuth();
  const [consentimento, setConsentimento] = useState<
    ConsentimentoRecente | null | "carregando" | "indisponivel"
  >(null);

  useEffect(() => {
    if (!supabaseClient || !supabaseUser) {
      setConsentimento("indisponivel");
      return;
    }
    let ativo = true;
    setConsentimento("carregando");
    Promise.resolve(
      supabaseClient
        .from("consentimentos")
        .select("terms_version, privacy_version, created_at")
        .eq("user_id", supabaseUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    )
      .then(({ data }) => {
        if (ativo) setConsentimento((data as ConsentimentoRecente | null) ?? "indisponivel");
      })
      .catch(() => {
        if (ativo) setConsentimento("indisponivel");
      });
    return () => {
      ativo = false;
    };
  }, [supabaseUser]);

  if (!user) {
    if (authStatus === "authenticated") {
      return (
        <AppShell>
          <main className="loading-screen">Carregando...</main>
        </AppShell>
      );
    }
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Início
        </Link>

        <section className="dash-card profile-card" aria-labelledby="profile-title">
          <p className="eyebrow">
            <FiUser aria-hidden="true" /> Perfil
          </p>
          <h1 id="profile-title">{user.name}</h1>

          <div className="profile-header">
            <img
              className="profile-avatar-img"
              src={montarUrlAvatar(user.avatarConfig)}
              alt={`Avatar de ${user.name}`}
            />
            <div className="profile-header-info">
              <p className="profile-email">{user.email}</p>
              <Link to={ROUTE_PATHS.avatar} className="secondary-button small">
                Editar avatar
              </Link>
            </div>
          </div>

          <div className="profile-stats">
            <span className="top-hud-pill top-hud-pill--gold">
              Nível {user.level}
            </span>
            <span className="top-hud-pill top-hud-pill--gold">
              $ {user.gold} ouro
            </span>
            <span className="top-hud-pill top-hud-pill--streak">
              🔥 {user.streakDays} dias
            </span>
          </div>
        </section>

        <section
          className="dash-card"
          aria-labelledby="profile-consentimento-title"
        >
          <p className="eyebrow" id="profile-consentimento-title">
            <FiCheckCircle aria-hidden="true" /> Termos e Privacidade
          </p>

          {user.isDemo && (
            <p className="profile-consentimento-info">
              Modo demonstração — sem cadastro real, nenhum consentimento é
              coletado. Crie uma conta para registrar seu aceite.
            </p>
          )}

          {!user.isDemo && consentimento === "carregando" && (
            <p className="profile-consentimento-info">Carregando…</p>
          )}

          {!user.isDemo && consentimento === "indisponivel" && (
            <p className="profile-consentimento-info">
              Não encontramos um registro de consentimento para esta conta
              ainda.
            </p>
          )}

          {!user.isDemo &&
            consentimento &&
            consentimento !== "carregando" &&
            consentimento !== "indisponivel" && (
              <>
                <p className="profile-consentimento-info">
                  Você aceitou os Termos de Uso (versão{" "}
                  {consentimento.terms_version}) e a Política de Privacidade
                  (versão {consentimento.privacy_version}) em{" "}
                  <strong>{formatarData(consentimento.created_at)}</strong>.
                  Você não precisa aceitar de novo — pode reler os documentos
                  quando quiser.
                </p>
                <div className="profile-legal-links">
                  <Link to={ROUTE_PATHS.terms}>Reler Termos de Uso</Link>
                  <Link to={ROUTE_PATHS.privacy}>
                    Reler Política de Privacidade
                  </Link>
                </div>
              </>
            )}
        </section>
      </div>
    </AppShell>
  );
}
