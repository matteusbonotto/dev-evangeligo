import { BsBookHalf, BsEnvelopeFill, BsMegaphoneFill } from "react-icons/bs";
import { GiCrossMark, GiFeather, GiQuillInk, GiScrollUnfurled } from "react-icons/gi";
import type { IconType } from "react-icons";
import type { Grupo } from "../types";

/**
 * Ícone + rótulo por extenso de cada categoria temática (`Grupo`, já
 * existente em `types.ts`/`livros.ts`) — pedido explícito do usuário: um
 * ícone no canto do cartão do livro pra "identificar o que é epístola,
 * evangelho, torá etc" (T-052/ADR-045, item 11). Nunca só visual — todo uso
 * carrega `rotulo` em `title`/`aria-label`.
 */
export const CATEGORIAS_LIVRO: Record<
  Grupo,
  { icone: IconType; rotulo: string }
> = {
  lei: { icone: GiScrollUnfurled, rotulo: "Lei (Torá)" },
  historia: { icone: BsBookHalf, rotulo: "Histórico" },
  sabedoria: { icone: GiFeather, rotulo: "Poético / Sabedoria" },
  profetas: { icone: BsMegaphoneFill, rotulo: "Profético" },
  evangelhos: { icone: GiCrossMark, rotulo: "Evangelho" },
  "cartas-paulo": { icone: BsEnvelopeFill, rotulo: "Carta de Paulo" },
  epistolas: { icone: GiQuillInk, rotulo: "Carta / Epístola geral" },
};
