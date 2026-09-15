import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import type { ArmorSlot, DemoUser } from "../../authentication/demo/demoUser";
import { montarUrlAvatar } from "../../avatar/avatarUrl";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { raridadeDoConjuntoCompleto } from "../../rpg/bonus";
import {
  ARMOR_SET_BONUSES,
  ARMOR_SLOTS,
  type ArmorSlotMeta,
} from "../armorSlots";

interface AvatarRPGProps {
  user: DemoUser;
  /** Abre o detalhe/ações (equipar, vender) de uma peça — T-010. Sem isto, o anel continua só de exibição (ex.: usado fora do dashboard). */
  onSelecionarSlot?: (slot: ArmorSlot["slot"]) => void;
}

const ARC_RADIUS = 40;
const ARC_CENTER = 50;

function pointOnRing(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: ARC_CENTER + ARC_RADIUS * Math.cos(rad),
    y: ARC_CENTER + ARC_RADIUS * Math.sin(rad),
  };
}

export function AvatarRPG({ user, onSelecionarSlot }: AvatarRPGProps) {
  const bySlot = new Map(user.armor.map((piece) => [piece.slot, piece]));
  const isEquipped = (slot: ArmorSlot["slot"]) =>
    bySlot.get(slot)?.equipped ?? false;

  const uniformRarity = raridadeDoConjuntoCompleto(user.armor);
  const setBonus = uniformRarity ? ARMOR_SET_BONUSES[uniformRarity] : null;

  const ringArc = (current: ArmorSlotMeta, next: ArmorSlotMeta) => {
    const from = pointOnRing(current.angle);
    const to = pointOnRing(next.angle);
    return `M ${from.x} ${from.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${to.x} ${to.y}`;
  };

  const baseArcs = ARMOR_SLOTS.map((current, index) => {
    const next = ARMOR_SLOTS[(index + 1) % ARMOR_SLOTS.length];
    return {
      key: `base-${current.slot}-${next.slot}`,
      d: ringArc(current, next),
    };
  });

  const arcs = ARMOR_SLOTS.map((current, index) => {
    const next = ARMOR_SLOTS[(index + 1) % ARMOR_SLOTS.length];
    if (!isEquipped(current.slot) || !isEquipped(next.slot)) return null;
    return { key: `${current.slot}-${next.slot}`, d: ringArc(current, next) };
  }).filter((arc): arc is { key: string; d: string } => arc !== null);

  return (
    <div className="hud-avatar-column">
      <div className="hud-ring" role="group" aria-label="Armadura de Deus">
        <svg
          className="hud-ring-connectors"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {baseArcs.map((arc) => (
            <path
              key={arc.key}
              className="hud-ring-arc hud-ring-arc--base"
              d={arc.d}
            />
          ))}
          {arcs.map((arc) => (
            <path
              key={arc.key}
              className={`hud-ring-arc${
                uniformRarity
                  ? ` hud-ring-arc--pulse hud-ring-arc--rarity-${uniformRarity}`
                  : ""
              }`}
              d={arc.d}
            />
          ))}
        </svg>

        {ARMOR_SLOTS.map(({ slot, label, Icon, angle }) => {
          const piece = bySlot.get(slot);
          const equipped = piece?.equipped ?? false;
          const rarity = piece?.rarity ?? "comum";
          const level = piece?.level ?? 0;
          const effect = piece?.effect ?? "";
          const effectType = piece?.effectType ?? "passivo";
          const tooltip = `${label} · Nv ${level} · ${
            effectType === "passivo" ? "Passivo" : "Reativo"
          } · ${effect} · ${equipped ? "Equipada" : "Não equipada"}`;
          return (
            <button
              key={slot}
              type="button"
              className={`hud-ring-slot hud-slot--rarity-${rarity}${
                equipped ? " hud-slot--equipped" : " hud-slot--empty"
              }`}
              style={{ "--angle": `${angle}deg` } as CSSProperties}
              aria-label={tooltip}
              title={tooltip}
              onClick={() => onSelecionarSlot?.(slot)}
              disabled={!onSelecionarSlot}
            >
              <Icon aria-hidden="true" />
              {equipped && (
                <span className="hud-slot-level" aria-hidden="true">
                  Nv {level}
                </span>
              )}
            </button>
          );
        })}

        <div className="hud-avatar" aria-label={`Avatar de ${user.name}`}>
          <img
            className="hud-avatar-img"
            src={montarUrlAvatar(user.avatarConfig)}
            alt=""
          />
          <span className="hud-level" aria-label={`Nível ${user.level}`}>
            Nv {user.level}
          </span>
          <Link
            className="hud-avatar-editar"
            to={ROUTE_PATHS.avatar}
            aria-label="Editar personagem"
            title="Editar personagem"
          >
            <FiEdit2 aria-hidden="true" />
          </Link>
        </div>
      </div>

      {setBonus && (
        <div
          className={`hud-set-bonus hud-set-bonus--${uniformRarity}`}
          title={setBonus.effect}
        >
          <strong>{setBonus.title}</strong>
          <span>{setBonus.effect}</span>
        </div>
      )}
    </div>
  );
}
