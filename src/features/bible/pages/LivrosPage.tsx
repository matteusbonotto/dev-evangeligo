import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronDown,
  FiMusic,
  FiSearch,
} from "react-icons/fi";
import "../bible.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import {
  FILTROS_LIVROS,
  LIVROS_BIBLIA,
  getLivroByCodigo,
  getLivrosFiltrados,
} from "../data/livros";
import { obterAbreviacaoLivro } from "../data/abreviacoesLivros";
import { CATEGORIAS_LIVRO } from "../data/categoriasLivro";
import { getCapituloVersiculos } from "../dataLoader";
import { buildCapitulosPath, buildLeituraPath } from "../routePaths";
import { contarLivrosIniciados, obterProgressoLivro } from "../progresso";
import { AppShell } from "../../../shared/components/AppShell";
import type { FiltroLivros } from "../types";

/**
 * Lista dos 66 livros da Bíblia com progresso de leitura por livro (T-011,
 * RF-09) — redesenhada a partir do app legado (`dev-pwa-biblia-game`),
 * pedido explícito do usuário. Inclui filtros por testamento, grupo
 * temático e ordem cronológica ("filtros por tipos").
 */
/** Remove acentos pra comparar nomes sem exigir digitar exatamente igual (ex. "genesis" acha "Gênesis"). */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function LivrosPage() {
  const [filtro, setFiltro] = useState<FiltroLivros>("canonico");
  const [buscaNome, setBuscaNome] = useState("");

  const todasOrdens = useMemo(() => LIVROS_BIBLIA.map((l) => l.order), []);
  const livrosIniciados = contarLivrosIniciados(todasOrdens);
  const livrosDoFiltro = getLivrosFiltrados(filtro);
  const buscaNormalizada = normalizar(buscaNome.trim());
  const livrosFiltrados = buscaNormalizada
    ? livrosDoFiltro.filter((livro) =>
        normalizar(livro.nome).includes(buscaNormalizada),
      )
    : livrosDoFiltro;

  return (
    <AppShell>
      <div className="dashboard biblia-page">
        <section className="dash-card" aria-labelledby="biblia-title">
          {/* Pedido do usuário: remover o nome da tradução ativa ("Almeida
              Imprensa Bíblica" etc.) e o aviso de licença deste topo — só
              busca e filtros ficam visíveis aqui. H1 continua existindo,
              só que invisível (`sr-only`), pra não perder a heading da
              página por acessibilidade. */}
          <h1 id="biblia-title" className="sr-only">
            Bíblia
          </h1>

          <BuscaVersiculo />

          <div className="biblia-busca-nome">
            <FiSearch className="biblia-busca-icone" aria-hidden="true" />
            <input
              type="search"
              className="biblia-busca-nome-input"
              placeholder="Filtrar livros pelo nome…"
              aria-label="Filtrar livros pelo nome"
              value={buscaNome}
              onChange={(event) => setBuscaNome(event.target.value)}
            />
          </div>

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

        {livrosFiltrados.length === 0 && (
          <p className="biblia-busca-nome-vazio">
            Nenhum livro encontrado para "{buscaNome.trim()}".
          </p>
        )}

        <div className="biblia-livro-grid">
          {livrosFiltrados.map((livro) => {
            const percentual = obterProgressoLivro(
              livro.order,
              livro.totalCapitulos,
            );
            const categoria = CATEGORIAS_LIVRO[livro.grupo];
            const CategoriaIcone = categoria.icone;
            const concluido = percentual >= 95;
            // Mesmo efeito de preenchimento (conic-gradient) já usado nos
            // círculos de capítulo — pedido explícito do usuário: "quero
            // que o efeito de preenchimento dos capítulos seja aplicado
            // nos livros também" (T-069).
            const classeProgresso = concluido
              ? " biblia-livro-card--lido"
              : percentual > 0
                ? " biblia-livro-card--parcial"
                : "";
            return (
              <Link
                key={livro.codigo}
                className={`biblia-livro-card biblia-livro-card--${livro.testamento === "AT" ? "at" : "nt"}${classeProgresso}`}
                style={
                  percentual > 0 && !concluido
                    ? ({ "--progresso-livro": `${percentual}%` } as CSSProperties)
                    : undefined
                }
                to={buildCapitulosPath(livro.codigo)}
              >
                <span
                  className="biblia-livro-categoria"
                  title={categoria.rotulo}
                  aria-label={categoria.rotulo}
                >
                  <CategoriaIcone aria-hidden="true" />
                </span>
                <span className="biblia-livro-nome">{livro.nome}</span>
                <span
                  className={`biblia-livro-percentual${percentual > 0 ? " biblia-livro-percentual--lido" : ""}`}
                >
                  {percentual}%
                </span>
                <span
                  className={`biblia-livro-sigla biblia-livro-sigla--${livro.testamento === "AT" ? "at" : "nt"}`}
                  aria-hidden="true"
                >
                  {obterAbreviacaoLivro(livro.codigo)}
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
  const [aberto, setAberto] = useState(false);

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

  const resumo = !livro
    ? "Buscar versículo"
    : !capitulo
      ? livro.nome
      : !versiculo
        ? `${livro.nome} ${capitulo}`
        : `${livro.nome} ${capitulo}:${versiculo}`;

  return (
    <div
      className="biblia-busca-versiculo"
      data-aberto={aberto ? "true" : "false"}
    >
      {/* Cabeçalho em accordion — só existe visualmente no mobile
       * (`bible.css`, `@media (max-width: 639px)`); no desktop o corpo
       * abaixo já fica sempre visível, como antes (T-038). Pedido do
       * usuário: filtro ocupava espaço demais na tela pequena. */}
      <button
        type="button"
        className="biblia-busca-cabecalho"
        aria-expanded={aberto}
        aria-controls="biblia-busca-corpo"
        onClick={() => setAberto((atual) => !atual)}
      >
        <FiSearch className="biblia-busca-icone" aria-hidden="true" />
        <span className="biblia-busca-resumo">{resumo}</span>
        <FiChevronDown
          className="biblia-busca-chevron"
          aria-hidden="true"
        />
      </button>

      <div
        id="biblia-busca-corpo"
        className="biblia-busca-corpo"
        role="group"
        aria-label="Buscar um versículo específico"
      >
        <FiSearch className="biblia-busca-icone biblia-busca-icone--desktop" aria-hidden="true" />

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
    </div>
  );
}
