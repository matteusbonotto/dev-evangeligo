import { beforeEach, describe, expect, it } from "vitest";
import {
  obterTraducaoPreferida,
  salvarTraducaoPreferida,
} from "./traducaoPreferida";

beforeEach(() => {
  localStorage.clear();
});

describe("obterTraducaoPreferida / salvarTraducaoPreferida", () => {
  it("retorna 'livre' (Bíblia Livre) quando nada foi salvo — padrão pedido pelo usuário", () => {
    expect(obterTraducaoPreferida()).toBe("livre");
  });

  it("persiste e recupera a tradução escolhida", () => {
    salvarTraducaoPreferida("arib");
    expect(obterTraducaoPreferida()).toBe("arib");
  });

  it("ignora um valor salvo inválido e cai no padrão", () => {
    localStorage.setItem("evangeligo:biblia:traducaoAtiva", "klingon");
    expect(obterTraducaoPreferida()).toBe("livre");
  });
});
