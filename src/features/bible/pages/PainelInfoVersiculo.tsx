import { useEffect, useState } from "react";
import {
  BsBookHalf,
  BsChevronDown,
  BsChevronUp,
  BsGlobe2,
  BsTranslate,
  BsXLg,
} from "react-icons/bs";
import { obterBiografia, type Biografia } from "../data/biografias";
import { obterFalanteNomeado } from "../data/falasNomeadas";
import { obterFalante } from "../data/falasEspeciais";
import { obterInfoLivro } from "../data/autoresLivros";
import {
  obterResumoWikipedia,
  type ResumoBiografico,
} from "../biografiaExterna";
import {
  obterPalavrasOriginais,
  type PalavraOriginal,
} from "../linguaOriginal";
import { PainelSignificadoOriginal } from "../components/PainelSignificadoOriginal";
import type { Livro } from "../types";

/**
 * Painel "quem fala" + "significado original" (T-041/T-042/T-040, ADR-036/
 * ADR-035) — pedido explícito do usuário: "quero uma possibilidade de
 * identificar quem está falando na biblia... um icone de informações, com
 * detalhes do tipo, contexto, cultura, lingua original, escritor/falador,
 * e links para biografia" + "identificar o significado da lingua original
 * da palavra ou frase". Aberto ao tocar no NÚMERO do versículo em
 * `LeituraPage.tsx` (toque nas palavras continua abrindo a seleção de
 * marca-texto/nota, sem conflito). Reaproveita o padrão visual
 * `bctx-overlay`/`bctx-popup`/`bctx-sheet` já usado por
 * `MenuContextoBiblico` em vez de um 4º padrão de modal.
 *
 * Duas seções sempre visíveis (sem abas):
 * - "Quem fala": autor do livro (`data/autoresLivros.ts`, sempre
 *   disponível para qualquer versículo) + o falante específico daquele
 *   versículo quando coberto por `data/falasEspeciais.ts` (Jesus/Deus) ou
 *   `data/falasNomeadas.ts` (outras pessoas nomeadas, ex. Pedro, Paulo) —
 *   as duas coisas podem aparecer juntas (ex. 1 Coríntios 11:24: autor
 *   Paulo + falante Jesus, exatamente o exemplo do usuário "Paulo
 *   escreveu que Jesus falou"). Biografia expandida vem AO VIVO da
 *   Wikipédia em português (`biografiaExterna.ts`) — nunca escrita à mão
 *   aqui, pedido explícito do usuário por uma fonte externa validada.
 * - "Significado original": busca ao vivo em `bolls.life`
 *   (`linguaOriginal.ts`) as palavras em hebraico/grego do versículo, cada
 *   uma com transliteração e definição completa (léxico de Strong).
 */

export interface PainelInfoVersiculoProps {
  livro: Livro;
  capitulo: number;
  numero: number;
  modoSheet: boolean;
  x: number;
  y: number;
  onFechar: () => void;
}

export function PainelInfoVersiculo({
  livro,
  capitulo,
  numero,
  modoSheet,
  x,
  y,
  onFechar,
}: PainelInfoVersiculoProps) {
  const infoLivro = obterInfoLivro(livro.codigo);
  const falanteEspecial = obterFalante(livro.codigo, capitulo, numero);
  const falanteNomeadoId = obterFalanteNomeado(livro.codigo, capitulo, numero);
  const falanteId = falanteNomeadoId ?? falanteEspecial;
  const biografiaFalante = falanteId ? obterBiografia(falanteId) : undefined;
  const biografiaAutor = infoLivro?.autorId
    ? obterBiografia(infoLivro.autorId)
    : undefined;
  const mostrarFalanteSeparado =
    biografiaFalante && biografiaFalante.id !== biografiaAutor?.id;

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

  const LARGURA_POPUP = 320;
  const MARGEM = 12;
  // Nunca estima uma altura fixa do popup (o conteúdo cresce depois de
  // aberto — biografia e definições expandem sob demanda). Em vez disso,
  // trava `top` perto do toque e calcula `maxHeight` como o espaço real
  // que sobra até o fim da tela — `overflow-y: auto` (`.linfo-container`)
  // cuida do resto, então o botão "Fechar" nunca fica fora da viewport
  // não importa o quanto o conteúdo cresça.
  const posicaoPopup =
    !modoSheet && typeof window !== "undefined"
      ? (() => {
          const ALTURA_MINIMA = 200;
          const left = Math.min(
            Math.max(x, MARGEM),
            Math.max(MARGEM, window.innerWidth - LARGURA_POPUP - MARGEM),
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
        className={`bctx-container linfo-container ${modoSheet ? "bctx-sheet" : "bctx-popup"}`}
        role="dialog"
        aria-label={`Informações do versículo ${numero}`}
        style={posicaoPopup}
        onClick={(event) => event.stopPropagation()}
      >
        {modoSheet && <div className="bctx-handle" />}

        <p className="linfo-titulo">
          {livro.nome} {capitulo}:{numero}
        </p>

        <section aria-labelledby="linfo-quem-fala">
          <p className="bctx-section-label" id="linfo-quem-fala">
            <BsBookHalf aria-hidden="true" /> Quem fala
          </p>

          {infoLivro && (
            <div className="linfo-bloco">
              <p className="linfo-linha">
                <strong>Escritor do livro:</strong> {infoLivro.autor}
              </p>
              <p className="linfo-meta">
                {infoLivro.periodoAproximado} · {infoLivro.idiomaOriginal} ·{" "}
                {infoLivro.genero}
              </p>
              <p className="linfo-contexto">
                {infoLivro.contextoHistoricoCultural}
              </p>
              {biografiaAutor && (
                <BiografiaExpandivel biografia={biografiaAutor} />
              )}
            </div>
          )}

          {mostrarFalanteSeparado && biografiaFalante && (
            <div className="linfo-bloco linfo-bloco--falante">
              <p className="linfo-linha">
                <strong>Nesta passagem, quem fala:</strong>{" "}
                {biografiaFalante.nome}
              </p>
              <p className="linfo-contexto">{biografiaFalante.papel}</p>
              <p className="linfo-referencias">
                Confirme em:{" "}
                {biografiaFalante.referenciasBiblicasChave.join(", ")}
              </p>
              <BiografiaExpandivel biografia={biografiaFalante} />
            </div>
          )}
        </section>

        <section aria-labelledby="linfo-original">
          <p className="bctx-section-label" id="linfo-original">
            <BsTranslate aria-hidden="true" /> Significado original
          </p>
          <PainelSignificadoOriginal palavras={palavras} />
        </section>

        <button type="button" className="bctx-btn-fechar" onClick={onFechar}>
          <BsXLg aria-hidden="true" /> Fechar
        </button>
      </div>
    </div>
  );
}

function BiografiaExpandivel({ biografia }: { biografia: Biografia }) {
  const [aberta, setAberta] = useState(false);
  const [resumo, setResumo] = useState<ResumoBiografico | null | "carregando">(
    null,
  );

  function alternar() {
    if (aberta) {
      setAberta(false);
      return;
    }
    setAberta(true);
    if (resumo === null) {
      setResumo("carregando");
      obterResumoWikipedia(biografia.wikipediaTitulo).then(setResumo);
    }
  }

  return (
    <div className="linfo-biografia">
      <button type="button" className="linfo-ver-biografia" onClick={alternar}>
        {aberta ? "Ocultar biografia" : "Ver biografia"}{" "}
        {aberta ? (
          <BsChevronUp aria-hidden="true" />
        ) : (
          <BsChevronDown aria-hidden="true" />
        )}
      </button>
      {aberta && (
        <div className="linfo-biografia-corpo">
          {resumo === "carregando" && (
            <p className="linfo-carregando">Carregando…</p>
          )}
          {resumo && resumo !== "carregando" && (
            <>
              <p>{resumo.extrato}</p>
              <a
                href={resumo.urlArtigo}
                target="_blank"
                rel="noreferrer"
                className="linfo-fonte"
              >
                <BsGlobe2 aria-hidden="true" /> Ler mais na Wikipédia
              </a>
            </>
          )}
          {resumo === null || (resumo !== "carregando" && !resumo) ? (
            <p className="linfo-indisponivel">
              Não foi possível carregar a biografia agora.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

