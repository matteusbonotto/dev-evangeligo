import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../harpa.css";
import { getHino } from "../dataLoader";
import { buildHinoPath, HARPA_ROUTE_PATHS } from "../routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import type { Hino } from "../types";

type CarregamentoStatus = "carregando" | "pronto" | "nao-encontrado" | "erro";

/**
 * Letra de um hino: coro intercalado entre as estrofes, no padrão
 * tradicional de hinário (T-012, RF-10).
 */
export function HinoPage() {
  const { numero: numeroParam } = useParams<{ numero: string }>();
  const numero = numeroParam ? Number(numeroParam) : NaN;

  const [status, setStatus] = useState<CarregamentoStatus>("carregando");
  const [hino, setHino] = useState<Hino | null>(null);

  useEffect(() => {
    if (!Number.isInteger(numero)) return;
    let ativo = true;
    setStatus("carregando");
    getHino(numero)
      .then((resultado) => {
        if (!ativo) return;
        if (resultado) {
          setHino(resultado);
          setStatus("pronto");
        } else {
          setStatus("nao-encontrado");
        }
      })
      .catch(() => {
        if (ativo) setStatus("erro");
      });
    return () => {
      ativo = false;
    };
  }, [numero]);

  if (!Number.isInteger(numero)) {
    return <Navigate to={HARPA_ROUTE_PATHS.hinos} replace />;
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={HARPA_ROUTE_PATHS.hinos}>
          <FiArrowLeft aria-hidden="true" /> Hinário
        </Link>

        <article className="dash-card" aria-labelledby="hino-title">
          {status === "carregando" && (
            <p className="biblia-status">Carregando hino...</p>
          )}
          {status === "erro" && (
            <p className="biblia-status biblia-status--erro">
              Não foi possível carregar este hino. Tente novamente.
            </p>
          )}
          {status === "nao-encontrado" && (
            <Navigate to={HARPA_ROUTE_PATHS.hinos} replace />
          )}

          {status === "pronto" && hino && (
            <>
              <p className="eyebrow">Hino {hino.numero}</p>
              <h1 id="hino-title">{hino.titulo}</h1>

              {hino.estrofes.map((estrofe) => (
                <div key={estrofe.numero}>
                  <p className="harpa-estrofe">
                    <span className="harpa-estrofe-label">
                      Estrofe {estrofe.numero}
                    </span>
                    {estrofe.linhas.join("\n")}
                  </p>
                  {hino.coro && (
                    <p className="harpa-estrofe harpa-coro">
                      <span className="harpa-estrofe-label">Coro</span>
                      {hino.coro.join("\n")}
                    </p>
                  )}
                </div>
              ))}

              <nav className="biblia-nav" aria-label="Navegação de hinos">
                {hino.numero > 1 ? (
                  <Link
                    className="secondary-button"
                    to={buildHinoPath(hino.numero - 1)}
                  >
                    <FiChevronLeft aria-hidden="true" /> Hino anterior
                  </Link>
                ) : (
                  <span />
                )}
                <Link
                  className="primary-button"
                  to={buildHinoPath(hino.numero + 1)}
                >
                  Próximo hino <FiChevronRight aria-hidden="true" />
                </Link>
              </nav>
            </>
          )}
        </article>
      </div>
    </AppShell>
  );
}
