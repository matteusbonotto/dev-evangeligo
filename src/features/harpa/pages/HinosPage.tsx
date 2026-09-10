import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMusic } from "react-icons/fi";
import "../harpa.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { listarHinos, type HinoResumo } from "../dataLoader";
import { buildHinoPath } from "../routePaths";
import { AppShell } from "../../../shared/components/AppShell";

type CarregamentoStatus = "carregando" | "pronto" | "erro";

/** Lista dos hinos da Harpa Cristã, com filtro por título (T-012, RF-10). */
export function HinosPage() {
  const [status, setStatus] = useState<CarregamentoStatus>("carregando");
  const [hinos, setHinos] = useState<HinoResumo[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;
    listarHinos()
      .then((lista) => {
        if (ativo) {
          setHinos(lista);
          setStatus("pronto");
        }
      })
      .catch(() => {
        if (ativo) setStatus("erro");
      });
    return () => {
      ativo = false;
    };
  }, []);

  const hinosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return hinos;
    return hinos.filter(
      (hino) =>
        hino.titulo.toLowerCase().includes(termo) ||
        String(hino.numero).includes(termo),
    );
  }, [hinos, busca]);

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.bible}>
          <FiArrowLeft aria-hidden="true" /> Bíblia
        </Link>

        <section className="dash-card" aria-labelledby="harpa-title">
          <p className="eyebrow">
            <FiMusic aria-hidden="true" /> Harpa Cristã
          </p>
          <h1 id="harpa-title">Hinário</h1>
          <p className="biblia-fonte-aviso">
            Conteúdo em fase de validação de licença antes de qualquer
            lançamento público (ver Termos de Uso).
          </p>

          <input
            className="harpa-busca"
            type="search"
            placeholder="Buscar por número ou título..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            aria-label="Buscar hino por número ou título"
          />

          {status === "carregando" && (
            <p className="biblia-status">Carregando hinos...</p>
          )}
          {status === "erro" && (
            <p className="biblia-status biblia-status--erro">
              Não foi possível carregar a Harpa Cristã. Tente novamente.
            </p>
          )}
          {status === "pronto" && (
            <ul className="harpa-hino-lista">
              {hinosFiltrados.map((hino) => (
                <li key={hino.numero} className="harpa-hino-item">
                  <Link to={buildHinoPath(hino.numero)}>
                    {hino.numero} — {hino.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
