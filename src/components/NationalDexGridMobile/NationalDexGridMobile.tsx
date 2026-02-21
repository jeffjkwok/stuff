import { useState, useMemo } from "react";
import NationalDexFilters from "../NationalDexFilters/NationalDexFilters";
import CollectionProgress from "../CollectionProgress/CollectionProgress";
import type { FilterState } from "../NationalDexFilters/NationalDexFilters";
import NationalDexGridItemMobile from "../NationalDexGridItemMobile/NationalDexGridItemMobile";
import { useMergedPokemon } from "@/hooks/useMergedLists";
import type { Pokemon } from "@/types";
import styles from "./NationalDexGridMobile.module.scss";

interface NationalDexGridProps {
  openCardPaneCallback: (pokemon: Pokemon) => void;
}

export default function NationalDexGridMobile({
  openCardPaneCallback,
}: NationalDexGridProps) {
  // 1. Get status flags from the hook
  const { data: mergedData, isLoading, isError } = useMergedPokemon();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    generations: [],
    regions: [],
    acquired: null,
  });

  // 2. Use Optional Chaining (?.) and provide a fallback empty array ([])
  const filteredPokemon = useMemo(() => {
    const list = mergedData?.pokemon || []; // Safe fallback

    return list.filter((pokemon) => {
      if (filters.acquired !== null && pokemon.acquired !== filters.acquired) {
        return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = pokemon.name.toLowerCase().includes(searchLower);
        const matchesId = pokemon.id.toString().includes(searchLower);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [mergedData, filters]);

  // 3. Handle Loading and Error views
  if (isLoading) return <div className={styles.loading}>Loading Dex...</div>;
  if (isError) return <div className={styles.error}>Error loading data.</div>;

  return (
    <>
      <div className={styles.gridHeaderMobile}>
        <CollectionProgress />

        <NationalDexFilters
          onFilterChange={setFilters}
          // Access totalCount from the safe list
          totalCount={mergedData?.pokemon.length || 0}
          filteredCount={filteredPokemon.length}
        />
      </div>
      <div className={styles.gridMobile}>
        {filteredPokemon.map((pokemon) => (
          <NationalDexGridItemMobile
            key={pokemon.id}
            pokemon={pokemon}
            openPane={openCardPaneCallback}
          />
        ))}
      </div>
    </>
  );
}
