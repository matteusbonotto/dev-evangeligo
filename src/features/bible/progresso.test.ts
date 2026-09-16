import { beforeEach, describe, expect, it } from "vitest";
import {
  capituloConcluido,
  contarLivrosIniciados,
  estimarPosicaoPeloPercentual,
  obterProgressoCapitulo,
  obterProgressoLivro,
  registrarProgressoLeitura,
} from "./progresso";

beforeEach(() => {
  localStorage.clear();
});

describe("registrarProgressoLeitura / obterProgressoCapitulo", () => {
  it("capítulo sem progresso registrado começa em 0%", () => {
    expect(obterProgressoCapitulo(1, 1)).toBe(0);
  });

  it("registra e recupera o percentual", () => {
    registrarProgressoLeitura(1, 1, 40);
    expect(obterProgressoCapitulo(1, 1)).toBe(40);
  });

  it("nunca diminui o valor salvo (só incremental, ao rolar de volta)", () => {
    registrarProgressoLeitura(1, 1, 60);
    registrarProgressoLeitura(1, 1, 20);
    expect(obterProgressoCapitulo(1, 1)).toBe(60);
  });

  it("aumenta o valor quando o novo percentual é maior", () => {
    registrarProgressoLeitura(1, 1, 30);
    registrarProgressoLeitura(1, 1, 75);
    expect(obterProgressoCapitulo(1, 1)).toBe(75);
  });

  it("retorna o valor final armazenado (novo ou antigo)", () => {
    registrarProgressoLeitura(1, 1, 50);
    expect(registrarProgressoLeitura(1, 1, 10)).toBe(50);
    expect(registrarProgressoLeitura(1, 1, 80)).toBe(80);
  });

  it("limita o percentual entre 0 e 100", () => {
    registrarProgressoLeitura(1, 1, 150);
    expect(obterProgressoCapitulo(1, 1)).toBe(100);
  });

  it("não afeta outros capítulos/livros", () => {
    registrarProgressoLeitura(1, 1, 100);
    expect(obterProgressoCapitulo(1, 2)).toBe(0);
    expect(obterProgressoCapitulo(2, 1)).toBe(0);
  });
});

describe("capituloConcluido", () => {
  it("false abaixo do limiar de conclusão (95%)", () => {
    registrarProgressoLeitura(1, 1, 94);
    expect(capituloConcluido(1, 1)).toBe(false);
  });

  it("true a partir do limiar de conclusão", () => {
    registrarProgressoLeitura(1, 1, 95);
    expect(capituloConcluido(1, 1)).toBe(true);
  });
});

describe("obterProgressoLivro", () => {
  it("0% para um livro sem nenhum capítulo lido", () => {
    expect(obterProgressoLivro(1, 50)).toBe(0);
  });

  it("calcula a média considerando capítulos não abertos como 0%", () => {
    registrarProgressoLeitura(1, 1, 100);
    // 2 de 50 capítulos, 1 em 100% e o resto (incluindo capítulo 2) em 0%.
    expect(obterProgressoLivro(1, 50)).toBe(2); // round(100/50)
  });

  it("retorna 0 quando totalCapitulos é 0", () => {
    expect(obterProgressoLivro(1, 0)).toBe(0);
  });
});

describe("contarLivrosIniciados", () => {
  it("conta livros distintos com ao menos 1 capítulo com progresso > 0", () => {
    registrarProgressoLeitura(1, 1, 10);
    registrarProgressoLeitura(2, 1, 5);
    registrarProgressoLeitura(3, 1, 100);
    expect(contarLivrosIniciados([1, 2, 3, 4, 5])).toBe(3);
  });

  it("ignora livros fora da lista de ordens informada", () => {
    registrarProgressoLeitura(1, 1, 10);
    expect(contarLivrosIniciados([2, 3])).toBe(0);
  });
});

describe("estimarPosicaoPeloPercentual", () => {
  it("começa no capítulo 1 quando não há nenhum progresso (0%)", () => {
    expect(estimarPosicaoPeloPercentual(0, 50)).toBe(1);
  });

  it("acerta o exemplo do usuário: ~12% de um livro de 50 capítulos aponta pro capítulo 6", () => {
    expect(estimarPosicaoPeloPercentual(12, 50)).toBe(6);
  });

  it("termina no último capítulo quando o livro está 100% lido", () => {
    expect(estimarPosicaoPeloPercentual(100, 50)).toBe(50);
  });

  it("nunca aponta além do total de capítulos, mesmo com arredondamento", () => {
    expect(estimarPosicaoPeloPercentual(99, 50)).toBe(50);
  });

  it("nunca lança erro e nunca aponta pro capítulo 0 quando totalCapitulos é 0", () => {
    expect(estimarPosicaoPeloPercentual(50, 0)).toBe(1);
  });
});
