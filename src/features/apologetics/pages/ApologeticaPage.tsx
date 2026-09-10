import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
  FiSearch,
  FiShield,
} from "react-icons/fi";
import "../apologetics.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import {
  CATEGORIAS_APOLOGETICA,
  DICAS_ESTUDO,
  PERGUNTAS_APOLOGETICA,
  getCategoriaById,
} from "../content";
import {
  DIFICULDADES_APOLOGETICA,
  DIFICULDADE_LABEL,
  filtrarPerguntasApologetica,
  type FiltroDificuldade,
} from "../filtro";
import { marcarPerguntaEstudada, obterPerguntasEstudadas } from "../progresso";

/**
 * Apologética (T-0XX) — FAQ de perguntas difíceis de fé, por nível de
 * dificuldade (pedido explícito do usuário: "sinto falta de uma lista
 * estilo perguntas frequentes por nível de dificuldade, que responde e
 * explica perguntas difíceis... como por que o mal existe e afins").
 *
 * Porta 1:1 o conteúdo real do app legado (`dev-pwa-biblia-game/public/
 * game/assets/js/dados/apologetica.js`, 19 perguntas em 8 categorias — ver
 * `../content.ts`) e a interação de accordion "expande no lugar"
 * (`apolPerguntaAberta` do legado) — sem página separada por pergunta.
 * Diferença deliberada em relação ao legado: aqui a DIFICULDADE é o filtro
 * primário (pedido explícito do usuário), com categoria como filtro
 * secundário — no legado só havia filtro por categoria.
 */
export function ApologeticaPage() {
  const [dificuldade, setDificuldade] = useState<FiltroDificuldade>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [perguntaAberta, setPerguntaAberta] = useState<string | null>(null);
  const [estudadas, setEstudadas] = useState<Set<string>>(
    () => new Set(obterPerguntasEstudadas()),
  );

  const perguntasFiltradas = useMemo(
    () =>
      filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {
        dificuldade,
        categoriaId,
        busca,
      }),
    [dificuldade, categoriaId, busca],
  );

  function alternarPergunta(id: string) {
    if (perguntaAberta === id) {
      setPerguntaAberta(null);
      return;
    }
    setPerguntaAberta(id);
    if (!estudadas.has(id)) {
      marcarPerguntaEstudada(id);
      setEstudadas((atual) => new Set(atual).add(id));
    }
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Painel
        </Link>

        <section className="dash-card" aria-labelledby="apologetica-title">
          <p className="eyebrow">
            <FiShield aria-hidden="true" /> Defesa da Fé
          </p>
          <h1 id="apologetica-title">Apologética</h1>
          <p className="apol-intro">
            Perguntas difíceis sobre a fé cristã, respondidas com base
            bíblica — organizadas por nível de dificuldade, para estudar no
            seu ritmo.
          </p>

          <div className="apol-dicas-box">
            <p className="apol-dicas-header">
              <FiBookOpen aria-hidden="true" /> Dicas para estudar
            </p>
            <ul className="apol-dicas-lista">
              {DICAS_ESTUDO.map((dica) => (
                <li key={dica}>{dica}</li>
              ))}
            </ul>
          </div>

          <div className="apol-busca-wrap">
            <FiSearch className="apol-busca-icone" aria-hidden="true" />
            <input
              type="text"
              className="apol-busca-input"
              placeholder="Buscar perguntas ou respostas..."
              value={busca}
              onChange={(evento) => {
                setBusca(evento.target.value);
                setPerguntaAberta(null);
              }}
              aria-label="Buscar perguntas ou respostas"
            />
          </div>

          <div className="apol-filtro-grupo">
            <span className="apol-filtro-titulo" id="apol-filtro-dificuldade">
              Nível de dificuldade
            </span>
            <div
              className="apol-filtros"
              role="group"
              aria-labelledby="apol-filtro-dificuldade"
            >
              <button
                type="button"
                className={`apol-filtro${dificuldade === null ? " apol-filtro--ativo" : ""}`}
                onClick={() => {
                  setDificuldade(null);
                  setPerguntaAberta(null);
                }}
              >
                Todas
              </button>
              {DIFICULDADES_APOLOGETICA.map((nivel) => (
                <button
                  key={nivel}
                  type="button"
                  className={`apol-filtro${dificuldade === nivel ? " apol-filtro--ativo" : ""}`}
                  onClick={() => {
                    setDificuldade((atual) => (atual === nivel ? null : nivel));
                    setPerguntaAberta(null);
                  }}
                >
                  {DIFICULDADE_LABEL[nivel]}
                </button>
              ))}
            </div>
          </div>

          <div className="apol-filtro-grupo">
            <span className="apol-filtro-titulo" id="apol-filtro-categoria">
              Categoria
            </span>
            <div
              className="apol-filtros"
              role="group"
              aria-labelledby="apol-filtro-categoria"
            >
              <button
                type="button"
                className={`apol-filtro${categoriaId === null ? " apol-filtro--ativo" : ""}`}
                onClick={() => {
                  setCategoriaId(null);
                  setPerguntaAberta(null);
                }}
              >
                Todas
              </button>
              {CATEGORIAS_APOLOGETICA.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  className={`apol-filtro${categoriaId === categoria.id ? " apol-filtro--ativo" : ""}`}
                  onClick={() => {
                    setCategoriaId((atual) =>
                      atual === categoria.id ? null : categoria.id,
                    );
                    setPerguntaAberta(null);
                  }}
                >
                  {categoria.nome}
                </button>
              ))}
            </div>
          </div>

          <p className="apol-resultado-contagem">
            {perguntasFiltradas.length}{" "}
            {perguntasFiltradas.length === 1 ? "pergunta" : "perguntas"}
          </p>
        </section>

        <div className="apol-lista">
          {perguntasFiltradas.map((pergunta) => {
            const aberta = perguntaAberta === pergunta.id;
            const categoria = getCategoriaById(pergunta.categoria);
            const estudada = estudadas.has(pergunta.id);
            const headerId = `apol-header-${pergunta.id}`;
            const painelId = `apol-painel-${pergunta.id}`;

            return (
              <div
                key={pergunta.id}
                className={`apol-card${aberta ? " apol-card--aberta" : ""}`}
              >
                <h3 className="apol-card-titulo-wrap">
                  <button
                    type="button"
                    id={headerId}
                    className="apol-card-header"
                    aria-expanded={aberta}
                    aria-controls={painelId}
                    onClick={() => alternarPergunta(pergunta.id)}
                  >
                    <span className="apol-card-header-esquerda">
                      <FiHelpCircle
                        className="apol-card-icone"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="apol-card-titulo">
                          {pergunta.pergunta}
                        </span>
                        <span className="apol-card-meta">
                          {categoria && (
                            <span className="apol-card-categoria">
                              {categoria.nome}
                            </span>
                          )}
                          <span
                            className={`apol-badge-dificuldade apol-badge-dificuldade--${pergunta.dificuldade}`}
                          >
                            {DIFICULDADE_LABEL[pergunta.dificuldade]}
                          </span>
                          {estudada && (
                            <FiCheckCircle
                              className="apol-badge-estudada"
                              aria-label="Já estudada"
                            />
                          )}
                        </span>
                      </span>
                    </span>
                    {aberta ? (
                      <FiChevronUp className="apol-chevron" aria-hidden="true" />
                    ) : (
                      <FiChevronDown
                        className="apol-chevron"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </h3>

                {aberta && (
                  <div
                    id={painelId}
                    role="region"
                    aria-labelledby={headerId}
                    className="apol-card-conteudo"
                  >
                    <div className="apol-resposta">
                      <p className="apol-resposta-texto">{pergunta.resposta}</p>
                    </div>

                    <div className="apol-secao">
                      <p className="apol-secao-titulo">
                        <FiBookOpen aria-hidden="true" /> Referências bíblicas
                      </p>
                      <ul className="apol-referencias-lista">
                        {pergunta.referencias.map((referencia) => (
                          <li
                            key={referencia.display}
                            className="apol-referencia-item"
                          >
                            {referencia.display}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="apol-secao">
                      <p className="apol-secao-titulo">
                        Pontos-chave para lembrar
                      </p>
                      <ul className="apol-pontos-lista">
                        {pergunta.pontosChave.map((ponto) => (
                          <li key={ponto}>{ponto}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {perguntasFiltradas.length === 0 && (
            <div className="apol-vazio">
              <FiSearch className="apol-vazio-icone" aria-hidden="true" />
              <p>Nenhuma pergunta encontrada.</p>
              <p>Tente buscar com outras palavras.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
