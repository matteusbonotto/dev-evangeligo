import { describe, expect, it } from "vitest";
import {
  apagarLetra,
  avaliarTentativa,
  digitarLetra,
  enviarTentativa,
  iniciarTermo,
  MAX_TENTATIVAS_PADRAO,
  statusLetraTeclado,
} from "./engine";
import type { TermoChallenge } from "./types";

const CHALLENGE: TermoChallenge = {
  id: "termo-teste",
  resposta: "GRAÇA",
  referencia: "Efésios 2:8-9",
  explicacao: "Explicação de teste.",
};

describe("avaliarTentativa", () => {
  it("marca todas as letras como corretas quando a tentativa é igual à resposta", () => {
    expect(avaliarTentativa("GRACA", "GRACA")).toEqual([
      "correta",
      "correta",
      "correta",
      "correta",
      "correta",
    ]);
  });

  it("marca como ausente uma letra que não existe na resposta", () => {
    // "SELOS" não compartilha nenhuma letra com "GRACA" (G, R, A, C).
    expect(avaliarTentativa("SELOS", "GRACA")).toEqual([
      "ausente",
      "ausente",
      "ausente",
      "ausente",
      "ausente",
    ]);
  });

  it("trata letras duplicadas como o Wordle: só marca 'presente' enquanto sobrar ocorrência não coberta", () => {
    // resposta "GRACA" só tem duas ocorrências de "A" (índices 2 e 4), sem
    // nenhuma em posição exata contra "AACAC" — então, da esquerda para a
    // direita, só os 2 primeiros "A" da tentativa viram "presente"; o
    // terceiro "A" (índice 3, excedente) vira "ausente".
    expect(avaliarTentativa("AACAC", "GRACA")).toEqual([
      "presente",
      "presente",
      "presente",
      "ausente",
      "ausente",
    ]);
  });
});

describe("iniciarTermo", () => {
  it("normaliza a resposta (sem acento, maiúscula) e define o tamanho", () => {
    const session = iniciarTermo(CHALLENGE);
    expect(session.resposta).toBe("GRACA");
    expect(session.tamanho).toBe(5);
    expect(session.maxTentativas).toBe(MAX_TENTATIVAS_PADRAO);
    expect(session.status).toBe("em_andamento");
  });
});

describe("digitarLetra / apagarLetra", () => {
  it("adiciona letras normalizadas até o tamanho da resposta", () => {
    let session = iniciarTermo(CHALLENGE);
    session = digitarLetra(session, "g");
    session = digitarLetra(session, "R");
    expect(session.tentativaAtual).toBe("GR");
  });

  it("ignora letras além do tamanho da palavra", () => {
    let session = iniciarTermo(CHALLENGE);
    for (const letra of "GRACAX") session = digitarLetra(session, letra);
    expect(session.tentativaAtual).toBe("GRACA");
  });

  it("apaga a última letra digitada", () => {
    let session = iniciarTermo(CHALLENGE);
    session = digitarLetra(session, "G");
    session = digitarLetra(session, "R");
    session = apagarLetra(session);
    expect(session.tentativaAtual).toBe("G");
  });
});

describe("enviarTentativa", () => {
  function digitar(palavra: string) {
    let session = iniciarTermo(CHALLENGE);
    for (const letra of palavra) session = digitarLetra(session, letra);
    return session;
  }

  it("retorna erro sem alterar o estado quando a tentativa não tem o tamanho certo", () => {
    const session = digitar("GR");
    const resultado = enviarTentativa(session);
    expect(resultado.erro).toBeTruthy();
    expect(resultado.session).toBe(session);
  });

  it("marca a sessão como 'venceu' quando a tentativa acerta a resposta", () => {
    const session = digitar("GRACA");
    const { session: proxima, erro } = enviarTentativa(session);
    expect(erro).toBeUndefined();
    expect(proxima.status).toBe("venceu");
    expect(proxima.tentativas).toHaveLength(1);
    expect(proxima.tentativaAtual).toBe("");
  });

  it("marca a sessão como 'perdeu' após esgotar o número máximo de tentativas", () => {
    let session = iniciarTermo(CHALLENGE, 1);
    session = digitar2(session, "PASTO");
    const { session: proxima } = enviarTentativa(session);
    expect(proxima.status).toBe("perdeu");
    expect(proxima.tentativas).toHaveLength(1);
  });

  function digitar2(session: ReturnType<typeof iniciarTermo>, palavra: string) {
    let atual = session;
    for (const letra of palavra) atual = digitarLetra(atual, letra);
    return atual;
  }

  it("segue 'em_andamento' quando erra mas ainda restam tentativas", () => {
    const session = digitar("PASTO");
    const { session: proxima } = enviarTentativa(session);
    expect(proxima.status).toBe("em_andamento");
    expect(proxima.tentativas).toHaveLength(1);
  });
});

describe("statusLetraTeclado", () => {
  it("retorna null para uma letra ainda não tentada", () => {
    const session = iniciarTermo(CHALLENGE);
    expect(statusLetraTeclado(session, "G")).toBeNull();
  });

  it("retorna o melhor status já visto para a letra", () => {
    let session = iniciarTermo(CHALLENGE);
    for (const letra of "GRACA") session = digitarLetra(session, letra);
    const { session: depois } = enviarTentativa(session);
    expect(statusLetraTeclado(depois, "G")).toBe("correta");
  });
});
