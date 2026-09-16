import { beforeEach, describe, expect, it } from "vitest";
import {
  definirPreferenciaNotificacoes,
  definirPreferenciaVLibras,
  obterPreferenciaNotificacoes,
  obterPreferenciaVLibras,
} from "./preferencias";

beforeEach(() => {
  localStorage.clear();
});

describe("preferência do VLibras", () => {
  it("vem HABILITADA por padrão (comportamento de sempre, sem preferência salva)", () => {
    expect(obterPreferenciaVLibras()).toBe(true);
  });

  it("respeita a preferência salva de desligar", () => {
    definirPreferenciaVLibras(false);
    expect(obterPreferenciaVLibras()).toBe(false);
  });

  it("respeita a preferência salva de religar", () => {
    definirPreferenciaVLibras(false);
    definirPreferenciaVLibras(true);
    expect(obterPreferenciaVLibras()).toBe(true);
  });
});

describe("preferência de notificações", () => {
  it("vem DESLIGADA por padrão (precisa de permissão explícita do navegador)", () => {
    expect(obterPreferenciaNotificacoes()).toBe(false);
  });

  it("respeita a preferência salva de ligar", () => {
    definirPreferenciaNotificacoes(true);
    expect(obterPreferenciaNotificacoes()).toBe(true);
  });
});
