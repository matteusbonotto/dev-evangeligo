import { describe, expect, it } from "vitest";
import {
  ESTADOS_CIVIS,
  OBJETIVOS,
  ONBOARDING_TOTAL_PASSOS,
  estadoCivilSchema,
  nascimentoSchema,
  objetivoSchema,
  passoBoasVindasSchema,
  passoEstadoCivilSchema,
  passoNomeSchema,
  passoObjetivoSchema,
  passoSenhaSchema,
} from "./onboardingSchemas";

describe("nascimentoSchema (opcional)", () => {
  it("aceita string vazia (passo pulado)", () => {
    expect(nascimentoSchema.safeParse("").success).toBe(true);
  });

  it("aceita uma data válida no passado", () => {
    expect(nascimentoSchema.safeParse("1990-05-20").success).toBe(true);
  });

  it("rejeita uma data no futuro", () => {
    const futuro = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
    const iso = futuro.toISOString().slice(0, 10);
    expect(nascimentoSchema.safeParse(iso).success).toBe(false);
  });

  it("rejeita uma data anterior a 1900", () => {
    expect(nascimentoSchema.safeParse("1850-01-01").success).toBe(false);
  });

  it("rejeita texto que não é data", () => {
    expect(nascimentoSchema.safeParse("não é uma data").success).toBe(false);
  });
});

describe("estadoCivilSchema (opcional)", () => {
  it("aceita string vazia (passo pulado)", () => {
    expect(estadoCivilSchema.safeParse("").success).toBe(true);
  });

  it("aceita qualquer valor da lista ESTADOS_CIVIS", () => {
    for (const { valor } of ESTADOS_CIVIS) {
      expect(estadoCivilSchema.safeParse(valor).success).toBe(true);
    }
  });

  it("rejeita um valor fora da lista", () => {
    expect(estadoCivilSchema.safeParse("inventado").success).toBe(false);
  });
});

describe("objetivoSchema (obrigatório)", () => {
  it("rejeita string vazia — diferente dos outros passos opcionais", () => {
    expect(objetivoSchema.safeParse("").success).toBe(false);
  });

  it("aceita qualquer valor da lista OBJETIVOS", () => {
    for (const { valor } of OBJETIVOS) {
      expect(objetivoSchema.safeParse(valor).success).toBe(true);
    }
  });

  it("rejeita um valor fora da lista", () => {
    expect(objetivoSchema.safeParse("inventado").success).toBe(false);
  });
});

describe("passoBoasVindasSchema", () => {
  it("exige aceitar termos e privacidade", () => {
    const result = passoBoasVindasSchema.safeParse({
      aceitaTermos: false,
      aceitaPrivacidade: false,
    });
    expect(result.success).toBe(false);
  });

  it("aceita quando os dois estão marcados", () => {
    const result = passoBoasVindasSchema.safeParse({
      aceitaTermos: true,
      aceitaPrivacidade: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("passoNomeSchema", () => {
  it("sobrenome é opcional", () => {
    const result = passoNomeSchema.safeParse({ nome: "Maria", sobrenome: "" });
    expect(result.success).toBe(true);
  });

  it("nome é obrigatório", () => {
    const result = passoNomeSchema.safeParse({ nome: "", sobrenome: "" });
    expect(result.success).toBe(false);
  });
});

describe("passoSenhaSchema", () => {
  it("rejeita quando as senhas não coincidem", () => {
    const result = passoSenhaSchema.safeParse({
      password: "Senha123",
      confirmPassword: "Outra123",
    });
    expect(result.success).toBe(false);
  });

  it("aceita quando as senhas coincidem e são fortes", () => {
    const result = passoSenhaSchema.safeParse({
      password: "Senha123",
      confirmPassword: "Senha123",
    });
    expect(result.success).toBe(true);
  });
});

describe("passoEstadoCivilSchema / passoObjetivoSchema", () => {
  it("passo de estado civil aceita vazio (opcional)", () => {
    expect(
      passoEstadoCivilSchema.safeParse({ estadoCivil: "" }).success,
    ).toBe(true);
  });

  it("passo de objetivo rejeita vazio (obrigatório)", () => {
    expect(passoObjetivoSchema.safeParse({ objetivo: "" }).success).toBe(
      false,
    );
  });
});

describe("ONBOARDING_TOTAL_PASSOS", () => {
  it("são 7 passos, um por schema", () => {
    expect(ONBOARDING_TOTAL_PASSOS).toBe(7);
  });
});
