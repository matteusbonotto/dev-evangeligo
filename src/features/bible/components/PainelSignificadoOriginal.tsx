import { useState } from "react";
import type { PalavraOriginal } from "../linguaOriginal";

/**
 * Chips de palavras do idioma original (hebraico/grego) com transliteração e
 * definição léxica (T-040/ADR-035) — extraído de `PainelInfoVersiculo.tsx`
 * pra ser reaproveitado também pelo balão de seleção (`BalaoTextoOriginal`,
 * T-048/ADR-041, aberto a partir do menu "Marcar texto"), sem duplicar a
 * lógica de expandir/mostrar definição.
 */
export function PainelSignificadoOriginal({
  palavras,
}: {
  palavras: PalavraOriginal[] | null;
}) {
  const [expandida, setExpandida] = useState<number | null>(null);

  if (palavras === null) {
    return <p className="linfo-carregando">Carregando palavras originais…</p>;
  }
  if (palavras.length === 0) {
    return (
      <p className="linfo-indisponivel">
        Não foi possível carregar o texto original deste versículo agora.
      </p>
    );
  }

  return (
    <div className="linfo-chips">
      {palavras.map((p, index) => (
        <div key={`${p.strong}-${index}`} className="linfo-chip-wrap">
          <button
            type="button"
            className="linfo-chip"
            onClick={() =>
              setExpandida((atual) => (atual === index ? null : index))
            }
          >
            <span className="linfo-chip-palavra">{p.palavra}</span>
            {p.definicao && (
              <span className="linfo-chip-translit">
                {p.definicao.transliteracao}
              </span>
            )}
          </button>
          {expandida === index && (
            <div className="linfo-definicao">
              {p.definicao ? (
                <>
                  <p className="linfo-definicao-cabecalho">
                    {p.definicao.lexema} ({p.strong}) — {p.definicao.pronuncia}
                  </p>
                  <p className="linfo-definicao-resumo">
                    {p.definicao.definicaoResumo}
                  </p>
                  <p className="linfo-definicao-completa">
                    {p.definicao.definicaoCompleta}
                  </p>
                </>
              ) : (
                <p className="linfo-indisponivel">
                  Definição não encontrada para {p.strong}.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
