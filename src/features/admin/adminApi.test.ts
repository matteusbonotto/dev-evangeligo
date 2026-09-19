import { describe, expect, it } from "vitest";
import {
  definirRoleUsuario,
  excluirConquistaCatalogo,
  excluirMissaoCatalogo,
  listarConquistasCatalogo,
  listarMissoesCatalogo,
  listarUsuarios,
  salvarConquistaCatalogo,
  salvarMissaoCatalogo,
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
});
