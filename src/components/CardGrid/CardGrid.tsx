import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CardGrid.module.scss";

interface Card {
  id: string;
  name: string;
  nationalPokedexNumbers: number[];
  images: {
    small: string;
    large: string;
  };
  set: {
    name: string;
  };
  rarity?: string;
}

function CardGrid() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => {
        setCards(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.loading}>Loading cards...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div
          key={card.id}
          className={styles.card}
          onClick={() => navigate(`/card/${card.id}`)}
        >
          <img
            src={card.images.small}
            alt={card.name}
            className={styles.cardImage}
          />
          <div className={styles.cardInfo}>
            <h3 className={styles.cardName}>{card.name}</h3>
            <p className={styles.cardSet}>{card.set.name}</p>
            {card.rarity && <p className={styles.cardRarity}>{card.rarity}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardGrid;
