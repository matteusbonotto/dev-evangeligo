import { FiCheck } from "react-icons/fi";
import type { ArmorSlot } from "../../authentication/demo/demoUser";
import { ARMOR_SLOTS } from "../armorSlots";

interface ArmorSlotsProps {
  armor: ArmorSlot[];
}

export function ArmorSlots({ armor }: ArmorSlotsProps) {
  const bySlot = new Map(armor.map((piece) => [piece.slot, piece]));

  return (
    <ul className="armor-slots" aria-label="Armadura de Deus equipada">
      {ARMOR_SLOTS.map(({ slot, label, Icon }) => {
        const piece = bySlot.get(slot);
        const equipped = piece?.equipped ?? false;
        return (
          <li
            key={slot}
            className={`hud-slot${equipped ? " hud-slot--equipped" : " hud-slot--empty"}`}
            aria-label={`${label}${equipped ? ", equipada" : ", não equipada"}`}
            title={label}
          >
            <Icon aria-hidden="true" />
            {equipped && (
              <span className="hud-slot-check" aria-hidden="true">
                <FiCheck />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
