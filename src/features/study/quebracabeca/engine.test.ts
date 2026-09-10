import { describe, expect, it } from "vitest";
import {
  dividirEmPalavras,
  estaCompleto,
  estaCorreto,
  iniciarQuebraCabeca,
  posicionarPalavra,
  removerDaMontada,
  sentencaMontada,
} from "./engine";

describe("dividirEmPalavras", () => {
  it("divide por espaço em branco", () => {
    expect(dividirEmPalavras("No principio era o Verbo.")).toEqual([
      "No",
      "principio",
      "era",
      "o",
      "Verbo.",
    ]);
  });

  it("ignora espaços extras nas bordas e no meio", () => {
    expect(dividirEmPalavras("  Uma   frase  ")).toEqual(["Uma", "frase"]);
  });
});

describe("iniciarQuebraCabeca", () => {
  it("começa com todas as palavras no banco, embaralhadas, e a frase montada vazia", () => {
    const session = iniciarQuebraCabeca("Uma frase de teste aqui", () => 0);
    expect(session.palavrasCorretas).toEqual([
      "Uma",
      "frase",
      "de",
      "teste",
      "aqui",
    ]);
    expect(session.montada).toEqual([]);
    expect([...session.banco].sort()).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("posicionarPalavra / removerDaMontada", () => {
  it("move uma palavra do banco para o fim da frase montada", () => {
    let session = iniciarQuebraCabeca("Uma frase de teste", () => 0);
    const indiceEscolhido = session.banco[0];
    session = posicionarPalavra(session, 0);
    expect(session.montada).toEqual([indiceEscolhido]);
    expect(session.banco).not.toContain(indiceEscolhido);
  });

  it("remover uma palavra montada a devolve ao fim do banco, sem buraco na frase", () => {
    let session = iniciarQuebraCabeca("A B C", () => 0);
    session = posicionarPalavra(session, 0);
    session = posicionarPalavra(session, 0);
    session = posicionarPalavra(session, 0);
    expect(session.montada).toHaveLength(3);
    expect(session.banco).toHaveLength(0);

    const removida = session.montada[0];
    session = removerDaMontada(session, 0);
    expect(session.montada).toHaveLength(2);
    expect(session.banco).toEqual([removida]);
  });

  it("índice fora do intervalo não altera a sessão", () => {
    const session = iniciarQuebraCabeca("A B C", () => 0);
    expect(posicionarPalavra(session, 99)).toBe(session);
    expect(removerDaMontada(session, 0)).toBe(session);
  });
});

describe("estaCompleto / estaCorreto / sentencaMontada", () => {
  function montarNaOrdemCorreta(texto: string) {
    let session = iniciarQuebraCabeca(texto, () => 0);
    while (session.banco.length > 0) {
      const proximoCorreto = session.banco.findIndex(
        (indice) => indice === session.montada.length,
      );
      session = posicionarPalavra(session, proximoCorreto);
    }
    return session;
  }

  it("não está completo enquanto restar palavra no banco", () => {
    const session = iniciarQuebraCabeca("Uma frase de teste", () => 0);
    expect(estaCompleto(session)).toBe(false);
    expect(estaCorreto(session)).toBe(false);
  });

  it("está correto quando a ordem montada reproduz o texto original", () => {
    const session = montarNaOrdemCorreta("No principio era o Verbo");
    expect(estaCompleto(session)).toBe(true);
    expect(estaCorreto(session)).toBe(true);
    expect(sentencaMontada(session)).toBe("No principio era o Verbo");
  });

  it("está incorreto quando completo mas fora de ordem", () => {
    let session = iniciarQuebraCabeca("A B C", () => 0);
    // Com random=0 fixo, embaralharLista sempre gera [1, 2, 0] para 3
    // itens; posicionar sempre a última ficha do banco monta "A C B".
    while (session.banco.length > 0) {
      session = posicionarPalavra(session, session.banco.length - 1);
    }
    expect(estaCompleto(session)).toBe(true);
    expect(sentencaMontada(session)).toBe("A C B");
    expect(estaCorreto(session)).toBe(false);
  });

  it("aceita trocar duas instâncias de uma palavra repetida, desde que a frase final bata", () => {
    // "e" aparece nas posições 1 e 3 — trocar essas duas instâncias
    // produz a MESMA frase final, então deve contar como correto.
    let session = iniciarQuebraCabeca("Fé e amor e graça", () => 0);
    const ordemTrocada = [0, 3, 2, 1, 4]; // posições 1 e 3 (ambas "e") invertidas
    for (const indiceOriginal of ordemTrocada) {
      const posicaoNoBanco = session.banco.indexOf(indiceOriginal);
      session = posicionarPalavra(session, posicaoNoBanco);
    }
    expect(sentencaMontada(session)).toBe("Fé e amor e graça");
    expect(estaCorreto(session)).toBe(true);
  });
});
