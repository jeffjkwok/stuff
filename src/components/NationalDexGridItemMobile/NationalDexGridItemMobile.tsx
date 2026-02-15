import type { Pokemon } from "../../pages/homepage/HomePage";
import styles from "./NationalDexGridItemMobile.module.scss";
import { useState } from "react";

interface NationalDexGridItemProps {
  pokemon: Pokemon;
}

export default function NationalDexGridItemMobile({
  pokemon,
}: NationalDexGridItemProps) {
  const [acquisitionState, setAcquisitionState] = useState<boolean>(
    pokemon.acquired,
  );

  const updateAcquistion = async (dexNumber: number) => {
    try {
      const response = await fetch(`/api/collection/acquired/${dexNumber}`, {
        method: "POST",
      });

      const data = await response.json();
      // rudimentary update local state to true
      if (data.acquired) {
        setAcquisitionState(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      key={pokemon.id}
      className={`${styles.itemCardMobile} ${acquisitionState ? styles.acquired : ""} ${styles.twoCorners}`}
      onClick={() => {
        console.log(
          `This should open a modal/drawer #${pokemon.id}, ${pokemon.name} `,
        );
      }}
    >
      <div className={""} style={{ width: "100%" }}>
        <div className={styles.itemCardInfoMobile}>
          <h3 className={styles.itemCardNameMobile}>{pokemon.name}</h3>
          <p className={styles.itemCardNumberMobile}>#{pokemon.id}</p>
        </div>
        <div className={styles.itemImageContainerMobile}>
          <img src={pokemon.sprite} loading="lazy" alt="" />
        </div>
        {!acquisitionState && (
          <button
            onClick={() => {
              updateAcquistion(Number(pokemon.id));
            }}
          >
            Acquired?
          </button>
        )}
      </div>
    </div>
  );
}
