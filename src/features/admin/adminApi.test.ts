import { describe, expect, it } from "vitest";
import {
  definirRoleUsuario,
  excluirAulaCatalogo,
  excluirConquistaCatalogo,
  excluirMissaoCatalogo,
  excluirQuizCatalogo,
  excluirTrilhaCatalogo,
  listarAulasCatalogo,
  listarConquistasCatalogo,
  listarMissoesCatalogo,
  listarQuizzesCatalogo,
  listarTrilhasCatalogo,
  listarUsuarios,
  salvarAulaCatalogo,
  salvarConquistaCatalogo,
  salvarMissaoCatalogo,
  salvarQuizCatalogo,
  salvarTrilhaCatalogo,
} from "./adminApi";

/**
 * Sem Supabase configurado no ambiente de teste (`test.env`, ver
 * `vite.config.ts`) — toda função precisa falhar com uma mensagem clara em
 * vez de lançar um erro genérico de `null` (mesmo padrão de
 * `authentication/lgpd.test.ts`). Cobertura de integração real contra o
 * banco fica para verificação manual pós-deploy (ver ADR-054).
 */
describe("adminApi sem Supabase configurado", () => {
  it("listarUsuarios lança erro claro", async () => {
    await expect(listarUsuarios()).rejects.toThrow("Supabase não configurado.");
  });

  it("definirRoleUsuario lança erro claro", async () => {
    await expect(definirRoleUsuario("id", "admin")).rejects.toThrow(
      "Supabase não configurado.",
    );
  });

  it("listarConquistasCatalogo lança erro claro", async () => {
    await expect(listarConquistasCatalogo()).rejects.toThrow("Supabase não configurado.");
  });

  it("salvarConquistaCatalogo lança erro claro", async () => {
    await expect(
      salvarConquistaCatalogo({
        id: "x",
        titulo: "x",
        descricao: "x",
        raridade: "comum",
        reward_xp: 0,
        reward_gold: 0,
        ativo: true,
      }),
    ).rejects.toThrow("Supabase não configurado.");
  });

  it("excluirConquistaCatalogo lança erro claro", async () => {
    await expect(excluirConquistaCatalogo("x")).rejects.toThrow("Supabase não configurado.");
  });

  it("listarMissoesCatalogo lança erro claro", async () => {
    await expect(listarMissoesCatalogo()).rejects.toThrow("Supabase não configurado.");
  });

  it("salvarMissaoCatalogo lança erro claro", async () => {
    await expect(
      salvarMissaoCatalogo({
        id: "x",
        tipo: "tarefa",
        titulo: "x",
        descricao: "x",
        cadencia: "diaria",
        meta: 1,
        reward_xp: 0,
        reward_gold: 0,
        ativo: true,
      }),
    ).rejects.toThrow("Supabase não configurado.");
  });

  it("excluirMissaoCatalogo lança erro claro", async () => {
    await expect(excluirMissaoCatalogo("x")).rejects.toThrow("Supabase não configurado.");
  });

  it("listarTrilhasCatalogo lança erro claro", async () => {
    await expect(listarTrilhasCatalogo()).rejects.toThrow("Supabase não configurado.");
  });

  it("salvarTrilhaCatalogo lança erro claro", async () => {
    await expect(
      salvarTrilhaCatalogo({
        id: "x",
        slug: "x",
        order: 1,
        title: "x",
        description: "x",
        verse_focus: "",
        ativo: true,
      }),
    ).rejects.toThrow("Supabase não configurado.");
  });

  it("excluirTrilhaCatalogo lança erro claro", async () => {
    await expect(excluirTrilhaCatalogo("x")).rejects.toThrow("Supabase não configurado.");
  });

  it("listarAulasCatalogo lança erro claro", async () => {
    await expect(listarAulasCatalogo()).rejects.toThrow("Supabase não configurado.");
  });

  it("salvarAulaCatalogo lança erro claro", async () => {
    await expect(
      salvarAulaCatalogo({
        id: "x",
        trilha_id: "x",
        order: 1,
        title: "x",
        summary: "x",
        bible_references: JSON.stringify([
          { book: "Romanos", chapter: 1, verseStart: 16, display: "Romanos 1:16" },
          { book: "Romanos", chapter: 1, verseStart: 17, display: "Romanos 1:17" },
        ]),
        estimated_minutes: 5,
        quiz_id: "",
        ativo: true,
      }),
    ).rejects.toThrow("Supabase não configurado.");
  });

  it("excluirAulaCatalogo lança erro claro", async () => {
    await expect(excluirAulaCatalogo("x")).rejects.toThrow("Supabase não configurado.");
  });

  it("listarQuizzesCatalogo lança erro claro", async () => {
    await expect(listarQuizzesCatalogo()).rejects.toThrow("Supabase não configurado.");
  });

  it("salvarQuizCatalogo lança erro claro (checa Supabase antes de validar o JSON)", async () => {
    await expect(
      salvarQuizCatalogo({
        id: "x",
        aula_id: "",
        title: "x",
        questions: JSON.stringify([
          {
            type: "verdadeiro_falso",
            id: "q1",
            prompt: "x",
            explanation: "x",
            bibleReference: { book: "Romanos", chapter: 1, verseStart: 16, display: "Romanos 1:16" },
            correctAnswer: true,
          },
        ]),
        ativo: true,
      }),
    ).rejects.toThrow("Supabase não configurado.");
  });

  it("excluirQuizCatalogo lança erro claro", async () => {
    await expect(excluirQuizCatalogo("x")).rejects.toThrow("Supabase não configurado.");
  });
});
