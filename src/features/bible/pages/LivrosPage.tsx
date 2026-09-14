import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBook, FiMusic, FiSearch } from "react-icons/fi";
import "../bible.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import {
  FILTROS_LIVROS,
  LIVROS_BIBLIA,
  getLivroByCodigo,
  getLivrosFiltrados,
} from "../data/livros";
import { getCapituloVersiculos } from "../dataLoader";
import { buildCapitulosPath, buildLeituraPath } from "../routePaths";
import { contarLivrosIniciados, obterProgressoLivro } from "../progresso";
import { obterTraducaoPreferida } from "../traducaoPreferida";
import { TRADUCOES_BIBLIA } from "../versoes";
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
  const traducaoAtiva = useMemo(() => obterTraducaoPreferida(), []);
  const nomeTraducaoAtiva =
    TRADUCOES_BIBLIA.find((v) => v.valor === traducaoAtiva)?.nome ?? "Bíblia";

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
          <h1 id="biblia-title">{nomeTraducaoAtiva}</h1>
          <p className="biblia-fonte-aviso">
            Texto de domínio público sob revisão de licença — conteúdo em fase
            de validação antes de qualquer lançamento público (ver Termos de
            Uso).
          </p>

          <BuscaVersiculo />

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

/**
 * Busca por referência exata (livro/capítulo/versículo) — pedido explícito
 * do usuário: "crie um filtro extra para ver livro, capitulo e versiculo
 * para caso o usuario quiser ler um versiculo especifico" (T-038/ADR-033).
 * 3 selects em cascata (cada um reseta o(s) seguinte(s) ao mudar); a
 * contagem de versículos do capítulo escolhido vem do arquivo local
 * (`getCapituloVersiculos`, offline) — se falhar por qualquer motivo, cai
 * para um campo numérico livre em vez de travar a busca.
 */
function BuscaVersiculo() {
  const [livroCodigo, setLivroCodigo] = useState("");
  const [capitulo, setCapitulo] = useState<number | null>(null);
  const [versiculo, setVersiculo] = useState<number | null>(null);
  const [totalVersiculos, setTotalVersiculos] = useState<number | null>(null);
  const [erroContagem, setErroContagem] = useState(false);

  const livro = livroCodigo ? getLivroByCodigo(livroCodigo) : undefined;

  useEffect(() => {
    if (!livro || !capitulo) {
      setTotalVersiculos(null);
      setErroContagem(false);
      return;
    }
    let ativo = true;
    setTotalVersiculos(null);
    setErroContagem(false);
    getCapituloVersiculos(livro.order, capitulo)
      .then((lista) => {
        if (ativo) setTotalVersiculos(lista.length);
      })
      .catch(() => {
        if (ativo) setErroContagem(true);
      });
    return () => {
      ativo = false;
    };
  }, [livro, capitulo]);

  function handleLivroChange(codigo: string) {
    setLivroCodigo(codigo);
    setCapitulo(null);
    setVersiculo(null);
  }

  function handleCapituloChange(valor: string) {
    setCapitulo(valor ? Number(valor) : null);
    setVersiculo(null);
  }

  const destino =
    livro && capitulo && versiculo
      ? buildLeituraPath(livro.codigo, capitulo, versiculo)
      : null;

  return (
    <div
      className="biblia-busca-versiculo"
      role="group"
      aria-label="Buscar um versículo específico"
    >
      <FiSearch className="biblia-busca-icone" aria-hidden="true" />

      <select
        className="biblia-busca-select"
        aria-label="Livro"
        value={livroCodigo}
        onChange={(event) => handleLivroChange(event.target.value)}
      >
        <option value="">Livro</option>
        {LIVROS_BIBLIA.map((l) => (
          <option key={l.codigo} value={l.codigo}>
            {l.nome}
          </option>
        ))}
      </select>

      <select
        className="biblia-busca-select"
        aria-label="Capítulo"
        value={capitulo ?? ""}
        disabled={!livro}
        onChange={(event) => handleCapituloChange(event.target.value)}
      >
        <option value="">Cap.</option>
        {livro &&
          Array.from({ length: livro.totalCapitulos }, (_, i) => i + 1).map(
            (c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ),
          )}
      </select>

      {totalVersiculos !== null ? (
        <select
          className="biblia-busca-select"
          aria-label="Versículo"
          value={versiculo ?? ""}
          onChange={(event) =>
            setVersiculo(event.target.value ? Number(event.target.value) : null)
          }
        >
          <option value="">Vers.</option>
          {Array.from({ length: totalVersiculos }, (_, i) => i + 1).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="biblia-busca-select biblia-busca-input"
          type="number"
          min={1}
          inputMode="numeric"
          aria-label="Versículo"
          placeholder="Vers."
          disabled={!capitulo}
          value={versiculo ?? ""}
          onChange={(event) =>
            setVersiculo(event.target.value ? Number(event.target.value) : null)
          }
        />
      )}

      {erroContagem && capitulo && (
        <span className="biblia-busca-aviso">
          Não foi possível confirmar o total de versículos — digite o número.
        </span>
      )}

      {destino ? (
        <Link className="biblia-busca-ir" to={destino}>
          Ir <FiArrowRight aria-hidden="true" />
        </Link>
      ) : (
        <span
          className="biblia-busca-ir biblia-busca-ir--desabilitado"
          aria-disabled="true"
        >
          Ir <FiArrowRight aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
