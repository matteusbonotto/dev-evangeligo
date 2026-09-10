import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckCircle } from "react-icons/fi";
import "../study.css";
import { getAulaById, getAulasByTrilha, getTrilhaBySlug } from "../content";
import { buildAulaPath, buildQuizPath, buildTrilhaPath } from "../routePaths";
import { AppShell } from "../../../shared/components/AppShell";

/**
 * Detalhe de uma aula (RF-08): resumo doutrinário, referências bíblicas e
 * um slot reservado para o quiz da aula (motor de quiz construído em
 * T-008 — aqui só exibimos se `aula.quizId` já está associado). Página
 * autônoma desta feature — ainda não registrada em
 * `src/app/AppRouter.tsx` (ver `../routePaths.ts`).
 */
export function AulaPage() {
  const { trilhaSlug, aulaId } = useParams<{
    trilhaSlug: string;
    aulaId: string;
  }>();

  const trilha = trilhaSlug ? getTrilhaBySlug(trilhaSlug) : undefined;
  const aula = aulaId ? getAulaById(aulaId) : undefined;

  if (!trilha || !aula || aula.trilhaId !== trilha.id) {
    return <Navigate to="/trilhas" replace />;
  }

  const aulasDaTrilha = getAulasByTrilha(trilha.id);
  const indiceAtual = aulasDaTrilha.findIndex((item) => item.id === aula.id);
  const proxima = aulasDaTrilha[indiceAtual + 1];

  return (
    <AppShell>
      <div className="dashboard aula-page">
        <Link className="back-link" to={buildTrilhaPath(trilha.slug)}>
          <FiArrowLeft aria-hidden="true" /> {trilha.title}
        </Link>

        <article
          className="dash-card aula-content"
          aria-labelledby="aula-title"
        >
          <p className="eyebrow">
            Aula {aula.order} de {aulasDaTrilha.length} ·{" "}
            {aula.estimatedMinutes} min
          </p>
          <h1 id="aula-title">{aula.title}</h1>
          <p className="aula-summary">{aula.summary}</p>

          <section aria-labelledby="aula-refs-title">
            <p className="eyebrow" id="aula-refs-title">
              <FiBookOpen aria-hidden="true" /> Referências bíblicas
            </p>
            <ul className="aula-ref-list">
              {aula.bibleReferences.map((ref) => (
                <li key={ref.display} className="aula-ref-chip">
                  {ref.display}
                </li>
              ))}
            </ul>
          </section>

          {aula.quizId ? (
            <Link
              className="aula-quiz-slot aula-quiz-slot--available"
              to={buildQuizPath(trilha.slug, aula.id)}
            >
              <FiCheckCircle aria-hidden="true" />
              <p>Fazer o quiz desta aula</p>
            </Link>
          ) : (
            <div className="aula-quiz-slot">
              <FiCheckCircle aria-hidden="true" />
              <p>O quiz desta aula ainda não está disponível.</p>
            </div>
          )}

          {proxima && (
            <Link
              className="primary-button"
              to={buildAulaPath(trilha.slug, proxima.id)}
            >
              Próxima aula: {proxima.title}
            </Link>
          )}
        </article>
      </div>
    </AppShell>
  );
}
