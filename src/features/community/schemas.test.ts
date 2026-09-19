import { describe, expect, it } from "vitest";
import { calcularConversaId, mensagemSchema, usuarioBuscaSchema } from "./schemas";

describe("calcularConversaId", () => {
  it("é simétrico (mesma conversa não importa a ordem dos argumentos)", () => {
    expect(calcularConversaId("a", "b")).toBe(calcularConversaId("b", "a"));
  });

  it("gera valores diferentes pra pares diferentes", () => {
    expect(calcularConversaId("a", "b")).not.toBe(calcularConversaId("a", "c"));
  });
});

describe("usuarioBuscaSchema", () => {
  it("aceita avatar_config nulo", () => {
    expect(() =>
      usuarioBuscaSchema.parse({ id: "1", nome: "Ana", sobrenome: "Silva", avatar_config: null }),
    ).not.toThrow();
  });
});

describe("mensagemSchema", () => {
  const valida = {
    id: "1",
    conversa_id: "a:b",
    remetente_id: "a",
    destinatario_id: "b",
    conteudo: "Oi!",
    lida: false,
    created_at: "2026-09-19T00:00:00.000Z",
  };

  it("aceita uma mensagem válida", () => {
    expect(() => mensagemSchema.parse(valida)).not.toThrow();
  });

  it("rejeita conteúdo vazio", () => {
    expect(mensagemSchema.safeParse({ ...valida, conteudo: "" }).success).toBe(false);
  });

  it("rejeita conteúdo maior que 2000 caracteres", () => {
    expect(
      mensagemSchema.safeParse({ ...valida, conteudo: "a".repeat(2001) }).success,
    ).toBe(false);
  });
});
