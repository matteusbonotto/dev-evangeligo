import { Link } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import "../study.css";
import { getAulasByTrilha, TRILHAS } from "../content";
import { buildAulaPath } from "../routePaths";
import { AppShell } from "../../../shared/components/AppShell";

/**
 * Lista as 5 trilhas de estudo (RF-07) com as aulas de cada uma (RF-08).
 */
export function TrilhasPage() {
  return (
    <AppShell>
      <div className="dashboard">
        <section
          className="dash-card trilhas-intro"
          aria-labelledby="trilhas-title"
        >
          <p className="eyebrow">
            <FiBookOpen aria-hidden="true" /> Estudo bíblico
          </p>
          <h1 id="trilhas-title">Trilhas de estudo</h1>
          <p className="trilha-card-description">
            Cinco trilhas de teologia reformada, do fundamento da Reforma à vida
            cristã prática. Escolha uma para começar.
          </p>
        </section>

        <div className="dash-grid">
          {TRILHAS.map((trilha) => {
            const aulas = getAulasByTrilha(trilha.id);
            return (
              <section
                key={trilha.id}
                className="dash-card trilha-card"
                aria-labelledby={`trilha-${trilha.id}-title`}
              >
                {trilha.verseFocus && (
                  <p className="eyebrow">{trilha.verseFocus.display}</p>
                )}
                <h2 id={`trilha-${trilha.id}-title`}>{trilha.title}</h2>
                <p className="trilha-card-description">{trilha.description}</p>

                <ul className="trilha-aula-list">
                  {aulas.map((aula) => (
                    <li key={aula.id} className="trilha-aula-item">
                      <Link to={buildAulaPath(trilha.slug, aula.id)}>
                        <span className="trilha-aula-order" aria-hidden="true">
                          {aula.order}
                        </span>
                        <span className="trilha-aula-item-title">
                          {aula.title}
                        </span>
                        <span className="trilha-aula-item-minutes">
                          {aula.estimatedMinutes} min
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
