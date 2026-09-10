import type { AvatarConfig } from "./types";

/**
 * Configuração padrão do avatar (T-033), migrada de
 * `apiAvataaars.js` do legado (`CONFIG_AVATAR_PADRAO`).
 */
export const CONFIG_AVATAR_PADRAO: AvatarConfig = {
  topType: "LongHairStraight",
  accessoriesType: "Blank",
  hairColor: "BrownDark",
  facialHairType: "Blank",
  facialHairColor: "BrownDark",
  clotheType: "Hoodie",
  clotheColor: "Black",
  eyeType: "Default",
  eyebrowType: "Default",
  mouthType: "Default",
  skinColor: "Light",
  fundo: "verde-natural",
};

/**
 * Monta a URL pública da API Avataaars (https://avataaars.io/) a partir da
 * configuração escolhida — mesma técnica do legado (`montarUrlAvataaars`):
 * a imagem é gerada por um serviço externo gratuito (MIT), sem precisar
 * embutir milhares de partes SVG no bundle. `avatarStyle=Transparent`
 * sempre, para o fundo (`fundo`, aplicado via CSS, ver `data/opcoesAvatar.ts`)
 * aparecer por trás.
 */
export function montarUrlAvatar(config: AvatarConfig): string {
  const params = new URLSearchParams({
    avatarStyle: "Transparent",
    topType: config.topType,
    accessoriesType: config.accessoriesType,
    hairColor: config.hairColor,
    facialHairType: config.facialHairType,
    facialHairColor: config.facialHairColor,
    clotheType: config.clotheType,
    clotheColor: config.clotheColor,
    eyeType: config.eyeType,
    eyebrowType: config.eyebrowType,
    mouthType: config.mouthType,
    skinColor: config.skinColor,
  });
  return `https://avataaars.io/?${params.toString()}`;
}
