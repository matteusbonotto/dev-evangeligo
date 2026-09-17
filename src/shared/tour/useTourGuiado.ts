import { useCallback, useEffect, useState } from "react";
import type { TourPasso } from "./tourTipos";

function chaveTour(idDoTour: string): string {
  return `evangeligo:tour:concluido:${idDoTour}`;
}

/** Usado por `ProfilePage.tsx` (T-077) pra decidir se mostra "Refazer tour" como reforço ou como 1ª vez. */
export function tourJaConcluido(idDoTour: string): boolean {
  try {
    return localStorage.getItem(chaveTour(idDoTour)) === "true";
  } catch {
    return true; // sem localStorage, nunca insiste sozinho — evita popup indesejado repetido.
  }
}

function marcarTourConcluido(idDoTour: string): void {
  try {
    localStorage.setItem(chaveTour(idDoTour), "true");
  } catch {
    // localStorage indisponível — só não persiste; a sessão atual já viu o tour.
  }
}

/** Usado pelo botão "Refazer tour" em Configurações — limpa a flag pra ele auto-iniciar de novo na próxima visita, ou chame `iniciar()` direto se já estiver na página certa. */
export function resetarTour(idDoTour: string): void {
  try {
    localStorage.removeItem(chaveTour(idDoTour));
  } catch {
    // localStorage indisponível — nada a fazer, o tour só não persiste.
  }
}

export interface EstadoTourGuiado {
  ativo: boolean;
  indice: number;
  total: number;
  passoAtual: TourPasso | null;
  proximo: () => void;
  anterior: () => void;
  pular: () => void;
  iniciar: () => void;
}

/**
 * Controla um tour guiado — 1 hook por página/seção, cada `idDoTour`
 * independente (ex. "dashboard", futuramente "biblia", "loja"). Auto-
 * inicia na 1ª visita (`autoIniciar`, padrão `true`) se a flag de
 * concluído ainda não existir; `iniciar()` força começar de novo a
 * qualquer momento (usado pelo botão "Refazer tour" em Configurações).
 */
export function useTourGuiado(
  passos: TourPasso[],
  idDoTour: string,
  autoIniciar = true,
): EstadoTourGuiado {
  const [ativo, setAtivo] = useState(false);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (autoIniciar && !tourJaConcluido(idDoTour)) {
      setIndice(0);
      setAtivo(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idDoTour]);

  const concluir = useCallback(() => {
    marcarTourConcluido(idDoTour);
    setAtivo(false);
  }, [idDoTour]);

  function proximo() {
    if (indice >= passos.length - 1) {
      concluir();
      return;
    }
    setIndice((atual) => atual + 1);
  }

  function anterior() {
    setIndice((atual) => Math.max(0, atual - 1));
  }

  function iniciar() {
    setIndice(0);
    setAtivo(true);
  }

  return {
    ativo,
    indice,
    total: passos.length,
    passoAtual: ativo ? (passos[indice] ?? null) : null,
    proximo,
    anterior,
    pular: concluir,
    iniciar,
  };
}
