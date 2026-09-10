import { beforeEach, describe, expect, it } from "vitest";
import {
  aplicarMarcaTexto,
  atualizarNota,
  corHerdadaDoTrecho,
  criarNota,
  obterAnotacoesDoCapitulo,
  removerAnotacao,
  removerCorDeAnotacao,
} from "./marcacoes";

beforeEach(() => {
  localStorage.clear();
});

describe("obterAnotacoesDoCapitulo", () => {
  it("retorna lista vazia quando nada foi salvo", () => {
    expect(obterAnotacoesDoCapitulo(1, 1)).toEqual([]);
  });
});

describe("aplicarMarcaTexto", () => {
  it("cria um marca-texto puro", () => {
    aplicarMarcaTexto(1, 1, 1, 0, 5, "No pr", "#fef08a");
    const anotacoes = obterAnotacoesDoCapitulo(1, 1);
    expect(anotacoes).toHaveLength(1);
    expect(anotacoes[0]).toMatchObject({
      type: "highlight",
      versiculo: 1,
      inicio: 0,
      fim: 5,
      color: "#fef08a",
    });
  });

  it("duas marca-textos em trechos não sobrepostos coexistem", () => {
    aplicarMarcaTexto(1, 1, 1, 0, 5, "aaaaa", "#fef08a");
    aplicarMarcaTexto(1, 1, 1, 10, 15, "bbbbb", "#bbf7d0");
    expect(obterAnotacoesDoCapitulo(1, 1)).toHaveLength(2);
  });

  it("um novo marca-texto sobre um marca-texto puro existente o substitui (não empilha)", () => {
    aplicarMarcaTexto(1, 1, 1, 0, 10, "texto original", "#fef08a");
    aplicarMarcaTexto(1, 1, 1, 5, 15, "novo texto", "#bbf7d0");

    const anotacoes = obterAnotacoesDoCapitulo(1, 1);
    expect(anotacoes).toHaveLength(1);
    expect(anotacoes[0].color).toBe("#bbf7d0");
  });

  it("um marca-texto sobre uma nota existente FUNDE a cor na nota (não cria um segundo registro)", () => {
    const nota = criarNota(1, 1, 1, 0, 10, "texto da nota", "minha nota");
    aplicarMarcaTexto(1, 1, 1, 0, 10, "texto da nota", "#bfdbfe");

    const anotacoes = obterAnotacoesDoCapitulo(1, 1);
    expect(anotacoes).toHaveLength(1);
    expect(anotacoes[0]).toMatchObject({
      id: nota.id,
      type: "note",
      noteContent: "minha nota",
      highlightColor: "#bfdbfe",
    });
  });
});

describe("criarNota", () => {
  it("cria uma nota sem cor", () => {
    const nota = criarNota(1, 1, 1, 0, 5, "trecho", "conteúdo");
    expect(nota.type).toBe("note");
    expect(nota.highlightColor).toBeUndefined();
    expect(obterAnotacoesDoCapitulo(1, 1)).toHaveLength(1);
  });

  it("criar uma nota sobre um marca-texto puro existente o substitui pela nota (sem empilhar)", () => {
    aplicarMarcaTexto(1, 1, 1, 0, 10, "texto original", "#fdba74");
    const nota = criarNota(1, 1, 1, 0, 10, "texto original", "minha nota", "#fdba74");

    const anotacoes = obterAnotacoesDoCapitulo(1, 1);
    expect(anotacoes).toHaveLength(1);
    expect(anotacoes[0]).toMatchObject({
      id: nota.id,
      type: "note",
      highlightColor: "#fdba74",
    });
  });

  it("uma nota sobre outra nota existente substitui a antiga (não empilha)", () => {
    criarNota(1, 1, 1, 0, 10, "original", "nota antiga");
    const nova = criarNota(1, 1, 1, 5, 15, "novo", "nota nova");

    const anotacoes = obterAnotacoesDoCapitulo(1, 1);
    expect(anotacoes).toHaveLength(1);
    expect(anotacoes[0].id).toBe(nova.id);
  });

  it("não afeta anotações de outro capítulo", () => {
    criarNota(1, 1, 1, 0, 5, "x", "nota");
    expect(obterAnotacoesDoCapitulo(1, 2)).toEqual([]);
  });
});

describe("corHerdadaDoTrecho", () => {
  it("retorna a cor de um marca-texto puro que sobrepõe o trecho", () => {
    aplicarMarcaTexto(1, 1, 1, 0, 10, "texto", "#bbf7d0");
    expect(corHerdadaDoTrecho(1, 1, 1, 2, 6)).toBe("#bbf7d0");
  });

  it("retorna undefined quando não há marca-texto sobreposto", () => {
    expect(corHerdadaDoTrecho(1, 1, 1, 0, 5)).toBeUndefined();
  });
});

describe("atualizarNota", () => {
  it("atualiza o conteúdo e a cor de uma nota existente", () => {
    const nota = criarNota(1, 1, 1, 0, 5, "trecho", "original");
    const atualizada = atualizarNota(1, 1, nota.id, "editada", "#bbf7d0");

    expect(atualizada?.noteContent).toBe("editada");
    expect(atualizada?.highlightColor).toBe("#bbf7d0");
    expect(obterAnotacoesDoCapitulo(1, 1)[0].noteContent).toBe("editada");
  });

  it("retorna undefined para um id inexistente, sem lançar erro", () => {
    expect(atualizarNota(1, 1, "id-inexistente", "x", undefined)).toBeUndefined();
  });
});

describe("removerAnotacao", () => {
  it("remove um marca-texto puro por completo", () => {
    aplicarMarcaTexto(1, 1, 1, 0, 5, "x", "#fef08a");
    const id = obterAnotacoesDoCapitulo(1, 1)[0].id;
    removerAnotacao(1, 1, id);
    expect(obterAnotacoesDoCapitulo(1, 1)).toEqual([]);
  });

  it("remove uma nota por completo", () => {
    const nota = criarNota(1, 1, 1, 0, 5, "x", "nota");
    removerAnotacao(1, 1, nota.id);
    expect(obterAnotacoesDoCapitulo(1, 1)).toEqual([]);
  });

  it("não afeta outras anotações do mesmo capítulo", () => {
    aplicarMarcaTexto(1, 1, 1, 0, 5, "a", "#fef08a");
    aplicarMarcaTexto(1, 1, 1, 10, 15, "b", "#bbf7d0");
    const [primeira] = obterAnotacoesDoCapitulo(1, 1);
    removerAnotacao(1, 1, primeira.id);
    expect(obterAnotacoesDoCapitulo(1, 1)).toHaveLength(1);
  });
});

describe("removerCorDeAnotacao", () => {
  it("num marca-texto puro, remove a anotação inteira", () => {
    aplicarMarcaTexto(1, 1, 1, 0, 5, "x", "#fef08a");
    const id = obterAnotacoesDoCapitulo(1, 1)[0].id;
    removerCorDeAnotacao(1, 1, id);
    expect(obterAnotacoesDoCapitulo(1, 1)).toEqual([]);
  });

  it("numa nota colorida, limpa só a cor — a nota e o link permanecem", () => {
    const nota = criarNota(1, 1, 1, 0, 5, "x", "minha nota", "#fef08a");
    expect(nota.highlightColor).toBe("#fef08a");

    removerCorDeAnotacao(1, 1, nota.id);

    const anotacoes = obterAnotacoesDoCapitulo(1, 1);
    expect(anotacoes).toHaveLength(1);
    expect(anotacoes[0]).toMatchObject({
      id: nota.id,
      type: "note",
      noteContent: "minha nota",
    });
    expect(anotacoes[0].highlightColor).toBeUndefined();
  });
});
