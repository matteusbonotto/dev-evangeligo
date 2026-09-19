import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  baixarComoJson,
  emailConfirmaExclusao,
  excluirMinhaConta,
  exportarMeusDados,
} from "./lgpd";

describe("emailConfirmaExclusao", () => {
  it("confirma quando o e-mail digitado bate exatamente", () => {
    expect(emailConfirmaExclusao("ana@exemplo.com", "ana@exemplo.com")).toBe(true);
  });

  it("ignora maiúsculas/minúsculas e espaços nas pontas", () => {
    expect(emailConfirmaExclusao("  Ana@Exemplo.com ", "ana@exemplo.com")).toBe(true);
  });

  it("não confirma com e-mail diferente", () => {
    expect(emailConfirmaExclusao("outra@exemplo.com", "ana@exemplo.com")).toBe(false);
  });

  it("não confirma com campo vazio", () => {
    expect(emailConfirmaExclusao("", "ana@exemplo.com")).toBe(false);
  });
});

describe("baixarComoJson", () => {
  // jsdom não implementa URL.createObjectURL/revokeObjectURL.
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:mock-url");
    URL.revokeObjectURL = vi.fn();
    // jsdom tenta navegar de verdade ao clicar num <a href="blob:...">
    // (não implementado, só gera ruído no console) — sem efeito no teste.
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("cria e remove um link de download sem lançar erro", () => {
    expect(() => baixarComoJson({ a: 1 }, "dados.json")).not.toThrow();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});

describe("exportarMeusDados / excluirMinhaConta sem Supabase configurado", () => {
  it("exportarMeusDados lança erro claro quando não há Supabase configurado (ambiente de teste)", async () => {
    await expect(exportarMeusDados()).rejects.toThrow("Supabase não configurado.");
  });

  it("excluirMinhaConta lança erro claro quando não há Supabase configurado (ambiente de teste)", async () => {
    await expect(excluirMinhaConta()).rejects.toThrow("Supabase não configurado.");
  });
});
