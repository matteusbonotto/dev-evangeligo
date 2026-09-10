import { Link } from "react-router-dom";
import { FiType } from "react-icons/fi";
import "../termo.css";
import { TERMO_CHALLENGES } from "../content";
import { buildTermoPath } from "../routePaths";
import { AppShell } from "../../../../shared/components/AppShell";
import { ROUTE_PATHS } from "../../../../app/routePaths";

/** Lista de desafios do "Termo Bíblico" (T-034). */
export function TermoListPage() {
  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.trilhas}>
          Voltar
        </Link>

        <section className="dash-card" aria-labelledby="termo-title">
          <p className="eyebrow">
            <FiType aria-hidden="true" /> Exercício
          </p>
          <h1 id="termo-title">Termo Bíblico</h1>
          <p className="trilha-card-description">
            Descubra a palavra bíblica em até 6 tentativas.
          </p>
        </section>

        <div className="dash-grid">
          {TERMO_CHALLENGES.map((challenge) => (
            <Link
              key={challenge.id}
              className="dash-card trilha-card"
              to={buildTermoPath(challenge.id)}
            >
              <p className="eyebrow">{challenge.referencia}</p>
              <h2>{"?".repeat(challenge.resposta.length)}</h2>
              <p className="termo-lista-tamanho">
                {challenge.resposta.length} letras
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
