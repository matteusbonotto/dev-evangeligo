import { useCallback, useEffect, useRef, useState } from "react";
import {
  ajustarVelocidadeNarracao,
  montarFilaNarracao,
  obterVelocidadeNarracaoSalva,
  salvarVelocidadeNarracao,
} from "./narracao";

/**
 * Hook que aciona a narração por voz de um capítulo (Web Speech API) —
 * a parte dependente de React/navegador de `narracao.ts` (que guarda só
 * a lógica pura, testável). Porta `narrarCapitulo`/`pararNarracao` do
 * legado: fala verso por verso, sequencialmente, via callback
 * `onend` recursivo (não enfileira tudo de uma vez) para permitir
 * retomar do verso atual ao trocar a velocidade em andamento.
 */
export function useNarracaoBiblia(
  nomeLivro: string,
  capitulo: number,
  versiculos: readonly string[],
) {
  const [narrando, setNarrando] = useState(false);
  const [velocidade, setVelocidade] = useState<number>(() => obterVelocidadeNarracaoSalva());
  const velocidadeRef = useRef(velocidade);
  const indiceRef = useRef(0);
  const filaRef = useRef<string[]>([]);

  useEffect(() => {
    velocidadeRef.current = velocidade;
  }, [velocidade]);

  const disponivel =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const falarProximo = useCallback(() => {
    const fila = filaRef.current;
    if (indiceRef.current >= fila.length) {
      setNarrando(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(fila[indiceRef.current]);
    utterance.lang = "pt-BR";
    utterance.rate = velocidadeRef.current;
    utterance.onend = () => {
      indiceRef.current += 1;
      falarProximo();
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const narrar = useCallback(
    (apartirDe = 0) => {
      if (!disponivel) return;
      filaRef.current = montarFilaNarracao(nomeLivro, capitulo, versiculos);
      if (!filaRef.current.length) return;
      indiceRef.current = apartirDe;
      window.speechSynthesis.cancel();
      setNarrando(true);
      falarProximo();
    },
    [disponivel, nomeLivro, capitulo, versiculos, falarProximo],
  );

  const parar = useCallback(() => {
    if (disponivel) window.speechSynthesis.cancel();
    setNarrando(false);
  }, [disponivel]);

  const mudarVelocidade = useCallback((delta: number) => {
    setVelocidade((atual) => {
      const proxima = ajustarVelocidadeNarracao(atual, delta);
      salvarVelocidadeNarracao(proxima);
      return proxima;
    });
  }, []);

  // Retoma a fala do verso atual quando a velocidade muda em andamento
  // (mesmo índice, nova taxa) — porta o "para e recomeça do mesmo ponto"
  // de `aumentarVelocidade`/`diminuirVelocidade` no legado.
  const primeiraExecucao = useRef(true);
  useEffect(() => {
    if (primeiraExecucao.current) {
      primeiraExecucao.current = false;
      return;
    }
    if (!narrando || !disponivel) return;
    window.speechSynthesis.cancel();
    falarProximo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [velocidade]);

  useEffect(() => {
    return () => {
      // Checa `window.speechSynthesis` direto (não a `disponivel` capturada
      // no fechamento do mount) — evita quebrar caso o global tenha sido
      // removido entre o mount e o desmonte (ex.: stub de teste desfeito).
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { narrando, velocidade, disponivel, narrar, parar, mudarVelocidade };
}
