import { useState, type ReactNode } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { GUIA_CULTIVO_ESPIRITUAL } from "../data/guiaCultivoEspiritual";

/**
 * 2 accordions gerais — "Fruto do Espírito" (Gl 5:22-23) e "Obras da Carne"
 * (Gl 5:19-21) — dentro da seção de Vida Interior, conteúdo do app legado
 * (`GUIA_CULTIVO_ESPIRITUAL`). Pedido explícito da auditoria: unir
 * conceito + identificação + exemplo + aplicação prática NUM SÓ LUGAR por
 * item (nunca "o que é X" aqui e "como pratico X" em outro lugar) —
 * pedido literal: "preciso que tenha os exemplos igual no legado de o que
 * seria feitiçaria hoje em dia... lá tava mais claro e explicativo".
 */
export function GuiaFrutoCarne() {
  return (
    <div className="gfc-wrap">
      <AcordeaoGuia titulo="Fruto do Espírito — Gálatas 5:22-23">
        {GUIA_CULTIVO_ESPIRITUAL.map((item) => (
          <div key={item.fruto} className="gfc-item">
            <p className="gfc-item-titulo">
              {item.fruto} <span className="gfc-item-versiculo">— {item.versiculo}</span>
            </p>
            <p className="gfc-item-linha">
              <strong>O que significa:</strong> {item.significadoFruto}
            </p>
            <p className="gfc-item-linha">
              <strong>Como aparece no dia a dia:</strong> {item.exemploFruto}
            </p>
            <p className="gfc-item-linha">
              <strong>Como praticar hoje:</strong> {item.pratica}
            </p>
            <p className="gfc-item-linha">
              <strong>Pergunta para se examinar:</strong> {item.pergunta}
            </p>
            <p className="gfc-item-linha">
              <strong>Oração:</strong> {item.oracao}
            </p>
          </div>
        ))}
      </AcordeaoGuia>

      <AcordeaoGuia titulo="Obras da Carne — Gálatas 5:19-21">
        {GUIA_CULTIVO_ESPIRITUAL.map((item) => (
          <div key={item.obra} className="gfc-item">
            <p className="gfc-item-titulo">{item.obra}</p>
            <p className="gfc-item-linha">
              <strong>O que significa:</strong> {item.significadoObra}
            </p>
            <p className="gfc-item-linha">
              <strong>Como aparece hoje em dia:</strong> {item.sinal}
            </p>
            <p className="gfc-item-linha">
              <strong>Como evitar/reagir:</strong> {item.resposta}
            </p>
          </div>
        ))}
      </AcordeaoGuia>
    </div>
  );
}

function AcordeaoGuia({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
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
      {aberto && <div className="gfc-acordeao-corpo">{children}</div>}
    </section>
  );
}
