import styles from "./CardQueryItem.module.scss";
import cardbackSrc from "../../assets/pokemonback.png";
import type { TCGdexCard } from "@/types";
import { useAssignCardToCollectionEntry } from "@/hooks/useCollection";
import { resolveCardImageUrl, viaImageProxy } from "@/utils/imageUrl";
import { useState } from "react";

interface CardQueryItemProps {
  card: TCGdexCard;
  nationalDexNumber: number;
}

export default function CardQueryItem({
  card,
  nationalDexNumber,
}: CardQueryItemProps) {
  const addCardMutation = useAssignCardToCollectionEntry();
  const [loadedImageId, setLoadedImageId] = useState<string | null>(null);
  const imageLoaded = loadedImageId === card.id;

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

  const tcgQuery = encodeURIComponent(
    `${card.name} - ${card.localId}/${card.set.cardCount.official}`,
  );
  const tcgUrl = `https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&q=${tcgQuery}&view=grid`;

  return (
    <div className={styles.cardQueryItemMobile}>
      <a
        href={tcgUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardQueryItemLink}
      >
        <div className={styles.cardImageContainer}>
          {!imageLoaded && (
            <div
              className="skeleton"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
              }}
            />
          )}
          <img
            loading="lazy"
            src={thumb ?? cardbackSrc}
            alt={card.name}
            onLoad={() => setLoadedImageId(card.id)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = cardbackSrc;
              setLoadedImageId(card.id);
            }}
            style={{ opacity: imageLoaded ? 1 : 0, transition: "opacity 0.2s" }}
          />
        </div>
        <div className={styles.cardQueryItemInfoMobile}>
          <div className={styles.cardQueryItemMeta}>
            <b className={styles.cardQueryItemName} title={card.name}>
              {card.name}
            </b>
            <b className={styles.cardQueryItemSetName} title={card.set.name}>
              {card.set.name}
            </b>
            <span className={styles.cardQueryItemDetails}>
              {card.localId}/{card.set.cardCount.official}
            </span>
            {card.rarity && (
              <span className={styles.cardQueryItemRarity}>{card.rarity}</span>
            )}
            {card.illustrator && (
              <span
                className={styles.cardQueryItemArtist}
                title={card.illustrator}
              >
                {card.illustrator}
              </span>
            )}
          </div>
        </div>
      </a>
      <div className={styles.cardQueryItemActions}>
        <button
          className={styles.cardAssignButton}
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
  );
}
