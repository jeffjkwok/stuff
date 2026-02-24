/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionAPI } from "../lib/api";
import type { CollectionData, CollectionEntry } from "@/types";

// Fetch data from collection
export function useCollection() {
  return useQuery<CollectionData, Error>({
    queryKey: ["collection"],
    queryFn: collectionAPI.getAll,
  });
}

export function useGetEntryInCollection(dexNumber: number) {
  return useQuery({
    queryKey: ["collection", dexNumber],
    queryFn: () => collectionAPI.getEntry(dexNumber),
    // This handles both cases: if 'entry' exists, use it. Otherwise, use the whole object.
    select: (data: any) => data,
    enabled: !!dexNumber && !isNaN(dexNumber),
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
    mutationFn: (dexNumber: number) =>
      collectionAPI.toggleAcquistion(dexNumber),

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
      console.error(
        `Failed to toggle acquistion status for entry #${dexNumber}:`,
        err,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}

export function useToggleHoloReverse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dexNumber: number) =>
      collectionAPI.toggleHoloReverseStatus(dexNumber),

    onMutate: async (dexNumber) => {
      await queryClient.cancelQueries({ queryKey: ["collection"] });

      const previousCollection = queryClient.getQueryData<CollectionData>([
        "collection",
      ]);

      queryClient.setQueryData<CollectionData>(["collection"], (old) => {
        if (!old) return old;
        return {
          ...old,
          collection: old.collection.map((pokemon: CollectionEntry) => {
            const holoReverseStatus = pokemon.holoReverse;
            return pokemon.dex_number === dexNumber
              ? { ...pokemon, holoReverse: !holoReverseStatus }
              : pokemon;
          }),
        };
      });

      return { previousCollection };
    },

    onError: (err, dexNumber, context) => {
      if (context?.previousCollection) {
        queryClient.setQueryData(["collection"], context.previousCollection);
      }
      console.error(
        `Failed to toggle Holo/Reverse Status for entry #${dexNumber}:`,
        err,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}

export function useToggleLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dexNumber: number) => collectionAPI.toggleLanguage(dexNumber),

    onMutate: async (dexNumber) => {
      await queryClient.cancelQueries({ queryKey: ["collection"] });

      const previousCollection = queryClient.getQueryData<CollectionData>([
        "collection",
      ]);

      queryClient.setQueryData<CollectionData>(["collection"], (old) => {
        if (!old) return old;
        return {
          ...old,
          collection: old.collection.map((pokemon: CollectionEntry) => {
            const lang = !pokemon.language.includes("English")
              ? "English"
              : "Japanese";
            return pokemon.dex_number === dexNumber
              ? { ...pokemon, language: lang }
              : pokemon;
          }),
        };
      });

      return { previousCollection };
    },

    onError: (err, dexNumber, context) => {
      if (context?.previousCollection) {
        queryClient.setQueryData(["collection"], context.previousCollection);
      }
      console.error(`Failed to change Language for entry #${dexNumber}:`, err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}

interface CardVariables {
  dexNumber: number;
  cardId: string;
  setName: string;
  setNumber: string;
  rarity: string;
  image: string;
  illustrator: string;
  language: string;
}

export function useAssignCardToCollectionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dexNumber,
      cardId,
      setName,
      setNumber,
      rarity,
      image,
      illustrator,
      language,
    }: CardVariables) => {
      return collectionAPI.assignCard(
        dexNumber,
        cardId,
        setName,
        setNumber,
        rarity,
        image,
        illustrator,
        language,
      );
    },

    onMutate: async (newCard) => {
      const {
        dexNumber,
        cardId,
        setName,
        setNumber,
        rarity,
        image,
        illustrator,
        language,
      } = newCard;

      // 1. Cancel outgoing refetches so they don't overwrite us
      await queryClient.cancelQueries({ queryKey: ["collection"] });
      await queryClient.cancelQueries({ queryKey: ["collection", dexNumber] });

      // 2. Snapshot the previous values for rollback
      const previousCollection = queryClient.getQueryData<CollectionData>([
        "collection",
      ]);
      const previousEntry = queryClient.getQueryData(["collection", dexNumber]);

      // 3. Update the MAIN LIST (The Grid and Progress Bar)
      queryClient.setQueryData<CollectionData>(["collection"], (old) => {
        // Fix: 'old' is an object { collection: [] }, not an array!
        if (!old?.collection) return old;

        return {
          ...old,
          collection: old.collection.map((pokemon) =>
            pokemon.dex_number === dexNumber
              ? {
                  ...pokemon,
                  acquired: true,
                  card_id: cardId,
                  set_name: setName,
                  set_number: setNumber,
                  rarity: rarity,
                  image: image,
                  illustrator: illustrator,
                  language: language,
                }
              : pokemon,
          ),
        };
      });

      // 4. Update the INDIVIDUAL ENTRY (The Profile Pane)
      queryClient.setQueryData(["collection", dexNumber], (old: any) => {
        if (!old) return old;
        const updatedEntry = {
          ...(old.entry || old),
          acquired: true,
          card_id: cardId,
          set_name: setName,
          set_number: setNumber,
          rarity: rarity,
          image: image,
          illustrator: illustrator,
          language: language,
        };
        return old.entry ? { ...old, entry: updatedEntry } : updatedEntry;
      });

      return { previousCollection, previousEntry };
    },

    onError: (err, variables, context) => {
      // Rollback to the previous state if the server call fails
      if (context?.previousCollection) {
        queryClient.setQueryData(["collection"], context.previousCollection);
      }
      if (context?.previousEntry) {
        queryClient.setQueryData(
          ["collection", variables.dexNumber],
          context.previousEntry,
        );
      }
      console.error("Failed to add card info:", err);
    },

    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we are in sync with Google Sheets
      console.log(data, error);
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({
        queryKey: ["collection", variables.dexNumber],
      });
    },
  });
}
