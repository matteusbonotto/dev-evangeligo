import type { CategoriaAvatar, FundoAvatar } from "../types";

/**
 * Opções de customização do avatar (T-033), migradas de
 * `dev-pwa-biblia-game/public/game/assets/js/dados/opcoesAvataaars.js`
 * (parâmetros aceitos pela API pública https://avataaars.io/, biblioteca
 * "Avataaars" de Pablo Stanley, MIT). Valores em inglês (exigidos pela
 * API), rótulos traduzidos para português.
 */
export const CATEGORIAS_AVATAR: CategoriaAvatar[] = [
  {
    campo: "topType",
    label: "Cabelo",
    opcoes: [
      { valor: "NoHair", label: "Sem cabelo" },
      { valor: "LongHairBigHair", label: "Cabelo grande" },
      { valor: "LongHairBob", label: "Bob" },
      { valor: "LongHairBun", label: "Coque" },
      { valor: "LongHairCurly", label: "Cacheado" },
      { valor: "LongHairCurvy", label: "Ondulado" },
      { valor: "LongHairDreads", label: "Dreadlocks" },
      { valor: "LongHairFrida", label: "Estilo Frida" },
      { valor: "LongHairFro", label: "Black power" },
      { valor: "LongHairFroBand", label: "Black power com faixa" },
      { valor: "LongHairMiaWallace", label: "Mia Wallace" },
      { valor: "LongHairShavedSides", label: "Lateral raspada" },
      { valor: "LongHairStraight", label: "Liso longo" },
      { valor: "LongHairStraight2", label: "Liso longo 2" },
      { valor: "ShortHairDreads01", label: "Dread curto 1" },
      { valor: "ShortHairDreads02", label: "Dread curto 2" },
      { valor: "ShortHairFrizzle", label: "Crespo" },
      { valor: "ShortHairShaggyMullet", label: "Mullet" },
      { valor: "ShortHairShortCurly", label: "Curto cacheado" },
      { valor: "ShortHairShortFlat", label: "Curto liso" },
      { valor: "ShortHairShortRound", label: "Curto redondo" },
      { valor: "ShortHairShortWaved", label: "Curto ondulado" },
      { valor: "ShortHairSides", label: "Lados curtos" },
      { valor: "ShortHairTheCaesar", label: "Caesar" },
      { valor: "ShortHairTheCaesarSidePart", label: "Caesar com risca" },
    ],
  },
  {
    campo: "hairColor",
    label: "Cor do cabelo",
    opcoes: [
      { valor: "Auburn", label: "Ruivo", hex: "#a55728" },
      { valor: "Black", label: "Preto", hex: "#2c1810" },
      { valor: "Blonde", label: "Loiro", hex: "#e5c76b" },
      { valor: "BlondeGolden", label: "Loiro dourado", hex: "#f6cf57" },
      { valor: "Brown", label: "Castanho", hex: "#5c4033" },
      { valor: "BrownDark", label: "Castanho escuro", hex: "#4a3728" },
      { valor: "PastelPink", label: "Rosa pastel", hex: "#e8b4b8" },
      { valor: "Platinum", label: "Platina", hex: "#e8e4e0" },
      { valor: "Red", label: "Vermelho", hex: "#b55239" },
      { valor: "SilverGray", label: "Grisalho", hex: "#b2b2b2" },
    ],
  },
  {
    campo: "accessoriesType",
    label: "Acessórios",
    opcoes: [
      { valor: "Blank", label: "Nenhum" },
      { valor: "Kurt", label: "Kurt" },
      { valor: "Prescription01", label: "Óculos receita 1" },
      { valor: "Prescription02", label: "Óculos receita 2" },
      { valor: "Round", label: "Redondo" },
      { valor: "Sunglasses", label: "Óculos de sol" },
      { valor: "Wayfarers", label: "Wayfarers" },
    ],
  },
  {
    campo: "facialHairType",
    label: "Barba/Bigode",
    opcoes: [
      { valor: "Blank", label: "Nenhum" },
      { valor: "BeardLight", label: "Barba leve" },
      { valor: "BeardMedium", label: "Barba média" },
      { valor: "BeardMajestic", label: "Barba majestosa" },
      { valor: "MoustacheFancy", label: "Bigode fino" },
      { valor: "MoustacheMagnum", label: "Bigode magnum" },
    ],
  },
  {
    campo: "facialHairColor",
    label: "Cor da barba",
    opcoes: [
      { valor: "Auburn", label: "Ruivo", hex: "#a55728" },
      { valor: "Black", label: "Preto", hex: "#2c1810" },
      { valor: "Blonde", label: "Loiro", hex: "#e5c76b" },
      { valor: "BlondeGolden", label: "Loiro dourado", hex: "#f6cf57" },
      { valor: "Brown", label: "Castanho", hex: "#5c4033" },
      { valor: "BrownDark", label: "Castanho escuro", hex: "#4a3728" },
      { valor: "Platinum", label: "Platina", hex: "#e8e4e0" },
      { valor: "Red", label: "Vermelho", hex: "#b55239" },
      { valor: "SilverGray", label: "Grisalho", hex: "#b2b2b2" },
    ],
  },
  {
    campo: "clotheType",
    label: "Roupa",
    opcoes: [
      { valor: "BlazerShirt", label: "Blazer" },
      { valor: "BlazerSweater", label: "Blazer com suéter" },
      { valor: "CollarSweater", label: "Suéter com gola" },
      { valor: "GraphicShirt", label: "Camiseta estampada" },
      { valor: "Hoodie", label: "Moletom" },
      { valor: "Overall", label: "Macacão" },
      { valor: "ShirtCrewNeck", label: "Camiseta gola redonda" },
      { valor: "ShirtScoopNeck", label: "Camiseta gola canoa" },
      { valor: "ShirtVNeck", label: "Camiseta gola V" },
    ],
  },
  {
    campo: "clotheColor",
    label: "Cor da roupa",
    opcoes: [
      { valor: "Black", label: "Preto", hex: "#262e33" },
      { valor: "Blue01", label: "Azul claro", hex: "#65c9ff" },
      { valor: "Blue02", label: "Azul", hex: "#5199e4" },
      { valor: "Blue03", label: "Azul escuro", hex: "#25557c" },
      { valor: "Gray01", label: "Cinza claro", hex: "#e6e6e6" },
      { valor: "Gray02", label: "Cinza", hex: "#6d6d6d" },
      { valor: "Heather", label: "Mesclado", hex: "#c4c4c4" },
      { valor: "PastelBlue", label: "Azul pastel", hex: "#b1e2ff" },
      { valor: "PastelGreen", label: "Verde pastel", hex: "#a7ffc4" },
      { valor: "PastelOrange", label: "Laranja pastel", hex: "#ffdeb3" },
      { valor: "PastelRed", label: "Vermelho pastel", hex: "#ffafb9" },
      { valor: "PastelYellow", label: "Amarelo pastel", hex: "#ffffb1" },
      { valor: "Pink", label: "Rosa", hex: "#ff488e" },
      { valor: "Red", label: "Vermelho", hex: "#ff5c5c" },
      { valor: "White", label: "Branco", hex: "#ffffff" },
    ],
  },
  {
    campo: "eyeType",
    label: "Olhos",
    opcoes: [
      { valor: "Close", label: "Fechados" },
      { valor: "Cry", label: "Chorando" },
      { valor: "Default", label: "Padrão" },
      { valor: "Dizzy", label: "Tonto" },
      { valor: "EyeRoll", label: "Revirar" },
      { valor: "Happy", label: "Feliz" },
      { valor: "Hearts", label: "Corações" },
      { valor: "Side", label: "Lateral" },
      { valor: "Squint", label: "Apertados" },
      { valor: "Surprised", label: "Surpreso" },
      { valor: "Wink", label: "Piscadela" },
      { valor: "WinkWacky", label: "Piscadela maluca" },
    ],
  },
  {
    campo: "eyebrowType",
    label: "Sobrancelha",
    opcoes: [
      { valor: "Angry", label: "Raiva" },
      { valor: "AngryNatural", label: "Raiva natural" },
      { valor: "Default", label: "Padrão" },
      { valor: "DefaultNatural", label: "Padrão natural" },
      { valor: "FlatNatural", label: "Reto natural" },
      { valor: "FrownNatural", label: "Triste natural" },
      { valor: "RaisedExcited", label: "Levantada" },
      { valor: "RaisedExcitedNatural", label: "Levantada natural" },
      { valor: "SadConcerned", label: "Preocupada" },
      { valor: "SadConcernedNatural", label: "Preocupada natural" },
      { valor: "UnibrowNatural", label: "Unissex natural" },
      { valor: "UpDown", label: "Para cima/baixo" },
      { valor: "UpDownNatural", label: "Para cima/baixo natural" },
    ],
  },
  {
    campo: "mouthType",
    label: "Boca",
    opcoes: [
      { valor: "Concerned", label: "Preocupado" },
      { valor: "Default", label: "Padrão" },
      { valor: "Disbelief", label: "Descrença" },
      { valor: "Eating", label: "Comendo" },
      { valor: "Grimace", label: "Careta" },
      { valor: "Sad", label: "Triste" },
      { valor: "ScreamOpen", label: "Grito" },
      { valor: "Serious", label: "Sério" },
      { valor: "Smile", label: "Sorriso" },
      { valor: "Tongue", label: "Língua" },
      { valor: "Twinkle", label: "Piscadela" },
      { valor: "Vomit", label: "Enjoo" },
    ],
  },
  {
    campo: "skinColor",
    label: "Tom de pele",
    opcoes: [
      { valor: "Tanned", label: "Bronzeado", hex: "#e0b896" },
      { valor: "Yellow", label: "Amarelo", hex: "#f8d38c" },
      { valor: "Pale", label: "Pálido", hex: "#f2d5b8" },
      { valor: "Light", label: "Claro", hex: "#e8beac" },
      { valor: "Brown", label: "Moreno", hex: "#c68642" },
      { valor: "DarkBrown", label: "Moreno escuro", hex: "#8d5524" },
      { valor: "Black", label: "Negro", hex: "#5c3317" },
    ],
  },
];

/**
 * Fundos do avatar — subconjunto dos gradientes do legado (as variantes com
 * padrão SVG repetido, ex. "Noite"/"Bolhas", ficaram fora do escopo desta
 * versão para não introduzir HTML injetado a partir de dado externo).
 */
export const FUNDOS_AVATAR: FundoAvatar[] = [
  {
    valor: "verde-natural",
    label: "Natureza",
    gradient: "linear-gradient(135deg,#1a6640 0%,#4aaf78 60%,#6ee7a0 100%)",
  },
  {
    valor: "azul-safira",
    label: "Safira",
    gradient: "linear-gradient(135deg,#1e3a8a 0%,#3b82f6 60%,#93c5fd 100%)",
  },
  {
    valor: "roxo-royal",
    label: "Royal",
    gradient: "linear-gradient(135deg,#4c1d95 0%,#7c3aed 60%,#c4b5fd 100%)",
  },
  {
    valor: "rosa-petala",
    label: "Pétala",
    gradient: "linear-gradient(135deg,#9d174d 0%,#ec4899 60%,#fbcfe8 100%)",
  },
  {
    valor: "dourado",
    label: "Dourado",
    gradient: "linear-gradient(135deg,#78350f 0%,#d97706 60%,#fde68a 100%)",
  },
  {
    valor: "coral",
    label: "Coral",
    gradient: "linear-gradient(135deg,#9a3412 0%,#f97316 60%,#fed7aa 100%)",
  },
  {
    valor: "aurora",
    label: "Aurora",
    gradient: "linear-gradient(135deg,#064e3b 0%,#5b21b6 50%,#be185d 100%)",
  },
  {
    valor: "oceano",
    label: "Oceano",
    gradient: "linear-gradient(135deg,#0c4a6e 0%,#0284c7 55%,#38bdf8 100%)",
  },
  {
    valor: "cinza",
    label: "Cinza",
    gradient: "linear-gradient(135deg,#374151 0%,#6b7280 55%,#9ca3af 100%)",
  },
  {
    valor: "claro",
    label: "Claro",
    gradient: "linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)",
  },
];

export function getFundoByValor(valor: string): FundoAvatar {
  return FUNDOS_AVATAR.find((f) => f.valor === valor) ?? FUNDOS_AVATAR[0];
}
