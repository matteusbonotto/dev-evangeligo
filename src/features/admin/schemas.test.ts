import { describe, expect, it } from "vitest";
import {
  aulaFormSchema,
  conquistaFormSchema,
  missaoFormSchema,
  quizFormSchema,
  trilhaFormSchema,
  usuarioAdminSchema,
} from "./schemas";

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

describe("trilhaFormSchema", () => {
  const valido = {
    id: "nova-trilha",
    slug: "nova-trilha",
    order: 6,
    title: "Nova Trilha",
    description: "Descrição.",
    verse_focus: "",
    ativo: true,
  };

  it("aceita um formulário válido (verse_focus vazio permitido)", () => {
    expect(() => trilhaFormSchema.parse(valido)).not.toThrow();
  });

  it("rejeita slug com maiúscula ou espaço", () => {
    expect(trilhaFormSchema.safeParse({ ...valido, slug: "Nova Trilha" }).success).toBe(false);
  });

  it("rejeita order não positivo", () => {
    expect(trilhaFormSchema.safeParse({ ...valido, order: 0 }).success).toBe(false);
  });
});

describe("aulaFormSchema", () => {
  const valido = {
    id: "nova-aula",
    trilha_id: "solas",
    order: 1,
    title: "Nova Aula",
    summary: "Resumo.",
    bible_references: "[]",
    estimated_minutes: 5,
    quiz_id: "",
    ativo: true,
  };

  it("aceita um formulário válido (a validação do JSON de referências acontece em adminApi, não aqui)", () => {
    expect(() => aulaFormSchema.parse(valido)).not.toThrow();
  });

  it("rejeita bible_references vazio (string)", () => {
    expect(aulaFormSchema.safeParse({ ...valido, bible_references: "" }).success).toBe(false);
  });

  it("rejeita estimated_minutes não positivo", () => {
    expect(aulaFormSchema.safeParse({ ...valido, estimated_minutes: 0 }).success).toBe(false);
  });
});

describe("quizFormSchema", () => {
  const valido = {
    id: "novo-quiz",
    aula_id: "",
    title: "Novo Quiz",
    questions: "[]",
    ativo: true,
  };

  it("aceita um formulário válido", () => {
    expect(() => quizFormSchema.parse(valido)).not.toThrow();
  });

  it("rejeita id com maiúscula", () => {
    expect(quizFormSchema.safeParse({ ...valido, id: "Novo Quiz" }).success).toBe(false);
  });

  it("rejeita questions vazio (string)", () => {
    expect(quizFormSchema.safeParse({ ...valido, questions: "" }).success).toBe(false);
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
