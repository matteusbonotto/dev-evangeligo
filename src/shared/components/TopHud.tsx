import { FiDollarSign, FiHeart, FiLogOut, FiZap } from "react-icons/fi";
import type { DemoUser } from "../../features/authentication/demo/demoUser";
import { montarUrlAvatar } from "../../features/avatar/avatarUrl";

/**
 * Barra de status persistente (T-011/T-012, feedback do usuário: "sinto
 * falta da barrinha de progresso" em todas as telas, não só no dashboard).
 * Espelha o padrão do app legado (nível + XP + ouro/sequência/corações
 * sempre visíveis, em toda tela, não só na Início) — ver
 * `IA/memory/decisions.md` ADR-018. NÃO duplica nem substitui o HUD de
 * armadura/inventário do `DashboardPage` (esse foi elogiado explicitamente
 * pelo usuário como "não mudaria de forma alguma") — esta barra é um
 * elemento novo, adicional, que aparece em toda página autenticada.
 */
export function TopHud({
  user,
  onSignOut,
}: {
  user: DemoUser;
  onSignOut: () => void;
}) {
  const xpPercent = Math.min(
    100,
    Math.round((user.xp / user.xpToNextLevel) * 100),
  );

  return (
    <div className="top-hud">
      <div className="top-hud-inner">
        <div className="top-hud-level">
          <span className="top-hud-level-badge">{user.level}</span>
          <div
            className="top-hud-xp-track"
            role="progressbar"
            aria-label="Progresso de XP até o próximo nível"
            aria-valuenow={xpPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="top-hud-xp-fill"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        <div className="top-hud-stats">
          <span className="top-hud-pill top-hud-pill--gold">
            <FiDollarSign aria-hidden="true" /> {user.gold}
          </span>
          <span className="top-hud-pill top-hud-pill--streak">
            <FiZap aria-hidden="true" /> {user.streakDays}
          </span>
          <span className="top-hud-pill top-hud-pill--hearts">
            <FiHeart aria-hidden="true" /> {user.hearts}/{user.maxHearts}
          </span>
        </div>

        <div className="top-hud-user">
          {user.isDemo && <span className="demo-badge">Demonstração</span>}
          <img
            className="top-hud-avatar-img"
            src={montarUrlAvatar(user.avatarConfig)}
            alt={`Avatar de ${user.name}`}
          />
          <button
            className="icon-button"
            type="button"
            onClick={onSignOut}
            aria-label="Sair"
            title="Sair"
          >
            <FiLogOut aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
