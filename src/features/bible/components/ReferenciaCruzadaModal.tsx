import { useEffect, useState } from "react";
import { BsBook, BsXLg } from "react-icons/bs";
import { getLivroByCodigo } from "../data/livros";
import { getCapituloVersiculos } from "../dataLoader";
import {
  formatarReferenciaCruzada,
  type ReferenciaCruzada,
} from "../referenciasCruzadas";

/**
 * Modal somente-leitura de referência cruzada (T-050/ADR-042/ADR-043) —
 * pedido explícito do usuário: "modal post it amarelo com a passagem. e o
 * botão fechar". Reaproveita o estilo visual `.postit`/`.postit-fita`/
 * `.postit-dobra` já usado pelo post-it de NOTA (`PostItModal` em
 * `LeituraPage.tsx`), mas sem cor/textarea/salvar/excluir — só a passagem
 * referenciada e "Fechar".
 *
 * O texto sempre vem da Almeida local (`dataLoader.ts`), independente da
 * tradução ativa na leitura — evita uma chamada de rede extra (e mais
 * lenta) só pra um popup rápido; a tradução ativa continua sendo a do
 * texto principal, inalterada.
 */
export interface ReferenciaCruzadaModalProps {
  referencia: ReferenciaCruzada;
  onFechar: () => void;
}

interface LinhaPassagem {
  capitulo: number;
  versiculo: number;
  texto: string;
}

export function ReferenciaCruzadaModal({
  referencia,
  onFechar,
}: ReferenciaCruzadaModalProps) {
  const [linhas, setLinhas] = useState<LinhaPassagem[] | null>(null);
  const [erro, setErro] = useState(false);
  const livro = getLivroByCodigo(referencia.livro);

  useEffect(() => {
    let ativo = true;
    setLinhas(null);
    setErro(false);
    (async () => {
      if (!livro) {
        setErro(true);
        return;
      }
      try {
        const resultado: LinhaPassagem[] = [];
        for (
          let capitulo = referencia.capituloInicio;
          capitulo <= referencia.capituloFim;
          capitulo++
        ) {
          const versiculos = await getCapituloVersiculos(livro.order, capitulo);
          const de = capitulo === referencia.capituloInicio ? referencia.versiculoInicio : 1;
          const ate =
            capitulo === referencia.capituloFim
              ? referencia.versiculoFim
              : versiculos.length;
          for (let versiculo = de; versiculo <= ate; versiculo++) {
            const texto = versiculos[versiculo - 1];
            if (texto) resultado.push({ capitulo, versiculo, texto });
          }
        }
        if (ativo) setLinhas(resultado);
      } catch {
        if (ativo) setErro(true);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referencia.livro, referencia.capituloInicio, referencia.capituloFim]);

  return (
    <div className="modal-nota-overlay" onClick={onFechar}>
      <div
        className="postit"
        role="dialog"
        aria-label={`Passagem: ${formatarReferenciaCruzada(referencia)}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="postit-fita" />

        <div className="postit-cabecalho">
          <span className="postit-titulo">
            <BsBook aria-hidden="true" />
            <span>
              {livro?.nome ?? referencia.livro} —{" "}
              {formatarReferenciaCruzada(referencia)}
            </span>
          </span>
        </div>

        <div className="postit-corpo-referencia">
          {erro && (
            <p className="linfo-indisponivel">
              Não foi possível carregar esta passagem agora.
            </p>
          )}
          {!erro && linhas === null && (
            <p className="linfo-carregando">Carregando…</p>
          )}
          {!erro &&
            linhas?.map((linha) => (
              <p key={`${linha.capitulo}:${linha.versiculo}`}>
                <sup>{linha.versiculo}</sup> {linha.texto}
              </p>
            ))}
        </div>

        <div className="postit-footer">
          <button
            type="button"
            className="postit-btn postit-btn--cancelar"
            onClick={onFechar}
          >
            <BsXLg aria-hidden="true" /> Fechar
          </button>
        </div>

        <div className="postit-dobra" />
      </div>
    </div>
  );
}
