import { describe, expect, it } from "vitest";
import { conquistaFormSchema, missaoFormSchema, usuarioAdminSchema } from "./schemas";

describe("conquistaFormSchema", () => {
  const valido = {
    id: "primeiro-passo",
    titulo: "Primeiro Passo",
    descricao: "Concluiu sua primeira aula.",
    raridade: "comum" as const,
    reward_xp: 10,
    reward_gold: 5,
    ativo: true,
  };

  it("aceita um formulário válido", () => {
    expect(() => conquistaFormSchema.parse(valido)).not.toThrow();
  });

  it("rejeita id com espaço ou maiúscula", () => {
    expect(conquistaFormSchema.safeParse({ ...valido, id: "Primeiro Passo" }).success).toBe(
      false,
    );
  });

  it("rejeita título vazio", () => {
    expect(conquistaFormSchema.safeParse({ ...valido, titulo: "" }).success).toBe(false);
  });

  it("rejeita reward_xp negativo", () => {
    expect(conquistaFormSchema.safeParse({ ...valido, reward_xp: -1 }).success).toBe(false);
  });

  it("rejeita raridade fora do enum", () => {
    expect(conquistaFormSchema.safeParse({ ...valido, raridade: "mitico" }).success).toBe(
      false,
    );
  });
});

describe("missaoFormSchema", () => {
  const valido = {
    id: "tarefa-leitura-biblica",
    tipo: "tarefa" as const,
    titulo: "Leitura Bíblica",
    descricao: "Leia um trecho da Bíblia hoje.",
    cadencia: "diaria" as const,
    meta: 1,
    reward_xp: 20,
    reward_gold: 10,
    ativo: true,
  };

  it("aceita um formulário válido", () => {
    expect(() => missaoFormSchema.parse(valido)).not.toThrow();
  });

  it("rejeita meta zero ou negativa", () => {
    expect(missaoFormSchema.safeParse({ ...valido, meta: 0 }).success).toBe(false);
  });

  it("rejeita tipo fora do enum", () => {
    expect(missaoFormSchema.safeParse({ ...valido, tipo: "inexistente" }).success).toBe(false);
  });
});

describe("usuarioAdminSchema", () => {
  it("aceita um usuário válido com email nulo", () => {
    const usuario = {
      id: "11111111-1111-1111-1111-111111111111",
      email: null,
      nome: "Ana",
      sobrenome: "Silva",
      role: "user" as const,
      created_at: "2026-09-19T00:00:00.000Z",
    };
    expect(() => usuarioAdminSchema.parse(usuario)).not.toThrow();
  });
});
