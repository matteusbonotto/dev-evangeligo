import { useEffect, useState } from "react";
import {
  GiAnchor,
  GiBeerStein,
  GiBodyBalance,
  GiBreakingChain,
  GiCrossedSwords,
  GiCultist,
  GiFeather,
  GiFire,
  GiHeartWings,
  GiHourglass,
  GiOlive,
  GiPeaceDove,
  GiShakingHands,
  GiShatteredHeart,
  GiShouting,
  GiStarAltar,
  GiSunkenEye,
  GiSunrise,
} from "react-icons/gi";
import { FiChevronDown, FiX } from "react-icons/fi";
import type { SpiritBattleEntry } from "../../authentication/demo/demoUser";

interface SpiritBattleProps {
  entries: SpiritBattleEntry[];
}

const FRUIT_ICONS: Record<string, typeof GiHeartWings> = {
  amor: GiHeartWings,
  alegria: GiSunrise,
  paz: GiPeaceDove,
  longanimidade: GiHourglass,
  benignidade: GiShakingHands,
  bondade: GiOlive,
  fidelidade: GiAnchor,
  mansidao: GiFeather,
  "dominio-proprio": GiBodyBalance,
};

const FLESH_ICONS: Record<string, typeof GiHeartWings> = {
  amor: GiCrossedSwords,
  alegria: GiBreakingChain,
  paz: GiShouting,
  longanimidade: GiFire,
  benignidade: GiSunkenEye,
  bondade: GiShatteredHeart,
  fidelidade: GiStarAltar,
  mansidao: GiCultist,
  "dominio-proprio": GiBeerStein,
};

/**
 * Modal centralizado com os 2 lados do par (T-066) — pedido explícito do
 * usuário: o accordion inline empilhado ficava ruim de ler; no mobile os
 * 2 blocos ficam um abaixo do outro, no desktop lado a lado com "VS" no
 * meio (`sb-modal-corpo`, breakpoint em CSS). Fecha por clique no fundo,
 * no X ou Esc.
 */
function SpiritBattleModal({
  entry,
  onClose,
}: {
  entry: SpiritBattleEntry;
  onClose: () => void;
}) {
  const FruitIcon = FRUIT_ICONS[entry.id];
  const FleshIcon = FLESH_ICONS[entry.id];

  useEffect(() => {
    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  return (
    <div className="sb-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sb-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${entry.fruitLabel} contra ${entry.fleshLabel}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sb-modal-cabecalho">
          <h2 className="sb-modal-titulo">
            {entry.fruitLabel} <span className="sb-modal-vs-inline">×</span>{" "}
            {entry.fleshLabel}
          </h2>
          <button
            type="button"
            className="sb-modal-fechar"
            onClick={onClose}
            aria-label="Fechar"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="sb-modal-corpo">
          <div className="sb-bloco sb-bloco--fruit">
            <p className="sb-bloco-titulo">
              <FruitIcon aria-hidden="true" /> {entry.fruitLabel} —{" "}
              <cite>{entry.versiculo}</cite>
            </p>
            <p>
              <strong>O que significa:</strong> {entry.significadoFruto}
            </p>
            <p>
              <strong>Como aparece no dia a dia:</strong> {entry.exemploFruto}
            </p>
            <p>
              <strong>Como praticar hoje:</strong> {entry.pratica}
            </p>
            <p>
              <strong>Pergunta para se examinar:</strong> {entry.pergunta}
            </p>
            <p>
              <strong>Oração:</strong> {entry.oracao}
            </p>
          </div>

          <div className="sb-modal-vs" aria-hidden="true">
            VS
          </div>

          <div className="sb-bloco sb-bloco--flesh">
            <p className="sb-bloco-titulo sb-bloco-titulo--flesh">
              <FleshIcon aria-hidden="true" /> {entry.fleshLabel}
            </p>
            {entry.obraTermos.map((termo) => (
              <p key={termo.nome}>
                <strong>{termo.nome}:</strong> {termo.significado}
              </p>
            ))}
            <p>
              <strong>Como aparece hoje em dia:</strong> {entry.sinalObra}
            </p>
            <p>
              <strong>Como evitar/reagir:</strong> {entry.respostaObra}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpiritBattle({ entries }: SpiritBattleProps) {
  const [parAbertoId, setParAbertoId] = useState<string | null>(null);
  const totalFruit = entries.reduce((sum, entry) => sum + entry.fruitValue, 0);
  const totalFlesh = entries.reduce((sum, entry) => sum + entry.fleshValue, 0);
  const total = totalFruit + totalFlesh;
  const fruitShare = total === 0 ? 50 : Math.round((totalFruit / total) * 100);
  const fleshShare = 100 - fruitShare;
  const spiritIsWinning = fruitShare >= fleshShare;
  const parAberto = entries.find((entry) => entry.id === parAbertoId) ?? null;

  return (
    <div className="spirit-battle">
      <div
        className={`sb-summary${spiritIsWinning ? " sb-summary--winning" : " sb-summary--losing"}`}
        role="status"
        aria-label={`Fruto do Espírito ${fruitShare}% contra Obras da Carne ${fleshShare}%`}
      >
        <span className="sb-summary-side sb-summary-side--fruit">
          {fruitShare}%<small>Fruto do Espírito</small>
        </span>
        <span className="sb-vs" aria-hidden="true">
          VS
        </span>
        <span className="sb-summary-side sb-summary-side--flesh">
          {fleshShare}%<small>Obras da Carne</small>
        </span>
      </div>
      <p className="sb-goal">
        {spiritIsWinning
          ? "O Fruto do Espírito está à frente. Continue!"
          : "As Obras da Carne estão à frente. Persevere em Espírito (Gl 5:16)."}
      </p>

      <ul
        className="sb-list"
        aria-label="Fruto do Espírito contra Obras da Carne, par a par"
      >
        {entries.map((entry) => {
          const FruitIcon = FRUIT_ICONS[entry.id];
          const FleshIcon = FLESH_ICONS[entry.id];
          const total = entry.fruitValue + entry.fleshValue;
          const fruitPercent =
            total === 0 ? 50 : (entry.fruitValue / total) * 100;
          const fruitAhead = entry.fruitValue >= entry.fleshValue;

          return (
            <li key={entry.id} className="sb-row">
              <button
                type="button"
                className="sb-row-toggle"
                onClick={() => setParAbertoId(entry.id)}
                aria-label={`${entry.fruitLabel} contra ${entry.fleshLabel} — ver significado e exemplo`}
              >
                <span
                  className={`sb-icon sb-icon--fruit${fruitAhead ? " sb-icon--ahead" : ""}`}
                  title={entry.fruitLabel}
                  aria-hidden="true"
                >
                  <FruitIcon />
                </span>

                <div
                  className="sb-track"
                  role="progressbar"
                  aria-label={`${entry.fruitLabel} contra ${entry.fleshLabel}`}
                  aria-valuenow={entry.fruitValue}
                  aria-valuemin={0}
                  aria-valuemax={total}
                >
                  <span className="sb-track-label sb-track-label--fruit">
                    {entry.fruitLabel} {entry.fruitValue}
                  </span>
                  <i
                    className="sb-fill-fruit"
                    style={{ width: `${fruitPercent}%` }}
                  />
                  <i
                    className="sb-fill-flesh"
                    style={{ width: `${100 - fruitPercent}%` }}
                  />
                  <span className="sb-track-label sb-track-label--flesh">
                    {entry.fleshValue} {entry.fleshLabel}
                  </span>
                </div>

                <span
                  className={`sb-icon sb-icon--flesh${!fruitAhead ? " sb-icon--ahead" : ""}`}
                  title={entry.fleshLabel}
                  aria-hidden="true"
                >
                  <FleshIcon />
                </span>

                <FiChevronDown className="sb-row-chevron" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      {parAberto && (
        <SpiritBattleModal entry={parAberto} onClose={() => setParAbertoId(null)} />
      )}
    </div>
  );
}
