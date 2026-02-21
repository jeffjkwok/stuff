import { useQuery } from "@tanstack/react-query";
import { nationalDexAPI, collectionAPI } from "@/libs/api";

export function useMergedPokemon() {
  return useQuery({
    queryKey: ["pokemon", "merged"],
    queryFn: async () => {
      // Replaces Promise.all
      const [nationalDex, collectionData] = await Promise.all([
        nationalDexAPI.getAll(),
        collectionAPI.getAll(),
      ]);
      return { nationalDex, collectionData };
    },
    // The "select" function is where the magic happens
    select: ({ nationalDex, collectionData }) => {
      // 1. Create the Map for O(1) lookup speed
      const acquiredMap = new Map<number, boolean>();
      collectionData.collection.forEach((entry) => {
        acquiredMap.set(entry.dex_number, entry.acquired || false);
      });

      // 2. Merge the data
      const mergedPokemon = nationalDex.map((pokemon) => ({
        ...pokemon,
        id: pokemon.id,
        name: pokemon.name,
        generation: pokemon.generation ?? 0,
        region: pokemon.region ?? "",
        sprite: pokemon.sprite ?? "",
        originalArtwork: pokemon.originalArtwork ?? "",
        // Look up acquisition status from our map
        acquired: acquiredMap.get(Number(pokemon.id)) ?? false,
      }));

      return {
        pokemon: mergedPokemon,
        num_acquired: collectionData.collection.filter((p) => p.acquired)
          .length,
      };
    },
  });
}
