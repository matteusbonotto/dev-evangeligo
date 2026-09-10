import { NavLink } from "react-router-dom";
import {
  FiBook,
  FiBookOpen,
  FiBox,
  FiHome,
  FiShoppingBag,
} from "react-icons/fi";
import { ROUTE_PATHS } from "../../app/routePaths";

const ITEMS = [
  { to: ROUTE_PATHS.dashboard, label: "Início", Icon: FiHome },
  { to: ROUTE_PATHS.trilhas, label: "Trilhas", Icon: FiBookOpen },
  { to: ROUTE_PATHS.bible, label: "Bíblia", Icon: FiBook },
  { to: ROUTE_PATHS.loja, label: "Loja", Icon: FiShoppingBag },
  { to: ROUTE_PATHS.inventario, label: "Inventário", Icon: FiBox },
] as const;

/**
 * Navegação inferior persistente, ao estilo de app mobile (T-011/T-012,
 * feedback do usuário — "sinto falta do menu"). Mesma ideia da barra
 * inferior do app legado (Início/Missões/Bíblia/Feed/Perfil), adaptada às
 * seções que já existem nesta versão. Harpa e Exercícios saíram daqui:
 * Harpa vive dentro da Bíblia (cartão depois de Apocalipse + filtro
 * próprio) e Exercícios dentro de Trilhas. Loja/Inventário entraram aqui
 * "pelo menos por enquanto" (pedido explícito do usuário) — quando
 * Perfil/Comunidade existirem, esses 2 slots podem voltar a ser
 * reavaliados (mesmas 5 seções do legado, conteúdo diferente).
 */
export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <div className="bottom-nav-inner">
        {ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`
            }
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
