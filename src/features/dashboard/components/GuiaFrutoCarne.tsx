import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { GUIA_CULTIVO_ESPIRITUAL } from "../data/guiaCultivoEspiritual";

/**
 * 2 accordions gerais — "Fruto do Espírito" e "Obra da Carne" — dentro da
 * seção de Vida Interior (pedido explícito do usuário, com o conteúdo do
 * app legado: `GUIA_CULTIVO_ESPIRITUAL`). Complementa o que já existe por
 * par em `SpiritBattle.tsx` (explicação individual ao expandir cada
 * fruto×obra) com uma visão de conjunto: como cultivar cada fruto no dia a
 * dia, e como identificar/evitar cada obra da carne HOJE EM DIA — pedido
 * literal: "preciso que tenha os exemplos igual no legado... lá tava mais
 * claro e explicativo".
 */
export function GuiaFrutoCarne() {
  return (
    <div className="gfc-wrap">
      <AcordeaoGuia
        titulo="Fruto do Espírito — como cultivar no dia a dia"
        itens={GUIA_CULTIVO_ESPIRITUAL.map((item) => ({
          nome: item.fruto,
          versiculo: item.versiculo,
          linhas: [
            { rotulo: "Como cultivar hoje", texto: item.pratica },
            { rotulo: "Pergunta para se examinar", texto: item.pergunta },
            { rotulo: "Oração", texto: item.oracao },
          ],
        }))}
      />
      <AcordeaoGuia
        titulo="Obra da Carne — como identificar e evitar hoje em dia"
        itens={GUIA_CULTIVO_ESPIRITUAL.map((item) => ({
          nome: item.obra,
          versiculo: item.versiculo,
          linhas: [
            { rotulo: "Como aparece hoje em dia", texto: item.sinal },
            { rotulo: "Como evitar/reagir", texto: item.resposta },
          ],
        }))}
      />
    </div>
  );
}

interface LinhaGuia {
  rotulo: string;
  texto: string;
}

interface ItemGuia {
  nome: string;
  versiculo: string;
  linhas: LinhaGuia[];
}

function AcordeaoGuia({ titulo, itens }: { titulo: string; itens: ItemGuia[] }) {
  const [aberto, setAberto] = useState(false);

  return (
    <section className="gfc-acordeao">
      <button
        type="button"
        className="gfc-acordeao-cabecalho"
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
      >
        <span>{titulo}</span>
        {aberto ? (
          <FiChevronUp aria-hidden="true" />
        ) : (
          <FiChevronDown aria-hidden="true" />
        )}
      </button>
      {aberto && (
        <div className="gfc-acordeao-corpo">
          {itens.map((item) => (
            <div key={item.nome} className="gfc-item">
              <p className="gfc-item-titulo">
                {item.nome} <span className="gfc-item-versiculo">— {item.versiculo}</span>
              </p>
              {item.linhas.map((linha) => (
                <p key={linha.rotulo} className="gfc-item-linha">
                  <strong>{linha.rotulo}:</strong> {linha.texto}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
