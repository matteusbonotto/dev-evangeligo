import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiShield,
  FiStar,
  FiZap,
} from "react-icons/fi";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../../authentication/context/AuthContext";
import { DestaquesDoDia } from "../../daily/components/DestaquesDoDia";
import { RpgItemModal, type SelecaoRpg } from "../../rpg/components/RpgItemModal";
import { AvatarRPG } from "../components/AvatarRPG";
import { HeartsBar } from "../components/HeartsBar";
import { ItemSlots } from "../components/ItemSlots";
import { SpiritBattle } from "../components/SpiritBattle";
import { StatBar } from "../components/StatBar";
import { StatPill } from "../components/StatPill";

export function DashboardPage() {
  const { user, authStatus } = useAuth();
  const [selecaoRpg, setSelecaoRpg] = useState<SelecaoRpg | null>(null);

  if (!user) {
    // Conta real autenticada: `user` ainda está sendo carregado do Supabase
    // (T-047/ADR-040, `AuthContext`) — sem este caso, uma conta real recém-
    // logada era redirecionada pra home antes da busca terminar.
    if (authStatus === "authenticated") {
      return (
        <AppShell>
          <main className="loading-screen">Carregando sua jornada...</main>
        </AppShell>
      );
    }
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  return (
    <AppShell>
      <div className="dashboard">
        <h1 className="sr-only">Painel</h1>
        <div className="dash-grid">
          <section className="dash-card hud-card" aria-labelledby="hud-title">
            <p className="hud-username" id="hud-title">
              {user.name}
            </p>

            <div className="hud-layout">
              <div className="hud-left">
                <p className="eyebrow">Armadura · Ef 6:10-18</p>
                <AvatarRPG
                  user={user}
                  onSelecionarSlot={(slot) => setSelecaoRpg({ tipo: "armadura", slot })}
                />
              </div>
              <div className="hud-right">
                <p className="eyebrow">Inventário</p>
                <ItemSlots
                  items={user.inventory}
                  onSelecionarItem={(itemId) =>
                    setSelecaoRpg({ tipo: "inventario", itemId })
                  }
                />
              </div>
            </div>

            <div className="hud-stats">
              <StatPill
                icon={<FiDollarSign aria-hidden="true" />}
                value={user.gold}
                label="ouro"
                tone="gold"
              />
              <StatPill
                icon={<FiZap aria-hidden="true" />}
                value={user.streakDays}
                label="dias"
              />
              <StatPill
                icon={<FiAward aria-hidden="true" />}
                value={user.achievements.length}
                label="medalhas"
              />
            </div>

            <div className="hud-hearts-row">
              <HeartsBar hearts={user.hearts} maxHearts={user.maxHearts} />
            </div>
          </section>

          <DestaquesDoDia />

          <section className="dash-card" aria-labelledby="spirit-flesh-title">
            <p className="eyebrow" id="spirit-flesh-title">
              Vida interior — Gálatas 5:16-23
            </p>
            <SpiritBattle entries={user.spiritBattle} />
            <Link
              className="civ-historico-link"
              to={ROUTE_PATHS.vidaInteriorHistorico}
            >
              Ver histórico por período
            </Link>
          </section>

          <section className="dash-card" aria-labelledby="progress-title">
            <p className="eyebrow" id="progress-title">
              Progresso
            </p>
            <div className="stat-bar-stack">
              <StatBar
                label="Aulas"
                value={user.completedLessons}
                max={user.totalLessons}
                icon={<FiBookOpen aria-hidden="true" />}
              />
              <StatBar
                label="Quizzes"
                value={user.completedQuizzes}
                max={user.totalQuizzes}
                icon={<FiCheckCircle aria-hidden="true" />}
              />
              <StatBar
                label="XP até o próximo nível"
                value={user.xp}
                max={user.xpToNextLevel}
                icon={<FiZap aria-hidden="true" />}
              />
              <div className="progress-item">
                <div className="progress-label">
                  <span>
                    <FiClock aria-hidden="true" /> Melhor sequência
                  </span>
                  <span>{user.bestStreak} dias</span>
                </div>
              </div>
            </div>
          </section>

          <section className="dash-card" aria-labelledby="achievements-title">
            <p className="eyebrow" id="achievements-title">
              <FiAward aria-hidden="true" /> Conquistas
            </p>
            <ul className="achievement-list">
              {user.achievements.map((achievement) => (
                <li key={achievement.id} className="achievement-item">
                  <span
                    className={`rarity rarity--${achievement.rarity}`}
                    aria-hidden="true"
                  >
                    <FiStar />
                  </span>
                  <div>
                    <strong>{achievement.title}</strong>
                    <p>{achievement.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="dash-card" aria-labelledby="mais-opcoes-title">
            <p className="eyebrow" id="mais-opcoes-title">
              Mais opções
            </p>
            <ul className="mais-opcoes-lista">
              <li>
                <Link className="mais-opcoes-item" to={ROUTE_PATHS.apologetica}>
                  <FiShield aria-hidden="true" />
                  <span>Apologética — perguntas difíceis da fé</span>
                  <FiChevronRight aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </section>
        </div>

        <footer className="site-footer">
          <span>© 2026 EvangeliGO</span>
          <nav aria-label="Links legais">
            <Link to={ROUTE_PATHS.terms}>Termos</Link>
            <Link to={ROUTE_PATHS.privacy}>Privacidade</Link>
          </nav>
        </footer>

        {selecaoRpg && (
          <RpgItemModal
            selecao={selecaoRpg}
            onClose={() => setSelecaoRpg(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
