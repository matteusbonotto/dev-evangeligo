import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/routePaths";
import { useAuth } from "../../features/authentication/context/AuthContext";
import { BottomNav } from "./BottomNav";
import { BrandMark } from "./BrandMark";
import { TopHud } from "./TopHud";

/**
 * Mede a altura real da barra de topo (varia: uma linha no desktop, duas
 * linhas no mobile por causa do `flex-wrap` do T-019) e publica como a
 * variável CSS `--top-hud-height` em `:root` — páginas que precisam
 * grudar um cabeçalho próprio logo abaixo dela (ex.: leitura bíblica)
 * usam essa variável em vez de um número fixo, que quebraria sempre que
 * a barra mudasse de altura entre breakpoints.
 *
 * Mede via `querySelector(".top-hud")` a partir de um ref no `.app-shell`
 * em vez de envolver a `.top-hud` num `<div>` próprio: um wrapper com a
 * MESMA altura do filho `position: sticky` zera a "folga" de rolagem em
 * que o sticky teria espaço pra grudar, quebrando o efeito por completo
 * mesmo com `position: sticky` corretamente aplicado (bug real encontrado
 * ao implementar isto — ver ADR-027).
 */
function useMedirAlturaTopHud(shellRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const el = shell.querySelector<HTMLElement>(".top-hud");
    if (!el) return;
    function medir() {
      if (!el) return;
      document.documentElement.style.setProperty(
        "--top-hud-height",
        `${el.getBoundingClientRect().height}px`,
      );
    }
    medir();
    // `ResizeObserver` não existe no jsdom (ambiente de teste) — a
    // medição inicial acima já roda, só a reação a mudanças de tamanho
    // depois disso não acontece nesse ambiente, o que é inofensivo.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    return () => observer.disconnect();
  }, [shellRef]);
}

/**
 * Casca compartilhada de toda página "de dentro do app" (dashboard,
 * trilhas, aula, quiz, bíblia, harpa): barra de status persistente no topo
 * + navegação inferior fixa, sempre visíveis — ver `TopHud`/`BottomNav`
 * para o motivo (feedback do usuário, ADR-018). Páginas públicas (home,
 * termos/privacidade, telas de autenticação) continuam com seu próprio
 * cabeçalho simples, sem este shell.
 *
 * Sem usuário (visitante não autenticado navegando trilhas/bíblia/harpa,
 * que continuam abertas sem login — `IA/docs/ux-ui.md`), mostra uma barra
 * simplificada no lugar do HUD completo em vez de escondê-la.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const shellRef = useRef<HTMLDivElement>(null);
  useMedirAlturaTopHud(shellRef);

  return (
    <div className="app-shell" ref={shellRef}>
      {user ? (
        <TopHud user={user} onSignOut={signOut} />
      ) : (
        <div className="top-hud top-hud--guest">
          <div className="top-hud-inner">
            <Link className="brand" to={ROUTE_PATHS.home}>
              <BrandMark />
            </Link>
            <div className="top-hud-guest-actions">
              <Link className="header-link" to={ROUTE_PATHS.signIn}>
                Entrar
              </Link>
              <Link className="primary-button small" to={ROUTE_PATHS.signUp}>
                Começar
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="app-shell-content">{children}</main>

      <BottomNav />
    </div>
  );
}
