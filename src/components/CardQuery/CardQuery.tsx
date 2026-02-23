/* eslint-disable  @typescript-eslint/no-explicit-any */
import styles from "./CardQuery.module.scss";
import CardQueryItem from "@/components/CardQueryItem/CardQueryItem";
import type { TCGdexCard } from "@/types";
import { useCardSearch } from "@/hooks/useCards";
import { useState, useMemo } from "react";

interface CardQueryProps {
  nationalDexNumber: number;
  nameQuery: string;
  queryFunction: any;
}

interface CardQueryFilterState {
  search: string;
  set: string | null;
  rarity: string | null;
}

export default function CardQuery({
  nationalDexNumber,
  nameQuery,
}: CardQueryProps) {
  const { data: pokemonQuery, isLoading } = useCardSearch(nameQuery);

  const [filters, setFilters] = useState<CardQueryFilterState>({
    search: "",
    set: null,
    rarity: null,
  });

  const filteredCards = useMemo(() => {
    const list = pokemonQuery || [];

    return list.filter((card) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSet = card.set.name.toLowerCase().includes(searchLower);
        const matchesSetNumber = String(card.set.cardCount.official)
          .toLowerCase()
          .includes(searchLower);
        if (!matchesSet && !matchesSetNumber) return false;
      }
      return true;
    });
  }, [pokemonQuery, filters]);

  const hasActiveFilters =
    filters.search || filters.set !== null || filters.rarity !== null;

  const clearAllFilters = () => {
    setFilters({
      search: "",
      set: null,
      rarity: null,
    });
  };

  if (isLoading) {
    return <>Loading...</>;
  }

  if (!pokemonQuery) {
    return <>No results found.</>;
  }

  return (
    <>
      <div className={styles.cardQueryFilters}>
        {/* Text Search for Name or # */}
        <label>
          <b>Search by Set Info:</b>
        </label>
        <div>
          <input
            type="text"
            placeholder="e.g. Mega Evolution or 1"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          {hasActiveFilters && (
            <button style={{}} onClick={clearAllFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>
      <div className={styles.cardQueryMobile}>
        {filteredCards.map((card: TCGdexCard) => (
          <CardQueryItem
            nationalDexNumber={nationalDexNumber}
            card={card}
            key={card.id}
          />
        ))}
      </div>
    </>
  );
}
