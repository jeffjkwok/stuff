import { useState } from "react";
import styles from "./NationalDexFilters.module.scss";

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export interface FilterState {
  search: string;
  acquired: boolean | null;
}

export default function NationalDexFilters({
  onFilterChange,
  totalCount,
  filteredCount,
}: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    acquired: null,
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const hasActiveFilters = filters.search || filters.acquired !== null;

  const clearAllFilters = () => {
    updateFilters({
      search: "",
      acquired: null,
    });
  };

  return (
    <div>
      <div className={styles.nationalDexFilters}>
        <div className={styles.nationalDexHeader}>
          <h2>Filters</h2>
          <span>
            {filteredCount} of {totalCount} Pokemon
          </span>
        </div>
        <div className={styles.nationalDexAcquiredFilter}>
          <label>
            <input
              name="acquiredFilter"
              type="radio"
              checked={filters.acquired === null}
              onChange={() => updateFilters({ acquired: null })}
            />
            All
          </label>
          <label>
            <input
              name="acquiredFilter"
              type="radio"
              checked={filters.acquired === true}
              onChange={() => updateFilters({ acquired: true })}
            />
            Acquired
          </label>
          <label>
            <input
              name="acquiredFilter"
              type="radio"
              checked={filters.acquired === false}
              onChange={() => updateFilters({ acquired: false })}
            />
            Missing
          </label>
        </div>
        <div className={styles.nationalDexSearchContainer}>
          {/* Text Search for Name or # */}
          <label>
            <b> Search by Name or #</b>
          </label>
          <input
            type="text"
            placeholder="e.g. Pikachu or 25"
            onFocus={() => setFilters({ ...filters, search: "" })}
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
          {hasActiveFilters && (
            <button style={{}} onClick={clearAllFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
