import { describe, expect, it } from "vitest";
import { CONFIG_AVATAR_PADRAO, montarUrlAvatar } from "./avatarUrl";

describe("montarUrlAvatar", () => {
  it("monta a URL base da API avataaars.io", () => {
    const url = montarUrlAvatar(CONFIG_AVATAR_PADRAO);
    expect(url.startsWith("https://avataaars.io/?")).toBe(true);
  });

  it("sempre usa avatarStyle=Transparent (o fundo é aplicado via CSS)", () => {
    const url = montarUrlAvatar(CONFIG_AVATAR_PADRAO);
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("avatarStyle")).toBe("Transparent");
  });

  it("inclui todos os parâmetros de customização na URL", () => {
    const url = montarUrlAvatar(CONFIG_AVATAR_PADRAO);
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("topType")).toBe(CONFIG_AVATAR_PADRAO.topType);
    expect(params.get("hairColor")).toBe(CONFIG_AVATAR_PADRAO.hairColor);
    expect(params.get("clotheType")).toBe(CONFIG_AVATAR_PADRAO.clotheType);
    expect(params.get("skinColor")).toBe(CONFIG_AVATAR_PADRAO.skinColor);
  });

  it("não inclui o campo 'fundo' como parâmetro da API (é só um id local)", () => {
    const url = montarUrlAvatar(CONFIG_AVATAR_PADRAO);
    expect(url).not.toContain("fundo=");
  });

  it("reflete uma mudança de configuração na URL gerada", () => {
    const custom = {
      ...CONFIG_AVATAR_PADRAO,
      topType: "NoHair",
      skinColor: "DarkBrown",
    };
    const url = montarUrlAvatar(custom);
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("topType")).toBe("NoHair");
    expect(params.get("skinColor")).toBe("DarkBrown");
  });
});
