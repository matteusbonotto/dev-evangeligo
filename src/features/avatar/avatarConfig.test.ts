import { beforeEach, describe, expect, it } from "vitest";
import {
  obterConfigAvatar,
  salvarConfigAvatar,
  temAvatarCustomizado,
} from "./avatarConfig";
import { CONFIG_AVATAR_PADRAO } from "./avatarUrl";

beforeEach(() => {
  localStorage.clear();
});

describe("obterConfigAvatar", () => {
  it("retorna a configuração padrão quando nada foi salvo", () => {
    expect(obterConfigAvatar()).toEqual(CONFIG_AVATAR_PADRAO);
  });

  it("retorna a configuração salva", () => {
    const custom = { ...CONFIG_AVATAR_PADRAO, topType: "NoHair" };
    salvarConfigAvatar(custom);
    expect(obterConfigAvatar()).toEqual(custom);
  });
});

describe("temAvatarCustomizado", () => {
  it("false antes de qualquer customização", () => {
    expect(temAvatarCustomizado()).toBe(false);
  });

  it("true depois de salvar uma configuração (mesmo que igual à padrão)", () => {
    salvarConfigAvatar(CONFIG_AVATAR_PADRAO);
    expect(temAvatarCustomizado()).toBe(true);
  });
});
