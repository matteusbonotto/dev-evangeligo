import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiClock,
  FiGrid,
  FiSun,
  FiType,
} from "react-icons/fi";
import { getLivroByOrder } from "../../bible/data/livros";
import { buildLeituraPath } from "../../bible/routePaths";
import { obterCapituloTraduzido } from "../../bible/traducoes";
import { obterTraducaoPreferida } from "../../bible/traducaoPreferida";
import { useAuth } from "../../authentication/context/AuthContext";
import { buildTermoPath } from "../../study/termo/routePaths";
import { buildQuebraCabecaPath } from "../../study/quebracabeca/routePaths";
import { buildWordSearchPath } from "../../study/wordsearch/routePaths";
import {
  obterChaveDoDia,
  obterCacaPalavrasDoDia,
  obterLeituraDoDia,
  obterQuebraCabecaDoDia,
  obterTermoDoDia,
  obterVersiculoDoDia,
} from "../desafios";
import { carregarEstadoDiario } from "../persistencia";
import { marcarDestaquePassivoVisto } from "../recompensa";
import { useContagemRegressiva } from "../useContagemRegressiva";
import "../daily.css";

const RECOMPENSA_CHECKIN = { xp: 5, gold: 2 };

/**
 * "Destaques de hoje" (Home) — pedido do usuário: versículo/termo/quebra-
 * cabeça/leitura do dia, trocando a cada 24h com um cronômetro visível até
 * a próxima troca, "uma forma de incentivar o usuário" a voltar todo dia
 * (mesmo espírito do "desafio diário" de apps de hábito/gamificação).
 * Escolha do dia é determinística (`desafios.ts`) — sem sorteio a cada
 * render, e sem depender de backend (localStorage, mesma fase do resto do
 * app). Sem equivalente direto no legado — ver ADR.
 */
export function DestaquesDoDia() {
  const { user, updateUser } = useAuth();
  const contagem = useContagemRegressiva();
  const chave = useMemo(() => obterChaveDoDia(), []);
  const versiculo = useMemo(() => obterVersiculoDoDia(chave), [chave]);
  const termo = useMemo(() => obterTermoDoDia(chave), [chave]);
  const quebra = useMemo(() => obterQuebraCabecaDoDia(chave), [chave]);
  const cacaPalavras = useMemo(() => obterCacaPalavrasDoDia(chave), [chave]);
  const leitura = useMemo(() => obterLeituraDoDia(chave), [chave]);
  const [estado, setEstado] = useState(() => carregarEstadoDiario(chave));
  const [textoVersiculo, setTextoVersiculo] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    const livro = getLivroByOrder(versiculo.livroOrder);
    if (!livro) {
      setTextoVersiculo(null);
      return;
    }
    obterCapituloTraduzido(livro, versiculo.capitulo, obterTraducaoPreferida())
      .then((versiculos) => {
        if (ativo) setTextoVersiculo(versiculos[versiculo.versiculo - 1] ?? null);
      })
      .catch(() => {
        if (ativo) setTextoVersiculo(null);
      });
    return () => {
      ativo = false;
    };
  }, [versiculo]);

  if (!user) return null;

  function handleVerVersiculo() {
    if (estado.concluidos.versiculo) return;
    updateUser((atual) =>
      marcarDestaquePassivoVisto(atual, "versiculo", RECOMPENSA_CHECKIN),
    );
    setEstado(carregarEstadoDiario(chave));
  }

  function handleAbrirLeitura() {
    if (estado.concluidos.leitura) return;
    updateUser((atual) =>
      marcarDestaquePassivoVisto(atual, "leitura", RECOMPENSA_CHECKIN),
    );
    setEstado(carregarEstadoDiario(chave));
  }

  return (
    <section className="dash-card destaques-dia" aria-labelledby="destaques-title">
      <div className="destaques-cabecalho">
        <p className="eyebrow" id="destaques-title">
          <FiSun aria-hidden="true" /> Destaques de hoje
        </p>
        <span
          className="destaques-contagem"
          title="Tempo até os destaques de hoje renovarem"
        >
          <FiClock aria-hidden="true" /> {contagem}
        </span>
      </div>

      <div className="destaques-grade">
        <div
          className={`destaque-card${estado.concluidos.versiculo ? " destaque-card--feito" : ""}`}
        >
          <p className="destaque-card-titulo">
            <FiBookOpen aria-hidden="true" /> Versículo do dia
          </p>
          <p className="destaque-card-referencia">{versiculo.referencia}</p>
          {textoVersiculo && (
            <p className="destaque-card-texto">&ldquo;{textoVersiculo}&rdquo;</p>
          )}
          <Link
            className="destaque-card-link"
            to={buildLeituraPath(versiculo.codigo, versiculo.capitulo)}
            onClick={handleVerVersiculo}
          >
            {estado.concluidos.versiculo ? "Concluído ✓" : "Ler o capítulo"}
          </Link>
        </div>

        <Link
          className={`destaque-card destaque-card--acao${estado.concluidos.leitura ? " destaque-card--feito" : ""}`}
          to={buildLeituraPath(leitura.codigo, leitura.capitulo)}
          onClick={handleAbrirLeitura}
        >
          <p className="destaque-card-titulo">
            <FiBookOpen aria-hidden="true" /> Leitura do dia
          </p>
          <p className="destaque-card-referencia">
            {leitura.nome} {leitura.capitulo}
          </p>
          <span className="destaque-card-link">
            {estado.concluidos.leitura ? "Concluído ✓" : "Ler agora"}
          </span>
        </Link>

        <Link
          className={`destaque-card destaque-card--acao${estado.concluidos.termo ? " destaque-card--feito" : ""}`}
          to={buildTermoPath(termo.id)}
        >
          <p className="destaque-card-titulo">
            <FiType aria-hidden="true" /> Termo do dia
          </p>
          <p className="destaque-card-referencia">{termo.referencia}</p>
          <span className="destaque-card-link">
            {estado.concluidos.termo ? "Concluído ✓" : "Jogar"}
          </span>
        </Link>

        <Link
          className={`destaque-card destaque-card--acao${estado.concluidos.quebra ? " destaque-card--feito" : ""}`}
          to={buildQuebraCabecaPath(quebra.id)}
        >
          <p className="destaque-card-titulo">
            <FiGrid aria-hidden="true" /> Quebra-cabeça do dia
          </p>
          <span className="destaque-card-link">
            {estado.concluidos.quebra ? "Concluído ✓" : "Jogar"}
          </span>
        </Link>

        <Link
          className={`destaque-card destaque-card--acao${estado.concluidos.cacaPalavras ? " destaque-card--feito" : ""}`}
          to={buildWordSearchPath(cacaPalavras.id)}
        >
          <p className="destaque-card-titulo">
            <FiGrid aria-hidden="true" /> Caça-palavras do dia
          </p>
          <p className="destaque-card-referencia">{cacaPalavras.titulo}</p>
          <span className="destaque-card-link">
            {estado.concluidos.cacaPalavras ? "Concluído ✓" : "Jogar"}
          </span>
        </Link>
      </div>
    </section>
  );
}
