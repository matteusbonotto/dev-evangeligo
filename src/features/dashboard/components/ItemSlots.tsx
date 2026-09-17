import {
  GiBookCover,
  GiBread,
  GiHeartPlus,
  GiMusicalNotes,
  GiOpenBook,
  GiPotionBall,
  GiShield,
  GiTorch,
} from "react-icons/gi";
import type { InventoryItem } from "../../authentication/demo/demoUser";
import { useCountdown } from "../hooks/useCountdown";

interface ItemSlotsProps {
  items: InventoryItem[];
  /** Abre o detalhe/ações (usar, vender) de um item — T-010. Sem isto, a grade continua só de exibição. */
  onSelecionarItem?: (itemId: string) => void;
}

function itemIcon(item: InventoryItem) {
  switch (item.name) {
    case "Catecismo de Heidelberg":
    case "Comentário de Calvino":
      return <GiOpenBook aria-hidden="true" />;
    case "Harpa Cristã":
      return <GiMusicalNotes aria-hidden="true" />;
    case "Proteção da Fé":
      return <GiShield aria-hidden="true" />;
    case "Coração Extra":
      return <GiHeartPlus aria-hidden="true" />;
    case "Poção de Foco":
      return <GiPotionBall aria-hidden="true" />;
    case "Tocha da Verdade":
      return <GiTorch aria-hidden="true" />;
    case "Pão da Vida":
      return <GiBread aria-hidden="true" />;
    default:
      return <GiBookCover aria-hidden="true" />;
  }
}

function ItemTile({
  item,
  onSelecionar,
}: {
  item: InventoryItem;
  onSelecionar?: (itemId: string) => void;
}) {
  const remaining = useCountdown(item.expiresAt);
  const isActive = item.type === "consumivel" && remaining !== null;
  const isPermanent = item.type === "permanente";

  const timer = isPermanent
    ? null
    : isActive
      ? remaining
      : item.durationMinutes
        ? `${item.durationMinutes}min`
        : null;

  return (
    <li style={{ display: "contents" }}>
      <button
        type="button"
        className={`item-tile item-tile--${item.type}${
          isActive ? " item-tile--active" : ""
        }`}
        aria-label={`${item.name}, quantidade ${item.quantity}${
          timer ? `, ${timer}` : ""
        }`}
        title={`${item.name} · ${item.description}${timer ? ` · ${timer}` : ""}`}
        onClick={() => onSelecionar?.(item.id)}
        disabled={!onSelecionar}
      >
        <span className="item-tile-icon">{itemIcon(item)}</span>
        <span className="item-tile-qty">×{item.quantity}</span>
        {timer && <span className="item-tile-timer">{timer}</span>}
      </button>
    </li>
  );
}

export function ItemSlots({ items, onSelecionarItem }: ItemSlotsProps) {
  return (
    <ul className="item-grid" data-tour="itens">
      {items.map((item) => (
        <ItemTile key={item.id} item={item} onSelecionar={onSelecionarItem} />
      ))}
    </ul>
  );
}
