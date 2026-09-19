import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiShield } from "react-icons/fi";
import "../admin.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../../authentication/context/AuthContext";
import { AdminConquistasTab } from "../components/AdminConquistasTab";
import { AdminMissoesTab } from "../components/AdminMissoesTab";
import { AdminUsuariosTab } from "../components/AdminUsuariosTab";

type Aba = "usuarios" | "conquistas" | "missoes";

const ABAS: { id: Aba; label: string }[] = [
  { id: "usuarios", label: "Usuários" },
  { id: "conquistas", label: "Conquistas" },
  { id: "missoes", label: "Missões" },
];

/**
 * Painel admin (T-015) — pedido explícito do usuário: "tela de admin,
 * login admin e crud de conquistas, missões, desafios, e afins". "Login
 * admin" aqui é o MESMO login de sempre (e-mail/senha ou Google) — esta
 * página só verifica `user.role === "admin"` (`profiles.role`, ver
 * `demoUser.ts`/`estadoReal.ts`) em vez de existir um sistema de
 * autenticação paralelo, que duplicaria o Supabase Auth sem necessidade.
 * O primeiro admin precisa ser promovido manualmente via SQL (não existe
 * "auto-primeiro-admin" — ver `IA/memory/decisions.md` ADR-054).
 *
 * "Desafios" (RF do pedido original) não vira uma 4ª aba: os desafios
 * diários (`daily/desafios.ts`) são só uma ESCOLHA determinística por data
 * sobre o conteúdo de quiz/termo/quebra-cabeça/caça-palavras que já existe
 * — e conteúdo doutrinário (quizzes/trilhas) tem revisão obrigatória do
 * agente `teologia-reformada` antes de publicar (regra 18/ADR-004), que um
 * CRUD livre neste painel violaria. Conquistas/Missões são dado mecânico
 * (XP/ouro/meta), não doutrinário — por isso entraram, e trilhas/quizzes não.
 */
export function AdminPage() {
  const { user, authStatus } = useAuth();
  const [aba, setAba] = useState<Aba>("usuarios");

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

  if (user.isDemo || user.role !== "admin") {
    return <Navigate to={ROUTE_PATHS.dashboard} replace />;
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Painel
        </Link>

        <section className="dash-card" aria-labelledby="admin-title">
          <p className="eyebrow">
            <FiShield aria-hidden="true" /> Administração
          </p>
          <h1 id="admin-title">Painel admin</h1>

          <div className="admin-abas" role="tablist" aria-label="Seções do painel admin">
            {ABAS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={aba === item.id}
                className={`admin-aba${aba === item.id ? " admin-aba--ativa" : ""}`}
                onClick={() => setAba(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {aba === "usuarios" && <AdminUsuariosTab meuId={user.id} />}
          {aba === "conquistas" && <AdminConquistasTab />}
          {aba === "missoes" && <AdminMissoesTab />}
        </section>
      </div>
    </AppShell>
  );
}
