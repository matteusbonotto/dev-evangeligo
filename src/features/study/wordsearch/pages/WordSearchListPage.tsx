import { Link } from "react-router-dom";
import { FiGrid } from "react-icons/fi";
import "../wordsearch.css";
import { WORDSEARCH_PUZZLES } from "../content";
import { buildWordSearchPath } from "../routePaths";
import { AppShell } from "../../../../shared/components/AppShell";
import { ROUTE_PATHS } from "../../../../app/routePaths";

/** Lista de desafios de caça-palavras (T-034). */
export function WordSearchListPage() {
  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.trilhas}>
          Voltar
        </Link>

        <section className="dash-card" aria-labelledby="caca-title">
          <p className="eyebrow">
            <FiGrid aria-hidden="true" /> Exercício
          </p>
          <h1 id="caca-title">Caça-palavras</h1>
          <p className="trilha-card-description">
            Toque na primeira e na última letra de cada palavra bíblica.
          </p>
        </section>

        <div className="dash-grid">
          {WORDSEARCH_PUZZLES.map((puzzle) => (
            <Link
              key={puzzle.id}
              className="dash-card trilha-card"
              to={buildWordSearchPath(puzzle.id)}
            >
              <p className="eyebrow">{puzzle.referencia}</p>
              <h2>{puzzle.titulo}</h2>
              <p className="trilha-card-description">{puzzle.dica}</p>
              <p className="caca-palavras-contagem">
                {puzzle.palavras.length} palavras
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
