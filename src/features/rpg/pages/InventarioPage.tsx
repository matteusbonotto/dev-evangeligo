import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiBox } from "react-icons/fi";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../../authentication/context/AuthContext";
import { ARMOR_SLOTS } from "../../dashboard/armorSlots";
import { RpgItemModal, type SelecaoRpg } from "../components/RpgItemModal";
import "../rpg.css";

const NOMES_RARIDADE: Record<string, string> = {
  comum: "Comum",
  raro: "Raro",
  epico: "Épico",
  lendario: "Lendário",
};

/**
 * Inventário (T-010) — tela dedicada pro que você JÁ possui (armadura +
 * itens), separada da Loja (o que dá pra comprar). Pedido do usuário logo
 * depois de ver a Loja: "falta o botão de inventário" — o anel/grade do
 * dashboard já eram clicáveis pra isso, mas só aqui vira um destino
 * próprio e explícito, com a peça vazia de cada slot também visível (não
 * só as equipadas).
 */
export function InventarioPage() {
  const { user } = useAuth();
  const [selecao, setSelecao] = useState<SelecaoRpg | null>(null);

  if (!user) {
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  const armorBySlot = new Map(user.armor.map((peca) => [peca.slot, peca]));

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Início
        </Link>

        <section className="dash-card" aria-labelledby="inventario-title">
          <p className="eyebrow">
            <FiBox aria-hidden="true" /> Inventário
          </p>
          <h1 id="inventario-title">Armadura de Deus e itens</h1>

          <h2 className="rpg-loja-secao-titulo">Armadura · Efésios 6:10-18</h2>
          <div className="rpg-loja-grade">
            {ARMOR_SLOTS.map(({ slot, label, Icon }) => {
              const peca = armorBySlot.get(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  className="rpg-loja-card"
                  onClick={() => setSelecao({ tipo: "armadura", slot })}
                >
                  {peca ? (
                    <span className={`rpg-raridade rpg-raridade--${peca.rarity}`}>
                      {NOMES_RARIDADE[peca.rarity]}
                    </span>
                  ) : (
                    <span className="rpg-raridade rpg-raridade--vazio">Vazio</span>
                  )}
                  <p className="rpg-loja-card-nome">
                    <Icon aria-hidden="true" /> {peca?.name ?? label}
                  </p>
                  <p className="rpg-loja-card-efeito">
                    {peca
                      ? `${peca.equipped ? "Equipada" : "Não equipada"} · ${peca.effect}`
                      : "Você ainda não possui esta peça — compre na Loja."}
                  </p>
                </button>
              );
            })}
          </div>

          <h2 className="rpg-loja-secao-titulo">Itens</h2>
          {user.inventory.length === 0 ? (
            <p className="rpg-modal-vazio">Você ainda não possui itens.</p>
          ) : (
            <div className="rpg-loja-grade">
              {user.inventory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="rpg-loja-card"
                  onClick={() => setSelecao({ tipo: "inventario", itemId: item.id })}
                >
                  <p className="rpg-loja-card-nome">{item.name}</p>
                  <p className="rpg-loja-card-efeito">{item.description}</p>
                  <p className="rpg-loja-card-preco">×{item.quantity}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selecao && <RpgItemModal selecao={selecao} onClose={() => setSelecao(null)} />}
    </AppShell>
  );
}
