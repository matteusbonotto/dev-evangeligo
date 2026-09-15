import { BsBookHalf, BsEnvelopeFill, BsEnvelopeOpenFill } from "react-icons/bs";
import { FaCross } from "react-icons/fa";
import { GiBrain, GiFlame, GiScrollUnfurled } from "react-icons/gi";
import type { IconType } from "react-icons";
import type { Grupo } from "../types";

/**
 * Ícone + rótulo por extenso de cada categoria temática (`Grupo`, já
 * existente em `types.ts`/`livros.ts`) — pedido explícito do usuário: um
 * ícone no canto do cartão do livro pra "identificar o que é epístola,
 * evangelho, torá etc" (T-052/ADR-045, item 11). Nunca só visual — todo uso
 * carrega `rotulo` em `title`/`aria-label`.
 *
 * Ajustes (feedback direto do usuário, 2 rodadas): `GiCrossMark` parecia um
 * "X" de cancelar — trocado por `FaCross` (cruz de verdade). `GiQuillInk`
 * (epístolas) ficava idêntico a `GiFeather` (sabedoria) — trocado por um
 * envelope ABERTO (`BsEnvelopeOpenFill`). Depois: `BsMegaphoneFill`
 * (profetas) achado "moderno demais" — trocado por `GiFlame` (fogo
 * profético: "não é a minha palavra como fogo?", Jr 23:29; fogo do Carmelo,
 * 1Rs 18); `GiFeather` (sabedoria) trocado por `GiBrain` (pedido direto do
 * usuário — sabedoria como pensamento/reflexão).
 */
export const CATEGORIAS_LIVRO: Record<
  Grupo,
  { icone: IconType; rotulo: string }
> = {
  lei: { icone: GiScrollUnfurled, rotulo: "Lei (Torá)" },
  historia: { icone: BsBookHalf, rotulo: "Histórico" },
  sabedoria: { icone: GiBrain, rotulo: "Poético / Sabedoria" },
  profetas: { icone: GiFlame, rotulo: "Profético" },
  evangelhos: { icone: FaCross, rotulo: "Evangelho" },
  "cartas-paulo": { icone: BsEnvelopeFill, rotulo: "Carta de Paulo" },
  epistolas: { icone: BsEnvelopeOpenFill, rotulo: "Carta / Epístola geral" },
};
