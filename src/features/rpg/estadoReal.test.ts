import { describe, expect, it } from "vitest";
import {
  montarArmadura,
  montarConquistas,
  montarInventario,
  type LinhaArmadura,
  type LinhaConquista,
  type LinhaEfeito,
  type LinhaInventario,
} from "./estadoReal";

/**
 * Testa as funções puras de `estadoReal.ts` (T-047/ADR-040) — a ponte entre
 * as tabelas `rpg_*` do Supabase e o formato `DemoUser` que o Dashboard já
 * espera. `carregarOuCriarEstadoReal`/`persistirEstadoRpgReal` (que chamam
 * `supabaseClient` de verdade) não são testadas aqui — mesmo padrão já
 * usado no resto de `AuthContext.tsx` nesta base de código (nenhuma função
 * que chama o Supabase de verdade tem teste unitário, só as fallbacks
 * "Supabase não configurado"); verificadas ao vivo contra o projeto real
 * via Playwright nesta sessão (login, Dashboard/Loja/Inventário carregando,
 * compra persistindo após reload).
 */

describe("montarInventario", () => {
  it("junta linha do banco com o catálogo estático (nome/descrição/tipo)", () => {
    const linhas: LinhaInventario[] = [
      { item_id: "item-biblia-estudo", quantity: 1 },
    ];
    const resultado = montarInventario(linhas, []);
    expect(resultado).toEqual([
      {
        id: "item-biblia-estudo",
        name: "Bíblia de Estudo",
        description: "Referência permanente das Escrituras.",
        quantity: 1,
        type: "permanente",
        durationMinutes: undefined,
        expiresAt: undefined,
      },
    ]);
  });

  it("ignora item_id que não existe mais no catálogo (defensivo)", () => {
    const linhas: LinhaInventario[] = [
      { item_id: "item-removido-do-catalogo", quantity: 3 },
    ];
    expect(montarInventario(linhas, [])).toEqual([]);
  });

  it("nunca inclui peça de armadura na lista de inventário (tabela separada)", () => {
    const linhas: LinhaInventario[] = [{ item_id: "item-cinto", quantity: 1 }];
    expect(montarInventario(linhas, [])).toEqual([]);
  });

  it("anexa expiresAt do efeito ativo correspondente (consumível em uso)", () => {
    const linhas: LinhaInventario[] = [
      { item_id: "item-protecao-fe", quantity: 2 },
    ];
    const efeitos: LinhaEfeito[] = [
      {
        item_id: "item-protecao-fe",
        nome: "Proteção da Fé",
        inicia_em: "2026-09-14T10:00:00.000Z",
        termina_em: "2026-09-14T10:30:00.000Z",
      },
    ];
    const [item] = montarInventario(linhas, efeitos);
    expect(item.expiresAt).toBe("2026-09-14T10:30:00.000Z");
  });
});

describe("montarArmadura", () => {
  it("junta slot/equipped/level do banco com nome/raridade/efeito do catálogo", () => {
    const linhas: LinhaArmadura[] = [
      { slot: "cinto", item_id: "item-cinto", equipped: true, level: 1 },
    ];
    const [peca] = montarArmadura(linhas);
    expect(peca).toEqual({
      slot: "cinto",
      name: "Cinto da Verdade",
      equipped: true,
      rarity: "comum",
      level: 1,
      effect: "+5% de ouro",
      effectType: "passivo",
    });
  });

  it("busca o catálogo pelo slot (não pelo item_id) — 1 peça possível por slot", () => {
    // Mesmo com um item_id "errado"/desatualizado, o slot é a chave
    // confiável (mesmo modelo de `rpg/inventario.ts`: só existe 1 peça de
    // armadura canônica por slot).
    const linhas: LinhaArmadura[] = [
      { slot: "escudo", item_id: "id-qualquer", equipped: false, level: 2 },
    ];
    const [peca] = montarArmadura(linhas);
    expect(peca.name).toBe("Escudo da Fé");
    expect(peca.rarity).toBe("raro");
  });
});

describe("montarConquistas", () => {
  it("converte achievement_id + unlocked_at usando o catálogo real", () => {
    const linhas: LinhaConquista[] = [
      { achievement_id: "primeiro-passo", unlocked_at: "2026-09-14T00:00:00.000Z" },
    ];
    const [conquista] = montarConquistas(linhas);
    expect(conquista.id).toBe("primeiro-passo");
    expect(conquista.title).toBe("Primeiro Passo");
    expect(conquista.unlockedAt).toBe("2026-09-14T00:00:00.000Z");
  });

  it("descarta um achievement_id que não existe no catálogo (defensivo)", () => {
    const linhas: LinhaConquista[] = [
      { achievement_id: "conquista-que-nao-existe-mais", unlocked_at: "2026-09-14T00:00:00.000Z" },
    ];
    expect(montarConquistas(linhas)).toEqual([]);
  });
});
