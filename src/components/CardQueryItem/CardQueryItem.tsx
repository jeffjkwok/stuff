import styles from "./CardQueryItem.module.scss";
import cardbackSrc from "../../assets/pokemonback.png";
import type { TCGdexCard } from "@/types";
import { useAssignCardToCollectionEntry } from "@/hooks/useCollection";
import { resolveCardImageUrl, viaImageProxy } from "@/utils/imageUrl";

interface CardQueryItemProps {
  card: TCGdexCard;
  nationalDexNumber: number;
}

export default function CardQueryItem({
  card,
  nationalDexNumber,
}: CardQueryItemProps) {
  const addCardMutation = useAssignCardToCollectionEntry();

  const thumb = viaImageProxy(resolveCardImageUrl(card.image, "low"));

  const handleAssignCard = () => {
    addCardMutation.mutate({
      dexNumber: nationalDexNumber,
      cardId: card.id,
      setName: card.set.name,
      setNumber: card.localId,
      rarity: card.rarity,
      image: card.image || "",
      illustrator: card.illustrator,
      language: "English",
    });
  };

  return (
    <div className={styles.cardQueryItemMobile}>
      <img
        loading="lazy"
        src={thumb ?? cardbackSrc}
        alt={card.name}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = cardbackSrc;
        }}
      />
      <div className={styles.cardQueryItemInfoMobile}>
        <div className={styles.cardQueryItemMeta}>
          <b className={styles.cardQueryItemName} title={card.name}>
            {card.name}
          </b>
          <b className={styles.cardQueryItemSetName} title={card.set.name}>
            {card.set.name}
          </b>
          {card.rarity && (
            <span className={styles.cardQueryItemRarity}>{card.rarity}</span>
          )}
          {card.illustrator && (
            <span
              className={styles.cardQueryItemArtist}
              title={card.illustrator}
            >
              illus. {card.illustrator}
            </span>
          )}
        </div>
        <div className={styles.cardQueryItemActions}>
          <b>
            {card.localId}/{card.set.cardCount.official}
          </b>

          <button
            onClick={handleAssignCard}
            disabled={addCardMutation.isPending}
          >
            {addCardMutation.isPending ? "Assigning..." : "Assign?"}
          </button>

          {addCardMutation.isError && (
            <span style={{ color: "red", fontSize: "10px" }}>Try again</span>
          )}
        </div>
      </div>
    </div>
  );
}
