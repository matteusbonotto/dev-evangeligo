import { Link } from "react-router-dom";
import { FiLayout } from "react-icons/fi";
import "../quebracabeca.css";
import { getLivroByOrder } from "../../../bible/data/livros";
import { QUEBRA_CABECA_CHALLENGES } from "../content";
import { buildQuebraCabecaPath } from "../routePaths";
import { AppShell } from "../../../../shared/components/AppShell";
import { ROUTE_PATHS } from "../../../../app/routePaths";

/** Lista de desafios do quebra-cabeça (T-035). */
export function QuebraCabecaListPage() {
  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.trilhas}>
          Voltar
        </Link>

        <section className="dash-card" aria-labelledby="quebra-cabeca-title">
          <p className="eyebrow">
            <FiLayout aria-hidden="true" /> Exercício
          </p>
          <h1 id="quebra-cabeca-title">Quebra-cabeça</h1>
          <p className="trilha-card-description">
            Reordene as palavras para reconstruir o versículo.
          </p>
        </section>

        <div className="dash-grid">
          {QUEBRA_CABECA_CHALLENGES.map((challenge) => {
            const livro = getLivroByOrder(challenge.livroOrder);
            const referencia = livro
              ? `${livro.nome} ${challenge.capitulo}:${challenge.versiculo}`
              : "";
            return (
              <Link
                key={challenge.id}
                className="dash-card trilha-card"
                to={buildQuebraCabecaPath(challenge.id)}
              >
                <p className="eyebrow">{referencia}</p>
                <h2>?????</h2>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
