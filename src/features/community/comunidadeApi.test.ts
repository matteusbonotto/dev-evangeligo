import { describe, expect, it } from "vitest";
import {
  buscarUsuariosParaAmizade,
  convidarParaMissaoColaborativa,
  enviarMensagem,
  enviarSolicitacaoAmizade,
  listarAmigos,
  listarMensagens,
  listarSolicitacoesPendentes,
  responderSolicitacaoAmizade,
} from "./comunidadeApi";

/**
 * Sem Supabase configurado no ambiente de teste — toda função precisa
 * falhar com uma mensagem clara (mesmo padrão de `authentication/lgpd.ts`/
 * `admin/adminApi.ts`).
 */
describe("comunidadeApi sem Supabase configurado", () => {
  it("buscarUsuariosParaAmizade lança erro claro", async () => {
    await expect(buscarUsuariosParaAmizade("ana")).rejects.toThrow("Supabase não configurado.");
  });

  it("enviarSolicitacaoAmizade lança erro claro", async () => {
    await expect(enviarSolicitacaoAmizade("id")).rejects.toThrow("Supabase não configurado.");
  });

  it("responderSolicitacaoAmizade lança erro claro", async () => {
    await expect(responderSolicitacaoAmizade("id", true)).rejects.toThrow(
      "Supabase não configurado.",
    );
  });

  it("listarAmigos lança erro claro", async () => {
    await expect(listarAmigos()).rejects.toThrow("Supabase não configurado.");
  });

  it("listarSolicitacoesPendentes lança erro claro", async () => {
    await expect(listarSolicitacoesPendentes()).rejects.toThrow("Supabase não configurado.");
  });

  it("listarMensagens lança erro claro", async () => {
    await expect(listarMensagens("a", "b")).rejects.toThrow("Supabase não configurado.");
  });

  it("enviarMensagem lança erro claro", async () => {
    await expect(enviarMensagem("a", "b", "oi")).rejects.toThrow("Supabase não configurado.");
  });

  it("convidarParaMissaoColaborativa lança erro claro", async () => {
    await expect(convidarParaMissaoColaborativa("modelo", "b")).rejects.toThrow(
      "Supabase não configurado.",
    );
  });
});
