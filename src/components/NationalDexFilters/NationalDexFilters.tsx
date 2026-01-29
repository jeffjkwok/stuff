import { useState } from "react";
// import styles from "@/NationalDexFilters.module.scss";

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export interface FilterState {
  search: string;
  generations: number[];
  regions: string[];
}

// const GENERATIONS = [
//     { num: 1, range: "1-151", label: "Gen I" },
//     { num: 2, range: "152-251", label: "Gen II" },
//     { num: 3, range: "252-386", label: "Gen III" },
//     { num: 4, range: "387-493", label: "Gen IV" },
//     { num: 5, range: "494-649", label: "Gen V" },
//     { num: 6, range: "650-721", label: "Gen VI" },
//     { num: 7, range: "722-809", label: "Gen VII" },
//     { num: 8, range: "810-905", label: "Gen VIII" },
//     { num: 9, range: "906-1025", label: "Gen IX" },
// ];

// const REGIONS = [
//     "Kanto",
//     "Johto",
//     "Hoenn",
//     "Sinnoh",
//     "Unova",
//     "Kalos",
//     "Alola",
//     "Galar",
//     "Paldea",
// ];

export default function NationalDexFilters({
  onFilterChange,
  totalCount,
  filteredCount,
}: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    generations: [],
    regions: [],
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  // const filterRegion = (region: string) => {
  //     const newRegions = filters.regions.includes(region)
  //         ? filters.regions.filter(r => r !== region) : [...filters.regions, region];
  //     updateFilters({ regions: newRegions })
  // }

  // const filterGeneration = (gen: number) => {
  //     const newGen = filters.generations.includes(gen) ? filters.generations.filter(g => g !== gen) : [...filters.generations, gen]
  // }

  const hasActiveFilters =
    filters.search ||
    filters.generations.length > 0 ||
    filters.regions.length > 0;

  const clearAllFilters = () => {
    updateFilters({
      search: "",
      generations: [],
      regions: [],
    });
  };

  return (
    <div>
      <div>
        <h2>Filters</h2>
        <div>
          Showing {filteredCount} of {totalCount} Pokemon
        </div>
        {hasActiveFilters && (
          <button onClick={clearAllFilters}>Clear All</button>
        )}
      </div>
      <div>
        {/* Text Search for Name or # */}
        <label>Search by Name or #</label>
        <input
          type="text"
          placeholder="e.g. Pikachu or 25"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </div>
    </div>
  );
}
