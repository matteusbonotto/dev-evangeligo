import type { CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "../bible.css";
import { getLivroByCodigo } from "../data/livros";
import { buildLeituraPath } from "../routePaths";
import { obterProgressoCapitulo, obterProgressoLivro } from "../progresso";
import { AppShell } from "../../../shared/components/AppShell";
import { ROUTE_PATHS } from "../../../app/routePaths";

/** Grade de capítulos de um livro, em círculos ao estilo do app legado (T-011). */
export function CapitulosPage() {
  const { livroCodigo } = useParams<{ livroCodigo: string }>();
  const livro = livroCodigo ? getLivroByCodigo(livroCodigo) : undefined;

  if (!livro) {
    return <Navigate to={ROUTE_PATHS.bible} replace />;
  }

  const percentualLivro = obterProgressoLivro(
    livro.order,
    livro.totalCapitulos,
  );

  return (
    <AppShell>
      <div className="dashboard biblia-page">
        <Link className="back-link" to={ROUTE_PATHS.bible}>
          <FiArrowLeft aria-hidden="true" /> Livros
        </Link>

        <section className="dash-card" aria-labelledby="capitulos-title">
          <p className="eyebrow">
            {livro.testamento === "AT"
              ? "Antigo Testamento"
              : "Novo Testamento"}
          </p>
          <h1 id="capitulos-title">{livro.nome}</h1>
          <p className="biblia-capitulos-resumo">
            {livro.totalCapitulos} capítulos · {percentualLivro}% lido
          </p>
          <div className="biblia-progresso-track">
            <div
              className="biblia-progresso-fill"
              style={{ width: `${percentualLivro}%` }}
            />
          </div>

          <div className="biblia-capitulo-grid">
            {Array.from(
              { length: livro.totalCapitulos },
              (_, index) => index + 1,
            ).map((capitulo) => {
              const percentualCapitulo = obterProgressoCapitulo(
                livro.order,
                capitulo,
              );
              const concluido = percentualCapitulo >= 95;
              return (
                <Link
                  key={capitulo}
                  className={`biblia-capitulo-btn${concluido ? " biblia-capitulo-btn--lido" : percentualCapitulo > 0 ? " biblia-capitulo-btn--parcial" : ""}`}
                  style={
                    percentualCapitulo > 0 && !concluido
                      ? ({
                          "--progresso-capitulo": `${percentualCapitulo}%`,
                        } as CSSProperties)
                      : undefined
                  }
                  to={buildLeituraPath(livro.codigo, capitulo)}
                >
                  {capitulo}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
