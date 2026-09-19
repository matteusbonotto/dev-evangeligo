import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiShield } from "react-icons/fi";
import "../admin.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../../authentication/context/AuthContext";
import { AdminConquistasTab } from "../components/AdminConquistasTab";
import { AdminMissoesTab } from "../components/AdminMissoesTab";
import { AdminQuizzesTab } from "../components/AdminQuizzesTab";
import { AdminTrilhasTab } from "../components/AdminTrilhasTab";
import { AdminUsuariosTab } from "../components/AdminUsuariosTab";

type Aba = "usuarios" | "conquistas" | "missoes" | "trilhas" | "quizzes";

const ABAS: { id: Aba; label: string }[] = [
  { id: "usuarios", label: "Usuários" },
  { id: "conquistas", label: "Conquistas" },
  { id: "missoes", label: "Missões" },
  { id: "trilhas", label: "Trilhas & Aulas" },
  { id: "quizzes", label: "Quizzes" },
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
 * Abas "Trilhas & Aulas" e "Quizzes" (ADR-056): o usuário, perguntado
 * explicitamente se o escopo deveria cobrir também conteúdo doutrinário
 * (inicialmente deixado de fora por exigir revisão do agente
 * `teologia-reformada`, regra 18/ADR-004), respondeu "pode incluir tudo" —
 * decisão dele, documentada aqui. As 5 trilhas/17 aulas/5 quizzes
 * ORIGINAIS continuam estáticas em código, nunca editadas por este painel;
 * estas abas criam conteúdo ADICIONAL. O painel não impõe revisão
 * doutrinária automática sobre o que for criado aqui.
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
          {aba === "trilhas" && <AdminTrilhasTab />}
          {aba === "quizzes" && <AdminQuizzesTab />}
        </section>
      </div>
    </AppShell>
  );
}
