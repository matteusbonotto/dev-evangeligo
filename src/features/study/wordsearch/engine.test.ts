import { describe, expect, it } from "vitest";
import {
  celulasDaLinha,
  gerarGrade,
  iniciarWordSearch,
  selecionarCelula,
  todasPalavrasEstaoNaGrade,
} from "./engine";
import type { WordSearchPuzzle } from "./types";

const puzzleTeste: WordSearchPuzzle = {
  id: "teste",
  titulo: "Teste",
  palavras: ["FÉ", "AMOR", "GRAÇA"],
  referencia: "Ref",
  dica: "Dica",
};

describe("gerarGrade", () => {
  it("gera uma grade do tamanho pedido (tamanho²)", () => {
    const grade = gerarGrade(["FÉ", "AMOR"], 10);
    expect(grade).toHaveLength(100);
  });

  it("toda célula é preenchida com uma letra A-Z", () => {
    const grade = gerarGrade(["FÉ", "AMOR", "GRAÇA"], 10);
    for (const letra of grade) {
      expect(letra).toMatch(/^[A-Z]$/);
    }
  });

  it("todas as palavras pedidas aparecem em alguma linha reta da grade", () => {
    const session = iniciarWordSearch(puzzleTeste, 10);
    expect(todasPalavrasEstaoNaGrade(session)).toBe(true);
  });

  it("é determinística para um random fixo", () => {
    const semprePrimeiro = () => 0;
    const a = gerarGrade(["FÉ", "AMOR"], 8, semprePrimeiro);
    const b = gerarGrade(["FÉ", "AMOR"], 8, semprePrimeiro);
    expect(a).toEqual(b);
  });
});

describe("celulasDaLinha", () => {
  const tamanho = 5;

  it("uma célula só quando início e fim são iguais", () => {
    expect(celulasDaLinha(6, 6, tamanho)).toEqual([6]);
  });

  it("linha horizontal", () => {
    // índices 5..9 = segunda linha (0-indexada) de uma grade 5x5
    expect(celulasDaLinha(5, 9, tamanho)).toEqual([5, 6, 7, 8, 9]);
  });

  it("linha vertical", () => {
    // coluna 0: índices 0,5,10,15,20
    expect(celulasDaLinha(0, 20, tamanho)).toEqual([0, 5, 10, 15, 20]);
  });

  it("diagonal", () => {
    // diagonal principal: 0,6,12,18,24
    expect(celulasDaLinha(0, 24, tamanho)).toEqual([0, 6, 12, 18, 24]);
  });

  it("retorna null para uma seleção não alinhada", () => {
    expect(celulasDaLinha(0, 7, tamanho)).toBeNull();
  });

  it("funciona de trás para frente (fim antes do início na grade)", () => {
    expect(celulasDaLinha(9, 5, tamanho)).toEqual([9, 8, 7, 6, 5]);
  });
});

describe("selecionarCelula", () => {
  it("primeiro toque marca o início e pede o segundo toque", () => {
    const session = iniciarWordSearch(puzzleTeste, 10);
    const { session: next, resultado } = selecionarCelula(session, 5);
    expect(resultado).toBe("aguardando_fim");
    expect(next.inicio).toBe(5);
  });

  it("uma linha que não forma palavra nenhuma é inválida e reseta o início", () => {
    // grade 10x10 com só 3 palavras curtas: quase certamente uma linha
    // horizontal de 10 letras não bate com nenhuma palavra normalizada.
    const session = iniciarWordSearch(puzzleTeste, 10, () => 0.999);
    const passo1 = selecionarCelula(session, 0);
    const passo2 = selecionarCelula(passo1.session, 9);
    expect(passo2.resultado).toBe("invalida");
    expect(passo2.session.inicio).toBeNull();
  });

  it("encontra uma palavra de verdade colocada na grade e marca como encontrada", () => {
    // Grade pequena e controlada manualmente via sessão sintética, para não
    // depender de onde o gerador aleatório colocou a palavra.
    const tamanho = 4;
    const session = {
      puzzle: puzzleTeste,
      tamanho,
      // linha 0: F,É -> "FÉ" normalizado é "FE"
      grade: ["F", "E", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
      palavras: [{ normalizada: "FE", exibicao: "FÉ" }],
      encontradas: [],
      celulasEncontradas: [],
      inicio: null,
      concluido: false,
    };
    const passo1 = selecionarCelula(session, 0);
    const passo2 = selecionarCelula(passo1.session, 1);
    expect(passo2.resultado).toBe("puzzle_concluido");
    expect(passo2.session.encontradas).toEqual(["FE"]);
    expect(passo2.session.concluido).toBe(true);
  });

  it("aceita a palavra escrita de trás para frente", () => {
    const tamanho = 4;
    const session = {
      puzzle: puzzleTeste,
      tamanho,
      grade: ["E", "F", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
      palavras: [{ normalizada: "FE", exibicao: "FÉ" }],
      encontradas: [],
      celulasEncontradas: [],
      inicio: null,
      concluido: false,
    };
    const passo1 = selecionarCelula(session, 0);
    const passo2 = selecionarCelula(passo1.session, 1);
    expect(passo2.resultado).toBe("puzzle_concluido");
  });

  it("não permite mais seleções depois de concluído", () => {
    const tamanho = 4;
    const session = {
      puzzle: puzzleTeste,
      tamanho,
      grade: ["F", "E", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
      palavras: [{ normalizada: "FE", exibicao: "FÉ" }],
      encontradas: [],
      celulasEncontradas: [],
      inicio: null,
      concluido: false,
    };
    const passo1 = selecionarCelula(session, 0);
    const passo2 = selecionarCelula(passo1.session, 1);
    const passo3 = selecionarCelula(passo2.session, 2);
    expect(passo3.resultado).toBe("puzzle_concluido");
    expect(passo3.session).toEqual(passo2.session);
  });
});
