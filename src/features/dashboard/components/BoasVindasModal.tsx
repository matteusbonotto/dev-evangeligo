import { GiHeartWings } from "react-icons/gi";

/**
 * Popup de boas-vindas (T-077) — pedido explícito do usuário: explicar,
 * assim que a pessoa chega no Dashboard pela 1ª vez (`DashboardPage.tsx`
 * controla a exibição via `localStorage`, não este componente), que o
 * app é uma gamificação cristã de criação de hábito que só funciona com
 * honestidade — não há validação do que a pessoa faz, só Deus vê tudo; o
 * responsável técnico só enxerga métricas do jogo. Texto redigido
 * seguindo os princípios de `IA/agents/psicologia-engajamento.md`: nunca
 * usar culpa espiritual como gatilho (a honestidade é apresentada como a
 * base do valor do app pra pessoa, não uma ameaça/cobrança), tom
 * acolhedor e direto, sem parágrafos longos.
 */
export function BoasVindasModal({ onFechar }: { onFechar: () => void }) {
  return (
    <div className="boas-vindas-overlay" onClick={onFechar}>
      <div
        className="boas-vindas-caixa boas-vindas-modal"
        role="dialog"
        aria-labelledby="boas-vindas-titulo"
        onClick={(event) => event.stopPropagation()}
      >
        <GiHeartWings className="boas-vindas-icone" aria-hidden="true" />
        <h2 id="boas-vindas-titulo">Bem-vindo(a) ao EvangeliGO</h2>

        <p>
          O EvangeliGO é um app de hábito espiritual gamificado — pense nele
          como um Duolingo para a sua caminhada com Deus.
        </p>

        <p>
          Ele funciona de um jeito diferente: <strong>não existe validação</strong>{" "}
          do que você faz. Ninguém confere se você realmente orou, leu ou
          refletiu. O que sustenta tudo isso é a sua honestidade — com Deus,
          que vê tudo, e com você mesmo(a).
        </p>

        <p>
          A equipe técnica só enxerga métricas do jogo (nível, ofensiva, XP)
          — nunca o conteúdo das suas respostas ou reflexões.
        </p>

        <p className="boas-vindas-contato">
          Dúvidas ou sugestões?{" "}
          <a href="mailto:evangeligogame@gmail.com">
            evangeligogame@gmail.com
          </a>
        </p>

        <button
          type="button"
          className="primary-button full"
          onClick={onFechar}
        >
          Vamos começar
        </button>
      </div>
    </div>
  );
}
