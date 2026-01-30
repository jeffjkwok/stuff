import { useState, useEffect, useMemo } from "react";
import NationalDexFilters from "../NationalDexFilters/NationalDexFilters";
import NationalDexGridItem from "../NationalDexGridItem/NationalDexGridItem";
import type { FilterState } from "../NationalDexFilters/NationalDexFilters";
import styles from "../NationalDexGrid/NationalDexGrid.module.scss";

export interface Pokemon {
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
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    generations: [],
    regions: [],
  });

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

  const filteredPokemon = useMemo(() => {
    return allPokemon.filter((pokemon) => {
      // console.log(pokemon, filters.search);
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = pokemon.name.toLowerCase().includes(searchLower);
        const matchesId = pokemon.id.toString().includes(searchLower);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [allPokemon, filters]);

  if (loading)
    return <div className={styles.loading}>Loading National Dex...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.grid}>
      <NationalDexFilters
        onFilterChange={setFilters}
        totalCount={allPokemon.length}
        filteredCount={filteredPokemon.length}
      />
      {filteredPokemon.map((pokemon) => (
        // <div
        //   key={pokemon.id}
        //   className={styles.card}
        //   onClick={() =>
        //     console.log(`This is #${pokemon.id}, ${pokemon.name} `)
        //   }
        // >
        //   {/* <div className={styles.cardInfo} style={{ "filter": "grayscale(100%)" }}> */}
        //   <div className={styles.cardInfo}>
        //     <h3 className={styles.cardName}>{pokemon.name}</h3>
        //     <p className={styles.cardSet}>#{pokemon.id}</p>
        //     <div className={styles.placeholderImageWrapper}>
        //       <img
        //         className={styles.placeholderImage}
        //         src={pokemon.originalArtwork}
        //         alt=""
        //       />
        //     </div>
        //   </div>
        // </div>
        <NationalDexGridItem pokemon={pokemon} />
      ))}
    </div>
  );
}
