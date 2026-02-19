import styles from "./CardQueryItem.module.scss";
import cardbackSrc from "../../assets/pokemonback.png";
import type { PokemonQueryData } from "../CardQuery/CardQuery";

interface CardQueryItemProps {
  card: PokemonQueryData;
  nationalDexNumber: number;
}

export default function CardQueryItem({
  card,
  nationalDexNumber,
}: CardQueryItemProps) {
  const saveCardInfo = async (nationalDexNumber: number) => {
    const cardData = {
      cardId: card.id,
      setName: card.set.name,
      setNumber: card.localId,
      rarity: card.rarity,
      image: card.image,
    };

    try {
      const response = await fetch(
        `/api/collection/card/${nationalDexNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cardData),
        },
      );

      const data = await response.json();

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.cardQueryItemMobile}>
      <img
        className=""
        src={`${card.image ? card.image + "/low.webp" : cardbackSrc}`}
      />
      <div className={styles.cardQueryItemInfoMobile}>
        <div style={{ flex: "1" }}>
          <b className={styles.cardQueryItemSetName} title={card.set.name}>
            Set: {card.set.name}
          </b>
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: ".5rem",
          }}
        >
          <b>
            {card.localId}/{card.set.cardCount.official}{" "}
          </b>
          <button
            onClick={() => {
              console.log(card);
              saveCardInfo(nationalDexNumber);
            }}
          >
            Add to Collection?
          </button>
        </div>
      </div>
    </div>
  );
}
