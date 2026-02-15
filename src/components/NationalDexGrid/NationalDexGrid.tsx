import { useState, useMemo } from "react";
import NationalDexFilters from "../NationalDexFilters/NationalDexFilters";
import NationalDexGridItem from "../NationalDexGridItem/NationalDexGridItem";
import ProgressBar from "../ProgressBar/ProgressBar";
import type { FilterState } from "../NationalDexFilters/NationalDexFilters";
import styles from "../NationalDexGrid/NationalDexGrid.module.scss";
import type { Pokemon } from "../../pages/homepage/HomePage"; // move the interface/type to a type folder

interface NationalDexGridProps {
  allPokemon: Pokemon[];
  acquiredCount: number;
}

export default function NationalDexGrid({
  allPokemon,
  acquiredCount,
}: NationalDexGridProps) {
  const [totalCount] = useState<number>(allPokemon.length);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    generations: [],
    regions: [],
    acquired: null,
  });

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

  return (
    <>
      <div className={styles.headers}>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              alignItems: "baseline",
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
          totalCount={totalCount}
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
