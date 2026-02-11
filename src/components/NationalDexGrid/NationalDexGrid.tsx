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
  collection: CollectionEntry[];
}

interface CollectionEntry {
  dex_number: number;
  acquired: boolean;
  [key: string]: unknown;
}

interface PokemonData {
  id: string;
  name: string;
  generation?: number;
  region?: string;
  sprite?: string;
  originalArtwork?: string;
  [key: string]: unknown;
}

export default function NationalDexGrid() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [acquiredCount, setAcquiredCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    generations: [],
    regions: [],
    acquired: null,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/nationaldex").then((res) => res.json()),
      fetch("/api/collection").then((res) => res.json()),
    ])
      .then(
        ([nationaldexData, collectionData]: [
          PokemonData[],
          CollectionData,
        ]) => {
          // Create a map of dex_number -> acquired status for fast lookup
          const acquiredMap = new Map<number, boolean>();
          collectionData.collection.forEach((entry: CollectionEntry) => {
            acquiredMap.set(entry.dex_number, entry.acquired || false);
          });

          // Merge collection data into pokemon data
          const mergedPokemon: Pokemon[] = nationaldexData.map(
            (pokemon: PokemonData): Pokemon => ({
              id: pokemon.id,
              name: pokemon.name,
              generation: (pokemon.generation as number) ?? 0,
              region: (pokemon.region as string) ?? "",
              sprite: (pokemon.sprite as string) ?? "",
              originalArtwork: (pokemon.originalArtwork as string) ?? "",
              acquired: acquiredMap.get(Number(pokemon.id)) ?? false,
            }),
          );

          setAllPokemon(mergedPokemon);
          setAcquiredCount(collectionData.num_acquired);
          setTotalCount(collectionData.collection.length);

          setLoading(false);
        },
      )
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredPokemon = useMemo(() => {
    return allPokemon.filter((pokemon) => {
      // Filter by acquired status
      if (filters.acquired !== null && pokemon.acquired !== filters.acquired) {
        return false;
      }

      // Filter by search
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
      <div className={styles.headers}>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <h2>Completion</h2>
            <p>{`${acquiredCount}/${totalCount} - ${Math.floor((acquiredCount / totalCount) * 100)}%`}</p>
          </div>
          <ProgressBar
            progress={Math.floor((acquiredCount / totalCount) * 100)}
          />
        </div>
        <NationalDexFilters
          onFilterChange={setFilters}
          totalCount={allPokemon.length}
          filteredCount={filteredPokemon.length}
        />
      </div>
      <div className={styles.grid}>
        {filteredPokemon.map((pokemon) => (
          <NationalDexGridItem key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </>
  );
}
