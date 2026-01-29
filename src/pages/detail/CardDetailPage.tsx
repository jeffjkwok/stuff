import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import styles from "./CardDetailPage.module.scss";

interface Card {
  id: string;
  artist: string;
  name: string;
  nationalPokedexNumbers: number[];
  images: {
    small: string;
    large: string;
  };
  set: {
    name: string;
    series: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  rarity: string;
}

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/cards/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCard(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!card) return <div className={styles.error}>Card not found</div>;

  return (
    <div className={styles.container}>
      <button onClick={() => navigate("/")} className={styles.backButton}>
        ← Back to Grid
      </button>

      <div className={styles.cardDetail}>
        <img
          src={card.images.large}
          alt={card.name}
          className={styles.largeImage}
        />

        <div className={styles.cardInfo}>
          <h2>{card.name}</h2>
          <p>
            <strong>ID:</strong> {card.id}
          </p>
          <p>
            <strong>Set:</strong> {card.set.name} ({card.set.series})
          </p>
          {card.number && (
            <p>
              <strong>Number:</strong> {card.number}
            </p>
          )}
          {card.hp && (
            <p>
              <strong>HP:</strong> {card.hp}
            </p>
          )}
          {card.types && (
            <p>
              <strong>Type:</strong> {card.types.join(", ")}
            </p>
          )}
          {card.rarity && (
            <p>
              <strong>Rarity:</strong> {card.rarity}
            </p>
          )}
          <p>
            <strong>Pokedex #:</strong> {card.nationalPokedexNumbers.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
