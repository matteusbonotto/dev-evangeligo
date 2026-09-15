import { Component, type ReactNode } from "react";

const CHAVE_RECARREGOU = "evangeligo:recarregouPorErroDeChunk";

/**
 * Sem isso, uma falha ao importar um chunk lazy (`React.lazy`, usado por
 * toda página em `AppRouter.tsx`) — comum depois de um novo deploy,
 * quando a aba já aberta ainda referencia um arquivo JS com hash antigo
 * que não existe mais no servidor — deixava a árvore inteira em branco,
 * sem nenhuma forma de recuperar sem apertar F5 manualmente (bug real
 * reportado: "clico em Trilhas vindo de outra tela e fica tudo branco").
 * Recarrega automaticamente 1x (guardado por `sessionStorage` pra nunca
 * entrar em loop caso o erro seja outra coisa) — só se isso não resolver
 * é que aparece a tela de erro com botão manual.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { comErro: boolean }
> {
  state = { comErro: false };

  static getDerivedStateFromError() {
    return { comErro: true };
  }

  componentDidCatch() {
    try {
      if (!sessionStorage.getItem(CHAVE_RECARREGOU)) {
        sessionStorage.setItem(CHAVE_RECARREGOU, "1");
        window.location.reload();
      }
    } catch {
      // sessionStorage indisponível — segue pra tela de erro manual abaixo.
    }
  }

  render() {
    if (this.state.comErro) {
      return (
        <main className="loading-screen">
          Não foi possível carregar essa página.{" "}
          <button
            type="button"
            className="secondary-button"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
