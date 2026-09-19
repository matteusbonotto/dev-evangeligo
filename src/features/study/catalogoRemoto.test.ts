import { describe, expect, it } from "vitest";
import {
  listarAulasAdicionais,
  listarQuizzesAdicionais,
  listarTrilhasAdicionais,
} from "./catalogoRemoto";

/**
 * Sem Supabase configurado no ambiente de teste — toda função deve
 * devolver lista vazia SEM lançar, pra `TrilhasPage`/`AulaPage`/`QuizPage`
 * continuarem funcionando só com o conteúdo estático (mesmo padrão de
 * `authentication/lgpd.ts`, mas aqui a falta de Supabase é um estado
 * normal, não um erro — modo demonstração nunca teve estas tabelas).
 */
describe("catalogoRemoto sem Supabase configurado", () => {
  it("listarTrilhasAdicionais devolve lista vazia", async () => {
    await expect(listarTrilhasAdicionais()).resolves.toEqual([]);
  });

  it("listarAulasAdicionais devolve lista vazia", async () => {
    await expect(listarAulasAdicionais()).resolves.toEqual([]);
  });

  it("listarQuizzesAdicionais devolve lista vazia", async () => {
    await expect(listarQuizzesAdicionais()).resolves.toEqual([]);
  });
});
