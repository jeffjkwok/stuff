import { useQuery } from "@tanstack/react-query";
import { cardAPI, nationalDexAPI } from "../libs/api";

// Get single card by ID
export function useGetCard(cardId: string | undefined) {
  return useQuery({
    queryKey: ["card", cardId],
    queryFn: () => cardAPI.getById(cardId!),
    enabled: !!cardId, // Only run if cardId exists
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - cards don't change
  });
}

// Search cards by name
export function useCardSearch(name: string) {
  return useQuery({
    queryKey: ["cardSearch", name],
    queryFn: () => cardAPI.searchByName(name),
    enabled: name.length > 0, // Only search if name provided
    staleTime: 1000 * 60 * 60 * 24, // 24 hour
  });
}

// Get national dex data ie: national dex number, name, sprite/full image
export function useNationalDex() {
  return useQuery({
    queryKey: ["nationalDex"],
    queryFn: nationalDexAPI.getAll,
    staleTime: Infinity, // Never refetch - static data
  });
}
