import { describe, expect, it } from "vitest";
import {
  authUnavailableMessage,
  translateAuthError,
} from "./authErrorMessages";

describe("translateAuthError", () => {
  it("traduz credenciais inválidas", () => {
    expect(translateAuthError({ message: "Invalid login credentials" })).toBe(
      "E-mail ou senha incorretos.",
    );
  });

  it("traduz e-mail já cadastrado", () => {
    expect(translateAuthError({ message: "User already registered" })).toBe(
      "Já existe uma conta com este e-mail.",
    );
  });

  it("traduz e-mail não confirmado", () => {
    expect(translateAuthError({ message: "Email not confirmed" })).toBe(
      "Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).",
    );
  });

  it("traduz limite de tentativas", () => {
    expect(
      translateAuthError({ message: "Too many requests, rate limit hit" }),
    ).toBe("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
  });

  it("aceita erro como string simples", () => {
    expect(translateAuthError("Network error")).toBe(
      "Falha de conexão. Verifique sua internet e tente novamente.",
    );
  });

  it("usa mensagem genérica para erro desconhecido", () => {
    expect(translateAuthError({ message: "algo inesperado do provedor" })).toBe(
      "Não foi possível concluir a operação. Tente novamente.",
    );
  });

  it("usa mensagem genérica para entrada vazia/nula", () => {
    expect(translateAuthError(null)).toBe(
      "Não foi possível concluir a operação. Tente novamente.",
    );
    expect(translateAuthError(undefined)).toBe(
      "Não foi possível concluir a operação. Tente novamente.",
    );
  });

  it("nunca inclui a mensagem original de erro na saída (não vaza detalhes internos)", () => {
    const original = "pgbouncer: relation auth.users conflict at row 42";
    const translated = translateAuthError({ message: original });
    expect(translated).not.toContain(original);
  });
});

describe("authUnavailableMessage", () => {
  it("retorna mensagem estável orientando o modo de demonstração", () => {
    expect(authUnavailableMessage()).toContain("demonstração");
  });
});
