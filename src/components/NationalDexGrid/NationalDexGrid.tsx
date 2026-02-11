import { useState, useEffect, useMemo } from "react";
import NationalDexFilters from "../NationalDexFilters/NationalDexFilters";
import NationalDexGridItem from "../NationalDexGridItem/NationalDexGridItem";
import ProgressBar from "../ProgressBar/ProgressBar";
import type { FilterState } from "../NationalDexFilters/NationalDexFilters";
import styles from "../NationalDexGrid/NationalDexGrid.module.scss";

export interface Pokemon {
  id: string;
  name: string;
  generation: number;
  region: string;
  sprite: string;
  originalArtwork: string;
  acquired: boolean;
}

export interface CollectionData {
  num_acquired: number;
  collection: object[];
}

export default function NationalDexGrid() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [collection, setCollection] = useState<object[]>([]);
  const [acquiredCount, setAcquiredCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    generations: [],
    regions: [],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/nationaldex").then((res) => res.json()),
      fetch("/api/collection").then((res) => res.json()),
    ])
      .then(([nationaldexData, collectionData]) => {
        setAllPokemon(nationaldexData);
        setCollection(collectionData.collection);
        setAcquiredCount(collectionData.num_acquired);
        setTotalCount(collectionData.collection.length);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const acquiredByDexNumber = useMemo(() => {
    const map = new Map<number, boolean>();
    collection.forEach((entry) => {
      if (entry.acquired) {
        map.set(entry.dex_number, true);
      }
    });
    return map;
  }, [collection]);

  const filteredPokemon = useMemo(() => {
    return allPokemon.filter((pokemon) => {
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
    <>
      <div>
        <p>{`${acquiredCount}/${totalCount} - ${Math.floor((acquiredCount / totalCount) * 100)}%`}</p>
        <ProgressBar
          progress={Math.floor((acquiredCount / totalCount) * 100)}
        />
      </div>
      <NationalDexFilters
        onFilterChange={setFilters}
        totalCount={allPokemon.length}
        filteredCount={filteredPokemon.length}
      />
      <div className={styles.grid}>
        {filteredPokemon.map((pokemon) => {
          const acquired = acquiredByDexNumber.get(Number(pokemon.id)) ?? false;

          return (
            <NationalDexGridItem
              key={pokemon.id}
              pokemon={{ ...pokemon, acquired }}
            />
          );
        })}
      </div>
    </>
  );
}
