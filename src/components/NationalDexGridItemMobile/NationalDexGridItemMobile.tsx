import { useState } from "react";
import type { Pokemon } from "@/types";
import styles from "./NationalDexGridItemMobile.module.scss";
import { useToggleAcquisitionStatus } from "@/hooks/useCollection";
import { getRarityImage } from "@/utils/rarityUtils";

interface NationalDexGridItemProps {
  pokemon: Pokemon;
  openPane: (pokemon: Pokemon) => void;
}

export default function NationalDexGridItemMobile({
  pokemon,
  openPane,
}: NationalDexGridItemProps) {
  const toggleMutation = useToggleAcquisitionStatus();
  const [acquisitionState, setAcquisitionState] = useState<boolean>(
    pokemon.acquired,
  );

  const renderLang = pokemon.language.includes("English") ? "ENG" : "JPN";
  const rarity = pokemon.rarity || "";

  return (
    <div
      key={pokemon.id}
      className={`${styles.itemCardMobile} ${acquisitionState ? styles.acquired : ""} ${styles.twoCorners}`}
    >
      <div className={""} style={{ width: "100%" }}>
        <div className={styles.itemCardInfoMobile}>
          <h3 className={styles.itemCardNameMobile}>{pokemon.name}</h3>
          <p className={styles.itemCardNumberMobile}>#{pokemon.id}</p>
        </div>
        <div className={styles.itemImageContainerMobile}>
          <img src={pokemon.sprite} loading="lazy" alt="" />
        </div>
        <div className={styles.itemCardCTAs}>
          <button
            onClick={() => {
              openPane(pokemon);
            }}
            style={{
              backgroundColor: "#363636",
              color: "white",
            }}
          >
            View
          </button>
          {!acquisitionState ? (
            <button
              disabled={toggleMutation.isPending}
              onClick={() => {
                // This triggers the mutation which updates the cache
                // and makes the Progress Bar react!
                toggleMutation.mutate(Number(pokemon.id));
                setAcquisitionState(!acquisitionState);
              }}
            >
              {toggleMutation.isPending ? "Saving..." : "Acquired?"}
            </button>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <b>
                {pokemon.cardAssigned && `${renderLang} - `}
                <img
                  className={styles.itemCardSymbol}
                  src={getRarityImage(rarity) ?? undefined}
                />
                {`${pokemon.holo_reverse ? "✨" : ""}`}
              </b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
