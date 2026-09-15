import {
  BsBookHalf,
  BsEnvelopeFill,
  BsEnvelopeOpenFill,
  BsMegaphoneFill,
} from "react-icons/bs";
import { FaCross } from "react-icons/fa";
import { GiFeather, GiScrollUnfurled } from "react-icons/gi";
import type { IconType } from "react-icons";
import type { Grupo } from "../types";

/**
 * Ícone + rótulo por extenso de cada categoria temática (`Grupo`, já
 * existente em `types.ts`/`livros.ts`) — pedido explícito do usuário: um
 * ícone no canto do cartão do livro pra "identificar o que é epístola,
 * evangelho, torá etc" (T-052/ADR-045, item 11). Nunca só visual — todo uso
 * carrega `rotulo` em `title`/`aria-label`.
 *
 * Ajuste (feedback direto do usuário logo após o deploy): `GiCrossMark`
 * parecia um "X" de cancelar, não uma cruz — trocado por `FaCross` (cruz de
 * verdade). `GiQuillInk` (epístolas) ficava visualmente idêntico a
 * `GiFeather` (sabedoria) — trocado por um envelope ABERTO
 * (`BsEnvelopeOpenFill`), distinto do envelope fechado das cartas de Paulo
 * mas ainda na mesma família visual "carta", sem repetir nenhum ícone.
 */
export const CATEGORIAS_LIVRO: Record<
  Grupo,
  { icone: IconType; rotulo: string }
> = {
  lei: { icone: GiScrollUnfurled, rotulo: "Lei (Torá)" },
  historia: { icone: BsBookHalf, rotulo: "Histórico" },
  sabedoria: { icone: GiFeather, rotulo: "Poético / Sabedoria" },
  profetas: { icone: BsMegaphoneFill, rotulo: "Profético" },
  evangelhos: { icone: FaCross, rotulo: "Evangelho" },
  "cartas-paulo": { icone: BsEnvelopeFill, rotulo: "Carta de Paulo" },
  epistolas: { icone: BsEnvelopeOpenFill, rotulo: "Carta / Epístola geral" },
};
