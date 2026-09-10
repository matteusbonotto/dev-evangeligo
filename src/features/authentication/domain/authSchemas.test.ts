import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./authSchemas";

describe("signInSchema", () => {
  it("aceita e-mail e senha válidos", () => {
    const result = signInSchema.safeParse({
      email: "usuario@exemplo.com",
      password: "qualquer-coisa",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = signInSchema.safeParse({
      email: "nao-e-email",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const result = signInSchema.safeParse({
      email: "usuario@exemplo.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("signUpSchema", () => {
  const validPayload = {
    nome: "Maria",
    sobrenome: "Silva",
    email: "maria@exemplo.com",
    password: "Senha123",
    confirmPassword: "Senha123",
    aceitaTermos: true,
    aceitaPrivacidade: true,
  };

  it("aceita um cadastro completo e válido", () => {
    const result = signUpSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejeita senha sem letra maiúscula", () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      password: "senha123",
      confirmPassword: "senha123",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha sem número", () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      password: "SenhaSenha",
      confirmPassword: "SenhaSenha",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha curta demais", () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      password: "Ab1",
      confirmPassword: "Ab1",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quando as senhas não coincidem", () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      confirmPassword: "Outra123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("confirmPassword"),
      );
      expect(issue?.message).toBe("As senhas não coincidem.");
    }
  });

  it("rejeita quando os termos de uso não são aceitos", () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      aceitaTermos: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quando a política de privacidade não é aceita", () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      aceitaPrivacidade: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome com um único caractere", () => {
    const result = signUpSchema.safeParse({ ...validPayload, nome: "A" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("aceita e-mail válido", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "usuario@exemplo.com" }).success,
    ).toBe(true);
  });

  it("rejeita e-mail vazio", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("aceita quando as senhas coincidem e são fortes", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NovaSenha1",
      confirmPassword: "NovaSenha1",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita quando as senhas não coincidem", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NovaSenha1",
      confirmPassword: "Diferente1",
    });
    expect(result.success).toBe(false);
  });
});
