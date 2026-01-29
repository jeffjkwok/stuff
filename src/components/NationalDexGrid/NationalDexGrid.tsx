import { useState, useEffect } from "react";
import styles from "../NationalDexGrid/NationalDexGrid.module.scss";

interface Pokemon {
  id: string;
  name: string;
  generation: number;
  region: string;
  sprite: string;
  originalArtwork: string;
}

export default function NationalDexGrid() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/nationaldex")
      .then((res) => res.json())
      .then((data) => {
        setAllPokemon(data);
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
      {allPokemon.map((pokemon) => (
        <div
          key={pokemon.id}
          className={styles.card}
          onClick={() =>
            console.log(`This is #${pokemon.id}, ${pokemon.name} `)
          }
        >
          {/* <div className={styles.cardInfo} style={{ "filter": "grayscale(100%)" }}> */}
          <div className={styles.cardInfo}>
            <h3 className={styles.cardName}>{pokemon.name}</h3>
            <p className={styles.cardSet}>#{pokemon.id}</p>
            <img
              className={styles.placeholderImage}
              src={pokemon.originalArtwork}
              alt=""
            />
          </div>
        </div>
      ))}
    </div>
  );
}
