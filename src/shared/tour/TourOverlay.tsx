import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import type { EstadoTourGuiado } from "./useTourGuiado";

const MARGEM_VIEWPORT = 12;
const LARGURA_BALAO = 300;
const RECUO_DESTAQUE = 6;

/**
 * Camada visual do tour guiado (T-077): escurece a tela inteira exceto um
 * recorte ao redor do elemento-alvo (técnica `box-shadow: 0 0 0 9999px`
 * — um único box posicionado sobre o `getBoundingClientRect()` do alvo,
 * sem precisar de SVG/máscara) + um balão flutuante com o texto,
 * clampado pra nunca vazar da tela (mesma técnica já usada em
 * `PainelInfoVersiculo`/`BalaoTextoOriginal`).
 */
export function TourOverlay({ tour }: { tour: EstadoTourGuiado }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!tour.ativo || !tour.passoAtual) {
      setRect(null);
      return;
    }
    const elemento = document.querySelector<HTMLElement>(
      tour.passoAtual.seletor,
    );
    if (!elemento) {
      setRect(null);
      return;
    }
    elemento.scrollIntoView({ block: "center", behavior: "smooth" });

    function atualizarRect() {
      setRect(elemento!.getBoundingClientRect());
    }
    // Pequeno atraso pro scroll suave terminar antes de medir a posição final.
    const timeout = setTimeout(atualizarRect, 300);
    window.addEventListener("resize", atualizarRect);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", atualizarRect);
    };
  }, [tour.ativo, tour.indice, tour.passoAtual]);

  if (!tour.ativo || !tour.passoAtual) return null;

  const destaqueEstilo = rect
    ? {
        top: rect.top - RECUO_DESTAQUE,
        left: rect.left - RECUO_DESTAQUE,
        width: rect.width + RECUO_DESTAQUE * 2,
        height: rect.height + RECUO_DESTAQUE * 2,
      }
    : null;

  const ALTURA_BALAO_ESTIMADA = 220;
  const balaoEmbaixoCabe = rect
    ? rect.bottom + ALTURA_BALAO_ESTIMADA < window.innerHeight
    : true;
  const topoBalaoFinal = rect
    ? balaoEmbaixoCabe
      ? rect.bottom + RECUO_DESTAQUE + 16
      : Math.max(MARGEM_VIEWPORT, rect.top - RECUO_DESTAQUE - 16 - ALTURA_BALAO_ESTIMADA)
    : window.innerHeight / 2 - ALTURA_BALAO_ESTIMADA / 2;
  const esquerdaBalao = rect
    ? Math.min(
        Math.max(rect.left, MARGEM_VIEWPORT),
        Math.max(MARGEM_VIEWPORT, window.innerWidth - LARGURA_BALAO - MARGEM_VIEWPORT),
      )
    : Math.max(MARGEM_VIEWPORT, window.innerWidth / 2 - LARGURA_BALAO / 2);

  return (
    <div className="tour-overlay" role="dialog" aria-label="Tour guiado">
      {destaqueEstilo && (
        <div className="tour-destaque" style={destaqueEstilo} />
      )}

      <div
        className="tour-balao"
        style={{ top: topoBalaoFinal, left: esquerdaBalao, width: LARGURA_BALAO }}
      >
        <div className="tour-balao-topo">
          <span className="tour-balao-contador">
            {tour.indice + 1} de {tour.total}
          </span>
          <button
            type="button"
            className="tour-balao-fechar"
            onClick={tour.pular}
            aria-label="Pular tour"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <h3 className="tour-balao-titulo">{tour.passoAtual.titulo}</h3>
        <p className="tour-balao-texto">{tour.passoAtual.texto}</p>
        <div className="tour-balao-acoes">
          {tour.indice > 0 && (
            <button
              type="button"
              className="secondary-button small"
              onClick={tour.anterior}
            >
              Anterior
            </button>
          )}
          <button
            type="button"
            className="primary-button small"
            onClick={tour.proximo}
          >
            {tour.indice >= tour.total - 1 ? "Concluir" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
