import { useQuery } from "@tanstack/react-query";
import { nationalDexAPI, collectionAPI } from "@/lib/api";
import type { CollectionEntry } from "@/types";

export function useMergedPokemon() {
  return useQuery({
    queryKey: ["pokemon", "merged", "collection"],
    queryFn: async () => {
      const [nationalDex, collectionData] = await Promise.all([
        nationalDexAPI.getAll(),
        collectionAPI.getAll(),
      ]);
      return { nationalDex, collectionData };
    },
    select: ({ nationalDex, collectionData }) => {
      // 1. Map now stores the entire entry for rich data lookup
      const collectionMap = new Map<number, CollectionEntry>();

      collectionData.collection.forEach((entry) => {
        collectionMap.set(entry.dex_number, entry);
      });

      // 2. Merge the data
      const mergedPokemon = nationalDex.map((pokemon) => {
        const userCard = collectionMap.get(Number(pokemon.id));

        const rarity = userCard?.set_name.includes("Promos")
          ? "Black Star Promo"
          : userCard?.rarity;

        return {
          ...pokemon,
          id: pokemon.id,
          name: pokemon.name,
          generation: pokemon.generation ?? 0,
          region: pokemon.region ?? "",
          sprite: pokemon.sprite ?? "",
          originalArtwork: pokemon.originalArtwork ?? "",
          // New merged fields
          acquired: !!userCard?.acquired,
          rarity: rarity ?? "", // Default fallback
          language: userCard?.language ?? "English",
          holo_reverse: userCard?.holo_reverse ?? false,
          cardAssigned: userCard?.card_id ? true : false,
        };
      });

      return {
        pokemon: mergedPokemon,
        num_acquired: collectionData.collection.filter((p) => p.acquired)
          .length,
      };
    },
  });
}
