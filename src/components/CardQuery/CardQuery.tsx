/* eslint-disable  @typescript-eslint/no-explicit-any */
import styles from "./CardQuery.module.scss";
import CardQueryItem from "@/components/CardQueryItem/CardQueryItem";
import type { TCGdexCard } from "@/types";
import { useCardSearch, useGetSearchFilters } from "@/hooks/useCards";
import { useState, useMemo } from "react";
import SelectComponent from "../SelectComponent/SelectComponent";
import { useResponsive } from "@/hooks/useResponsive";

interface CardQueryProps {
  nationalDexNumber: number;
  nameQuery: string;
  queryFunction: any;
}

export interface CardQueryFilterState {
  search: string;
  set: string | null;
  rarity: string | null;
}

export default function CardQuery({
  nationalDexNumber,
  nameQuery,
}: CardQueryProps) {
  const { data: pokemonQuery, isLoading } = useCardSearch(nameQuery);
  const { data: searchFilters } = useGetSearchFilters(nameQuery);

  const setFiltersOptions = searchFilters?.setFilter || [];
  const rarityFiltersOptions = searchFilters?.rarityFilter || [];
  const { isMobile } = useResponsive();

  const [filters, setFilters] = useState<CardQueryFilterState>({
    search: "",
    set: null,
    rarity: null,
  });
  const [filterKey, setFilterKey] = useState(0);

  const filteredCards = useMemo(() => {
    const list = pokemonQuery || [];

    return list.filter((card) => {
      if (filters.set !== null && card.set.name !== filters.set) {
        return false;
      }

      if (filters.rarity !== null && card.rarity !== filters.rarity) {
        return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSet = card.set.name.toLowerCase().includes(searchLower);
        const matchesArtist = card.illustrator
          ?.toLowerCase()
          .includes(searchLower);
        const matchesSetNumber = String(card.localId)
          .toLowerCase()
          .includes(searchLower);
        if (!matchesSet && !matchesSetNumber && !matchesArtist) return false;
      }
      return true;
    });
  }, [pokemonQuery, filters]);

  const hasActiveFilters =
    filters.search || filters.set !== null || filters.rarity !== null;

  const clearAllFilters = () => {
    setFilterKey((k) => k + 1);
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
        <div className={styles.cardQuerySearchFilters}>
          <label>
            <b>Search by Card Info: &nbsp;</b>
          </label>
          <div>
            <input
              type="text"
              placeholder="e.g. Set, Number, Artist"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            {hasActiveFilters && (
              <button onClick={clearAllFilters}>Clear All</button>
            )}
          </div>
        </div>
        <div className={styles.cardQuerySelectFilters}>
          <SelectComponent
            key={`set-${filterKey}`}
            options={setFiltersOptions}
            labelText={isMobile ? "Set: " : "Filter by Set: "}
            inputId={"setFilters"}
            changeCallback={(value: string) =>
              setFilters({ ...filters, set: value })
            }
          />
          <SelectComponent
            key={`rarity-${filterKey}`}
            options={rarityFiltersOptions}
            labelText={isMobile ? "Rarity: " : "Filter by Rarity: "}
            inputId={"rarityFilters"}
            changeCallback={(value: string) =>
              setFilters({ ...filters, rarity: value })
            }
          />
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
