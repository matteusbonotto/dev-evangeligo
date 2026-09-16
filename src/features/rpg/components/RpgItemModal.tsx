import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useAuth } from "../../authentication/context/AuthContext";
import type { ArmorSlot } from "../../authentication/demo/demoUser";
import { ARMOR_SLOTS } from "../../dashboard/armorSlots";
import "../rpg.css";
import {
  alternarEquiparArmadura,
  usarConsumivel,
  venderArmadura,
  venderItemInventario,
} from "../inventario";

export type SelecaoRpg =
  | { tipo: "armadura"; slot: ArmorSlot["slot"] }
  | { tipo: "inventario"; itemId: string };

interface RpgItemModalProps {
  selecao: SelecaoRpg;
  onClose: () => void;
}

const NOMES_RARIDADE: Record<string, string> = {
  comum: "Comum",
  raro: "Raro",
  epico: "Épico",
  lendario: "Lendário",
};

/**
 * Modal de detalhe/ações de UMA peça de armadura ou UM item de inventário
 * (T-010) — porta o caminho mais simples dos 3 que o legado tinha pra
 * equipar/usar/vender (toque no item → modal com botões), não o
 * arrastar-e-soltar nem o toque na silhueta do corpo (ver pesquisa da
 * sessão: os 3 já se comportavam de forma inconsistente entre si no
 * próprio legado — inclusive a silhueta bloqueava totalmente em modo
 * demonstração). Como hoje o app inteiro roda no equivalente a "modo
 * demonstração" (sem backend de RPG ainda), reaproveitar exatamente o
 * caminho que já funcionava nesse modo era a escolha óbvia.
 */
export function RpgItemModal({ selecao, onClose }: RpgItemModalProps) {
  const { user, updateUser } = useAuth();
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "sucesso" | "erro" } | null>(
    null,
  );

  if (!user) return null;

  const peca =
    selecao.tipo === "armadura"
      ? user.armor.find((p) => p.slot === selecao.slot)
      : null;
  const metaSlot =
    selecao.tipo === "armadura"
      ? ARMOR_SLOTS.find((s) => s.slot === selecao.slot)
      : null;
  const item =
    selecao.tipo === "inventario"
      ? user.inventory.find((i) => i.id === selecao.itemId)
      : null;

  function handleEquipar() {
    if (selecao.tipo !== "armadura" || !user) return;
    const conquistasAntes = user.achievements.length;
    const resultado = alternarEquiparArmadura(user, selecao.slot);
    if (!resultado.sucesso) {
      setMensagem({ texto: resultado.erro ?? "Não foi possível.", tipo: "erro" });
      return;
    }
    updateUser(() => resultado.usuario);
    const novasConquistas = resultado.usuario.achievements.slice(conquistasAntes);
    if (novasConquistas.length > 0) {
      setMensagem({
        texto: `Conquista desbloqueada: ${novasConquistas.map((a) => a.title).join(", ")}!`,
        tipo: "sucesso",
      });
    } else {
      const equipadaAgora = resultado.usuario.armor.find((p) => p.slot === selecao.slot)?.equipped;
      setMensagem({
        texto: equipadaAgora ? "Peça equipada." : "Peça desequipada.",
        tipo: "sucesso",
      });
    }
  }

  function handleVenderArmadura() {
    if (selecao.tipo !== "armadura" || !user) return;
    const resultado = venderArmadura(user, selecao.slot);
    if (!resultado.sucesso) {
      setMensagem({ texto: resultado.erro ?? "Não foi possível.", tipo: "erro" });
      return;
    }
    updateUser(() => resultado.usuario);
    onClose();
  }

  function handleUsar() {
    if (selecao.tipo !== "inventario" || !user) return;
    const resultado = usarConsumivel(user, selecao.itemId);
    if (!resultado.sucesso) {
      setMensagem({ texto: resultado.erro ?? "Não foi possível.", tipo: "erro" });
      return;
    }
    updateUser(() => resultado.usuario);
    setMensagem({ texto: "Item usado!", tipo: "sucesso" });
  }

  function handleVenderItem() {
    if (selecao.tipo !== "inventario" || !user) return;
    const resultado = venderItemInventario(user, selecao.itemId);
    if (!resultado.sucesso) {
      setMensagem({ texto: resultado.erro ?? "Não foi possível.", tipo: "erro" });
      return;
    }
    updateUser(() => resultado.usuario);
    setMensagem({ texto: "Item vendido!", tipo: "sucesso" });
  }

  const titulo = peca?.name ?? item?.name ?? metaSlot?.label ?? "Item";

  return (
    <div className="rpg-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="rpg-modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rpg-modal-cabecalho">
          <h2 className="rpg-modal-titulo">{titulo}</h2>
          <button
            type="button"
            className="rpg-modal-fechar"
            onClick={onClose}
            aria-label="Fechar"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        {selecao.tipo === "armadura" && !peca && (
          <p className="rpg-modal-vazio">
            Você ainda não possui {metaSlot?.label ?? "esta peça"}. Compre na
            Loja para equipar.
          </p>
        )}

        {selecao.tipo === "armadura" && peca && (
          <div className="rpg-modal-corpo">
            <span className={`rpg-raridade rpg-raridade--${peca.rarity}`}>
              {NOMES_RARIDADE[peca.rarity]}
            </span>
            <p className="rpg-modal-efeito">
              {peca.effectType === "passivo" ? "Passivo" : "Reativo"} ·{" "}
              {peca.effect}
            </p>
            <div className="rpg-modal-acoes">
              <button type="button" className="primary-button small" onClick={handleEquipar}>
                {peca.equipped ? "Desequipar" : "Equipar"}
              </button>
              <button
                type="button"
                className="secondary-button small"
                onClick={handleVenderArmadura}
              >
                Vender
              </button>
            </div>
          </div>
        )}

        {selecao.tipo === "inventario" && item && (
          <div className="rpg-modal-corpo">
            <p className="rpg-modal-descricao">{item.description}</p>
            {item.type === "permanente" ? (
              <p className="rpg-modal-permanente-aviso">
                Item permanente da sua jornada — não pode ser vendido.
              </p>
            ) : (
              <p className="rpg-modal-quantidade">Quantidade: {item.quantity}</p>
            )}
            <div className="rpg-modal-acoes">
              {item.type === "consumivel" && (
                <button type="button" className="primary-button small" onClick={handleUsar}>
                  Usar agora
                </button>
              )}
              {item.type !== "permanente" && (
                <button
                  type="button"
                  className="secondary-button small"
                  onClick={handleVenderItem}
                >
                  Vender 1
                </button>
              )}
            </div>
          </div>
        )}

        {mensagem && (
          <p
            className={
              mensagem.tipo === "erro" ? "rpg-mensagem-erro" : "rpg-mensagem-sucesso"
            }
          >
            {mensagem.texto}
          </p>
        )}
      </div>
    </div>
  );
}
