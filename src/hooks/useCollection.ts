/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionAPI } from "../libs/api";
import type { CollectionData, CollectionEntry } from "@/types";

// Fetch data from collection
export function useCollection() {
  return useQuery<CollectionData, Error>({
    queryKey: ["collection"],
    queryFn: collectionAPI.getAll,
  });
}

// Calculate progress stats from collection
export function useCollectionProgress() {
  const { data, isLoading, isError } = useCollection();

  // 1. Handle Loading and Errors first
  if (isLoading) return { acquired: 0, total: 0, percentage: 0, loading: true };
  if (isError || !data?.collection) {
    return {
      acquired: 0,
      total: 0,
      percentage: 0,
      loading: false,
      error: true,
    };
  }

  // 2. Destructure the array from the data object
  const { collection } = data;

  // 3. Perform calculations
  const acquired = collection.filter((p) => p.acquired).length;
  const total = collection.length;
  const percentage = total > 0 ? Math.round((acquired / total) * 100) : 0;

  return { acquired, total, percentage, loading: false };
}

export function useToggleAcquisitionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dexNumber: number) => collectionAPI.toggle(dexNumber),

    onMutate: async (dexNumber) => {
      await queryClient.cancelQueries({ queryKey: ["collection"] });

      const previousCollection = queryClient.getQueryData<CollectionData>([
        "collection",
      ]);

      queryClient.setQueryData<CollectionData>(["collection"], (old) => {
        if (!old) return old;
        return {
          ...old,
          collection: old.collection.map((pokemon: CollectionEntry) =>
            pokemon.dex_number === dexNumber
              ? { ...pokemon, acquired: !pokemon.acquired }
              : pokemon,
          ),
        };
      });

      return { previousCollection };
    },

    onError: (err, dexNumber, context) => {
      if (context?.previousCollection) {
        queryClient.setQueryData(["collection"], context.previousCollection);
      }
      console.error(`Failed to toggle pokemon #${dexNumber}:`, err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}

export function useAddCardInfoToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dexNumber,
      cardId,
      setName,
      setNumber,
      rarity,
      image,
    }: {
      dexNumber: number;
      cardId: string;
      setName: string;
      setNumber: string;
      rarity: string;
      image: string;
    }) =>
      collectionAPI.addCard(
        dexNumber,
        cardId,
        setName,
        setNumber,
        rarity,
        image,
      ),

    onMutate: async ({
      dexNumber,
      cardId,
      setName,
      setNumber,
      rarity,
      image,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["collection"] });

      const previousCollection = queryClient.getQueryData<any[]>([
        "collection",
      ]);

      queryClient.setQueryData<any[]>(["collection"], (old) => {
        if (!old) return old;

        return old.map((pokemon) =>
          pokemon.dex_number === dexNumber
            ? {
                ...pokemon,
                acquired: true,
                card_id: cardId,
                set_name: setName,
                set_number: setNumber,
                rarity: rarity,
                image: image,
              }
            : pokemon,
        );
      });

      return { previousCollection };
    },

    onError: (err, variables, context) => {
      if (context?.previousCollection) {
        queryClient.setQueryData(["collection"], context.previousCollection);
      }
      console.error("Failed to add card:", err, variables);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}
