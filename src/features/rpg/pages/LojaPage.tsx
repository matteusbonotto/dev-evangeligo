import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiDollarSign, FiShoppingBag } from "react-icons/fi";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { AppShell } from "../../../shared/components/AppShell";
import { useAuth } from "../../authentication/context/AuthContext";
import "../rpg.css";
import {
  CATALOGO_ARMADURA,
  CATALOGO_CONSUMIVEIS,
  CATALOGO_PERMANENTES,
} from "../catalogo";
import { comprarItem } from "../loja";
import type { CatalogoItem } from "../types";

const NOMES_RARIDADE: Record<string, string> = {
  comum: "Comum",
  raro: "Raro",
  epico: "Épico",
  lendario: "Lendário",
};

/**
 * Loja (T-010) — porta `comprarItem`/`servicos/loja.js` do app legado:
 * catálogo global (mesmo pra todo mundo), ouro descontado na hora, item
 * cai na armadura (substituindo o slot) ou no inventário (somando
 * quantidade). Duas correções deliberadas sobre o legado (ver ADR): (1) o
 * legado deixa comprar um item PERMANENTE já possuído infinitas vezes, só
 * empilhando a quantidade sem aviso — aqui isso é bloqueado, já que "já
 * desbloqueei isto pra sempre" não faz sentido em dobro; (2) no legado,
 * comprar em modo demonstração é um "não-op" fingido pra quase todo item
 * (só corações realmente aplicam algo) — aqui a compra funciona de
 * verdade (persistida em `localStorage`, ver `persistencia.ts`), porque
 * hoje o app inteiro roda no equivalente a modo demonstração, sem uma
 * conta "real" separada com Supabase por trás ainda.
 */
export function LojaPage() {
  const { user, updateUser } = useAuth();
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "sucesso" | "erro" } | null>(
    null,
  );

  if (!user) {
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  function handleComprar(item: CatalogoItem) {
    if (!user) return;
    const resultado = comprarItem(user, item.id);
    if (!resultado.sucesso) {
      setMensagem({ texto: resultado.erro ?? "Não foi possível comprar.", tipo: "erro" });
      return;
    }
    updateUser(() => resultado.usuario);
    setMensagem({ texto: `${item.nome} comprado!`, tipo: "sucesso" });
  }

  function jaPossuiPermanente(item: CatalogoItem): boolean {
    return item.tipo === "permanente" && (user?.inventory.some((i) => i.id === item.id) ?? false);
  }

  function renderizarCard(item: CatalogoItem) {
    const semOuro = user!.gold < item.precoOuro;
    const possuido = jaPossuiPermanente(item);
    return (
      <div key={item.id} className="rpg-loja-card">
        <span className={`rpg-raridade rpg-raridade--${item.raridade}`}>
          {NOMES_RARIDADE[item.raridade]}
        </span>
        <p className="rpg-loja-card-nome">{item.nome}</p>
        <p className="rpg-loja-card-efeito">{item.effect}</p>
        <p className="rpg-loja-card-preco">
          <FiDollarSign aria-hidden="true" /> {item.precoOuro}
        </p>
        <button
          type="button"
          className="primary-button small"
          onClick={() => handleComprar(item)}
          disabled={semOuro || possuido}
        >
          {possuido ? "Já possui" : semOuro ? "Ouro insuficiente" : "Comprar"}
        </button>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Início
        </Link>

        <section className="dash-card" aria-labelledby="loja-title">
          <p className="eyebrow">
            <FiShoppingBag aria-hidden="true" /> Loja
          </p>
          <h1 id="loja-title">Armadura de Deus e itens</h1>

          <p className="rpg-loja-saldo">
            <FiDollarSign aria-hidden="true" /> {user.gold} ouro
          </p>

          {mensagem && (
            <p
              className={
                mensagem.tipo === "erro" ? "rpg-mensagem-erro" : "rpg-mensagem-sucesso"
              }
            >
              {mensagem.texto}
            </p>
          )}

          <h2 className="rpg-loja-secao-titulo">Armadura · Efésios 6:10-18</h2>
          <div className="rpg-loja-grade">
            {CATALOGO_ARMADURA.map(renderizarCard)}
          </div>

          <h2 className="rpg-loja-secao-titulo">Consumíveis</h2>
          <div className="rpg-loja-grade">
            {CATALOGO_CONSUMIVEIS.map(renderizarCard)}
          </div>

          <h2 className="rpg-loja-secao-titulo">Permanentes</h2>
          <div className="rpg-loja-grade">
            {CATALOGO_PERMANENTES.map(renderizarCard)}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
