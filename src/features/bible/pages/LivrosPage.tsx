import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiBook, FiMusic } from "react-icons/fi";
import "../bible.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import {
  FILTROS_LIVROS,
  LIVROS_BIBLIA,
  getLivrosFiltrados,
} from "../data/livros";
import { buildCapitulosPath } from "../routePaths";
import { contarLivrosIniciados, obterProgressoLivro } from "../progresso";
import { AppShell } from "../../../shared/components/AppShell";
import type { FiltroLivros } from "../types";

/**
 * Lista dos 66 livros da Bíblia com progresso de leitura por livro (T-011,
 * RF-09) — redesenhada a partir do app legado (`dev-pwa-biblia-game`),
 * pedido explícito do usuário. Inclui filtros por testamento, grupo
 * temático e ordem cronológica ("filtros por tipos").
 */
export function LivrosPage() {
  const [filtro, setFiltro] = useState<FiltroLivros>("canonico");

  const todasOrdens = useMemo(() => LIVROS_BIBLIA.map((l) => l.order), []);
  const livrosIniciados = contarLivrosIniciados(todasOrdens);
  const livrosFiltrados = getLivrosFiltrados(filtro);

  return (
    <AppShell>
      <div className="dashboard biblia-page">
        <section className="dash-card" aria-labelledby="biblia-title">
          <p className="eyebrow">
            <FiBook aria-hidden="true" /> Leitura da Bíblia
          </p>
          <h1 id="biblia-title">Almeida Atualizada</h1>
          <p className="biblia-fonte-aviso">
            Texto de domínio público sob revisão de licença — conteúdo em fase
            de validação antes de qualquer lançamento público (ver Termos de
            Uso).
          </p>

          <div
            className="biblia-filtros"
            role="group"
            aria-label="Filtrar por testamento, grupo ou ordem"
          >
            {FILTROS_LIVROS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`biblia-filtro${filtro === f.id ? " biblia-filtro--ativo" : ""}`}
                onClick={() => setFiltro(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="biblia-progresso-geral">
            <span>{livrosIniciados}/66 livros</span>
            <div className="biblia-progresso-track">
              <div
                className="biblia-progresso-fill"
                style={{
                  width: `${Math.round((livrosIniciados / 66) * 100)}%`,
                }}
              />
            </div>
          </div>
        </section>

        <div className="biblia-livro-grid">
          {livrosFiltrados.map((livro) => {
            const percentual = obterProgressoLivro(
              livro.order,
              livro.totalCapitulos,
            );
            return (
              <Link
                key={livro.codigo}
                className="biblia-livro-card"
                to={buildCapitulosPath(livro.codigo)}
              >
                <span className="biblia-livro-nome">{livro.nome}</span>
                <span
                  className={`biblia-livro-percentual${percentual > 0 ? " biblia-livro-percentual--lido" : ""}`}
                >
                  {percentual}%
                </span>
              </Link>
            );
          })}

          {/* Harpa Cristã vive dentro da Bíblia (pedido do usuário): aparece
              logo depois de Apocalipse na lista completa, e sozinha quando o
              filtro "Harpa Cristã" está ativo — não é um Livro de verdade
              (sem capítulos/testamento), por isso o cartão é escrito à mão
              aqui em vez de vir de getLivrosFiltrados. */}
          {(filtro === "canonico" || filtro === "harpa") && (
            <Link className="biblia-livro-card" to={ROUTE_PATHS.harpa}>
              <span className="biblia-livro-nome">
                <FiMusic aria-hidden="true" /> Harpa Cristã
              </span>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
