import styles from "./CardQueryItem.module.scss";
import cardbackSrc from "../../assets/pokemonback.png";
import type { PokemonQueryData } from "../CardQuery/CardQuery";
import { useAddCardInfoToCollection } from "@/hooks/useCollection";

interface CardQueryItemProps {
  card: PokemonQueryData;
  nationalDexNumber: number;
}

export default function CardQueryItem({
  card,
  nationalDexNumber,
}: CardQueryItemProps) {
  // 1. Initialize the mutation hook
  const addCardMutation = useAddCardInfoToCollection();

  const handleAddCard = () => {
    // 2. Call the mutation with the object structure defined in mutationFn
    addCardMutation.mutate({
      dexNumber: nationalDexNumber,
      cardId: card.id,
      setName: card.set.name,
      setNumber: card.localId,
      rarity: card.rarity,
      image: card.image || "",
    });
  };

  return (
    <div className={styles.cardQueryItemMobile}>
      <img
        className=""
        src={card.image ? `${card.image}/low.webp` : cardbackSrc}
        alt={card.name}
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
            {card.localId}/{card.set.cardCount.official}
          </b>

          <button
            onClick={handleAddCard}
            // 3. Provide UI feedback during the mutation
            disabled={addCardMutation.isPending}
          >
            {addCardMutation.isPending ? "Adding..." : "Add to Collection?"}
          </button>

          {/* Optional: Error feedback */}
          {addCardMutation.isError && (
            <span style={{ color: "red", fontSize: "10px" }}>Try again</span>
          )}
        </div>
      </div>
    </div>
  );
}
