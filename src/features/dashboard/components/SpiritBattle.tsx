import { useState } from "react";
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
import { FiChevronDown } from "react-icons/fi";
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

export function SpiritBattle({ entries }: SpiritBattleProps) {
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const totalFruit = entries.reduce((sum, entry) => sum + entry.fruitValue, 0);
  const totalFlesh = entries.reduce((sum, entry) => sum + entry.fleshValue, 0);
  const total = totalFruit + totalFlesh;
  const fruitShare = total === 0 ? 50 : Math.round((totalFruit / total) * 100);
  const fleshShare = 100 - fruitShare;
  const spiritIsWinning = fruitShare >= fleshShare;

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

          const expandido = expandidoId === entry.id;

          return (
            <li key={entry.id} className="sb-row">
              <button
                type="button"
                className="sb-row-toggle"
                onClick={() => setExpandidoId(expandido ? null : entry.id)}
                aria-expanded={expandido}
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

                <FiChevronDown
                  className={`sb-row-chevron${expandido ? " sb-row-chevron--aberto" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {expandido && (
                <div className="sb-explicacao">
                  <p className="sb-explicacao-texto">{entry.explicacao}</p>
                  <p className="sb-explicacao-exemplo">
                    <strong>No dia a dia:</strong> {entry.exemploDoDia}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
