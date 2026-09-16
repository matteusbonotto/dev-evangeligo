import { useEffect, useMemo, useState } from "react";
import { BsTranslate, BsXLg } from "react-icons/bs";
import {
  calcularIntervaloDePalavras,
  filtrarPalavrasPelaSelecao,
  obterPalavrasOriginais,
  type PalavraOriginal,
} from "../linguaOriginal";
import { PainelSignificadoOriginal } from "./PainelSignificadoOriginal";
import type { Livro } from "../types";

/**
 * Balão "Ver texto original" (T-048/ADR-041) — pedido explícito do usuário:
 * ao selecionar um trecho e confirmar (menu "Marcar texto"), poder ver o
 * termo original e a tradução mais adequada num balão pequeno, sem precisar
 * abrir o painel completo de `PainelInfoVersiculo` (esse continua existindo,
 * aberto ao tocar o NÚMERO do versículo).
 *
 * `obterPalavrasOriginais` só consegue buscar as palavras do VERSÍCULO
 * INTEIRO (a API não segmenta por trecho) — mas mostrar TODAS elas pra
 * quem selecionou 1 palavra só era "muito mal implementado" (bug real
 * reportado, T-068): agora `filtrarPalavrasPelaSelecao` usa a POSIÇÃO
 * proporcional do trecho selecionado (por palavra, dentro do versículo em
 * português) pra recortar a MESMA posição na lista de palavras originais.
 * Continua sendo uma aproximação (tradução reordena a frase às vezes), por
 * isso o link "ver todas as palavras do versículo" continua disponível
 * como saída pra quando o recorte erra.
 */
export interface BalaoTextoOriginalProps {
  livro: Livro;
  capitulo: number;
  numero: number;
  /** Texto completo do versículo em português e o trecho exato selecionado dentro dele — usados só pra recortar proporcionalmente a lista de palavras originais (T-068). Sem isso, mostra o versículo inteiro (comportamento anterior). */
  textoVersiculo?: string;
  selecaoInicio?: number;
  selecaoFim?: number;
  modoSheet: boolean;
  x: number;
  y: number;
  onFechar: () => void;
}

export function BalaoTextoOriginal({
  livro,
  capitulo,
  numero,
  textoVersiculo,
  selecaoInicio,
  selecaoFim,
  modoSheet,
  x,
  y,
  onFechar,
}: BalaoTextoOriginalProps) {
  const [todasAsPalavras, setTodasAsPalavras] = useState<PalavraOriginal[] | null>(null);
  const [mostrarTudo, setMostrarTudo] = useState(false);

  useEffect(() => {
    let ativo = true;
    setTodasAsPalavras(null);
    setMostrarTudo(false);
    obterPalavrasOriginais(livro, capitulo, numero).then((resultado) => {
      if (ativo) setTodasAsPalavras(resultado);
    });
    return () => {
      ativo = false;
    };
  }, [livro, capitulo, numero]);

  const selecaoValida =
    textoVersiculo !== undefined && selecaoInicio !== undefined && selecaoFim !== undefined;

  const palavrasFiltradas = useMemo(() => {
    if (!todasAsPalavras || !selecaoValida) return todasAsPalavras;
    const intervalo = calcularIntervaloDePalavras(textoVersiculo, selecaoInicio, selecaoFim);
    return filtrarPalavrasPelaSelecao(todasAsPalavras, intervalo);
  }, [todasAsPalavras, selecaoValida, textoVersiculo, selecaoInicio, selecaoFim]);

  const houveRecorte =
    selecaoValida &&
    !!todasAsPalavras &&
    !!palavrasFiltradas &&
    palavrasFiltradas.length < todasAsPalavras.length;

  const palavras = mostrarTudo ? todasAsPalavras : palavrasFiltradas;

  const LARGURA_BALAO = 300;
  const MARGEM = 12;
  const posicao =
    !modoSheet && typeof window !== "undefined"
      ? (() => {
          const ALTURA_MINIMA = 160;
          const left = Math.min(
            Math.max(x, MARGEM),
            Math.max(MARGEM, window.innerWidth - LARGURA_BALAO - MARGEM),
          );
          const top = Math.max(
            MARGEM,
            Math.min(y, window.innerHeight - MARGEM - ALTURA_MINIMA),
          );
          return {
            left,
            top,
            maxHeight: `${window.innerHeight - top - MARGEM}px`,
          };
        })()
      : undefined;

  return (
    <div className="bctx-overlay" onClick={onFechar}>
      <div
        className={`bctx-container balao-original ${modoSheet ? "bctx-central" : "bctx-popup"}`}
        role="dialog"
        aria-label={`Texto original de ${livro.nome} ${capitulo}:${numero}`}
        style={posicao}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bctx-corpo-rolavel">
          <p className="bctx-section-label">
            <BsTranslate aria-hidden="true" /> Texto original — {livro.nome}{" "}
            {capitulo}:{numero}
          </p>
          <p className="balao-original-aviso">
            {mostrarTudo || !selecaoValida
              ? "Palavras do versículo inteiro no idioma original."
              : "Palavra(s) aproximada(s) do trecho selecionado — a tradução às vezes reordena a frase, então pode não ser exata."}
          </p>
          <PainelSignificadoOriginal palavras={palavras} />
          {houveRecorte && !mostrarTudo && (
            <button
              type="button"
              className="balao-original-ver-tudo"
              onClick={() => setMostrarTudo(true)}
            >
              Não é essa a palavra? Ver o versículo inteiro
            </button>
          )}
        </div>

        <button type="button" className="bctx-btn-fechar" onClick={onFechar}>
          <BsXLg aria-hidden="true" /> Fechar
        </button>
      </div>
    </div>
  );
}
