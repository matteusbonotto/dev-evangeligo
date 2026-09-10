/**
 * Tipos do editor de avatar (T-033). Usa o mesmo esquema de parâmetros do
 * app legado — a biblioteca "Avataaars" (avataaars.io, MIT), acessada via
 * URL pública (`avatarUrl.ts`), sem precisar embutir SVGs no bundle.
 */
export interface AvatarConfig {
  topType: string;
  accessoriesType: string;
  hairColor: string;
  facialHairType: string;
  facialHairColor: string;
  clotheType: string;
  clotheColor: string;
  eyeType: string;
  eyebrowType: string;
  mouthType: string;
  skinColor: string;
  /** Id do fundo (`data/opcoesAvatar.ts`, `FUNDOS_AVATAR`), não é parâmetro do avataaars.io. */
  fundo: string;
}

export interface OpcaoAvatar {
  valor: string;
  label: string;
  /** Cor aproximada para exibir como swatch, quando aplicável (cabelo, roupa, pele). */
  hex?: string;
}

export interface FundoAvatar {
  valor: string;
  label: string;
  gradient: string;
}

/** Uma categoria de customização (ex.: "Cabelo") e suas opções selecionáveis. */
export interface CategoriaAvatar {
  campo: keyof Omit<AvatarConfig, "fundo">;
  label: string;
  opcoes: OpcaoAvatar[];
}
