import { useEffect, useState } from "react";
import { BsTranslate, BsXLg } from "react-icons/bs";
import {
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
 * Limitação técnica real, mostrada na própria UI (não escondida):
 * `obterPalavrasOriginais` retorna as palavras do VERSÍCULO INTEIRO — não há
 * como mapear com certeza qual palavra do hebraico/grego corresponde
 * caractere-a-caractere ao trecho exato selecionado em português (a ordem e
 * a quantidade de palavras nunca são as mesmas entre os idiomas). O balão
 * mostra todas as palavras originais do versículo que contém a seleção.
 */
export interface BalaoTextoOriginalProps {
  livro: Livro;
  capitulo: number;
  numero: number;
  modoSheet: boolean;
  x: number;
  y: number;
  onFechar: () => void;
}

export function BalaoTextoOriginal({
  livro,
  capitulo,
  numero,
  modoSheet,
  x,
  y,
  onFechar,
}: BalaoTextoOriginalProps) {
  const [palavras, setPalavras] = useState<PalavraOriginal[] | null>(null);

  useEffect(() => {
    let ativo = true;
    setPalavras(null);
    obterPalavrasOriginais(livro, capitulo, numero).then((resultado) => {
      if (ativo) setPalavras(resultado);
    });
    return () => {
      ativo = false;
    };
  }, [livro, capitulo, numero]);

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
        className={`bctx-container balao-original ${modoSheet ? "bctx-sheet" : "bctx-popup"}`}
        role="dialog"
        aria-label={`Texto original de ${livro.nome} ${capitulo}:${numero}`}
        style={posicao}
        onClick={(event) => event.stopPropagation()}
      >
        {modoSheet && <div className="bctx-handle" />}

        <p className="bctx-section-label">
          <BsTranslate aria-hidden="true" /> Texto original — {livro.nome}{" "}
          {capitulo}:{numero}
        </p>
        <p className="balao-original-aviso">
          Palavras do versículo inteiro no idioma original — a correspondência
          exata com o trecho selecionado nem sempre é possível palavra por
          palavra.
        </p>
        <PainelSignificadoOriginal palavras={palavras} />

        <button type="button" className="bctx-btn-fechar" onClick={onFechar}>
          <BsXLg aria-hidden="true" /> Fechar
        </button>
      </div>
    </div>
  );
}
