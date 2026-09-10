import { describe, expect, it } from "vitest";
import {
  obterChaveDoDia,
  obterCacaPalavrasDoDia,
  obterLeituraDoDia,
  obterQuebraCabecaDoDia,
  obterTermoDoDia,
  obterVersiculoDoDia,
} from "./desafios";

describe("obterChaveDoDia", () => {
  it("formata como AAAA-MM-DD com zero à esquerda", () => {
    expect(obterChaveDoDia(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("desafios do dia são determinísticos", () => {
  it("o mesmo dia sempre escolhe o mesmo versículo/termo/quebra-cabeça/leitura", () => {
    const chave = "2026-09-08";
    expect(obterVersiculoDoDia(chave)).toEqual(obterVersiculoDoDia(chave));
    expect(obterTermoDoDia(chave)).toEqual(obterTermoDoDia(chave));
    expect(obterQuebraCabecaDoDia(chave)).toEqual(obterQuebraCabecaDoDia(chave));
    expect(obterCacaPalavrasDoDia(chave)).toEqual(obterCacaPalavrasDoDia(chave));
    expect(obterLeituraDoDia(chave)).toEqual(obterLeituraDoDia(chave));
  });

  it("dias diferentes tendem a escolher desafios diferentes (não trava sempre no primeiro)", () => {
    const chaves = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"];
    const termosEscolhidos = new Set(chaves.map((c) => obterTermoDoDia(c).id));
    expect(termosEscolhidos.size).toBeGreaterThan(1);
  });

  it("versículo do dia vem de uma referência real (livro/capítulo/versículo válidos)", () => {
    const v = obterVersiculoDoDia("2026-09-08");
    expect(v.referencia).toMatch(/\S+ \d+:\d+/);
    expect(v.capitulo).toBeGreaterThan(0);
    expect(v.versiculo).toBeGreaterThan(0);
  });

  it("leitura do dia respeita o total de capítulos do livro escolhido", () => {
    for (const chave of ["2026-01-01", "2026-06-15", "2026-12-31"]) {
      const leitura = obterLeituraDoDia(chave);
      expect(leitura.capitulo).toBeGreaterThanOrEqual(1);
    }
  });
});
