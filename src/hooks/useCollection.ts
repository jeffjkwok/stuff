import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionAPI } from "../lib/api";
import type {
  AssignCardVariables,
  CollectionData,
  CollectionEntry,
} from "@/types";

const COLLECTION_KEY = ["collection"] as const;
const MERGED_KEY = ["pokemon", "merged"] as const;

export function useCollection() {
  return useQuery<CollectionData, Error>({
    queryKey: COLLECTION_KEY,
    queryFn: collectionAPI.getAll,
  });
}

export function useGetEntryInCollection(dexNumber: number) {
  return useQuery<{ entry: CollectionEntry } | CollectionEntry>({
    queryKey: ["collection", dexNumber],
    queryFn: () => collectionAPI.getEntry(dexNumber),
    enabled: !!dexNumber && !isNaN(dexNumber),
  });
}

export function useCollectionProgress() {
  const { data, isLoading, isError } = useCollection();

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

  const { collection } = data;
  const acquired = collection.filter((p) => p.acquired).length;
  const total = collection.length;
  const percentage = total > 0 ? Math.round((acquired / total) * 100) : 0;

  return { acquired, total, percentage, loading: false };
}

interface OptimisticToggleConfig<K extends keyof CollectionEntry> {
  apiFn: (dexNumber: number) => Promise<unknown>;
  field: K;
  computeNext: (entry: CollectionEntry) => CollectionEntry[K];
  errorLabel: string;
}

function useOptimisticToggle<K extends keyof CollectionEntry>({
  apiFn,
  field,
  computeNext,
  errorLabel,
}: OptimisticToggleConfig<K>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dexNumber: number) => apiFn(dexNumber),

    onMutate: async (dexNumber) => {
      await queryClient.cancelQueries({ queryKey: COLLECTION_KEY });

      const previousCollection =
        queryClient.getQueryData<CollectionData>(COLLECTION_KEY);

      queryClient.setQueryData<CollectionData>(COLLECTION_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          collection: old.collection.map((entry) =>
            entry.dex_number === dexNumber
              ? { ...entry, [field]: computeNext(entry) }
              : entry,
          ),
        };
      });

      return { previousCollection };
    },

    onError: (err, dexNumber, context) => {
      if (context?.previousCollection) {
        queryClient.setQueryData(COLLECTION_KEY, context.previousCollection);
      }
      console.error(`${errorLabel} (entry #${dexNumber}):`, err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTION_KEY });
      queryClient.invalidateQueries({ queryKey: MERGED_KEY });
    },
  });
}

export function useToggleAcquisitionStatus() {
  return useOptimisticToggle({
    apiFn: collectionAPI.toggleAcquistion,
    field: "acquired",
    computeNext: (entry) => !entry.acquired,
    errorLabel: "Failed to toggle acquisition status",
  });
}

export function useToggleHoloReverse() {
  return useOptimisticToggle({
    apiFn: collectionAPI.toggleHoloReverseStatus,
    field: "holo_reverse",
    computeNext: (entry) => !entry.holo_reverse,
    errorLabel: "Failed to toggle holo/reverse status",
  });
}

export function useToggleLanguage() {
  return useOptimisticToggle({
    apiFn: collectionAPI.toggleLanguage,
    field: "language",
    computeNext: (entry) =>
      entry.language.includes("English") ? "Japanese" : "English",
    errorLabel: "Failed to toggle language",
  });
}

export function useAssignCardToCollectionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: AssignCardVariables) => collectionAPI.assignCard(vars),

    onMutate: async (newCard) => {
      const { dexNumber, ...cardFields } = newCard;

      await queryClient.cancelQueries({ queryKey: COLLECTION_KEY });
      await queryClient.cancelQueries({ queryKey: ["collection", dexNumber] });

      const previousCollection =
        queryClient.getQueryData<CollectionData>(COLLECTION_KEY);
      const previousEntry = queryClient.getQueryData(["collection", dexNumber]);

      const patch = {
        acquired: true,
        card_id: cardFields.cardId,
        set_name: cardFields.setName,
        set_number: cardFields.setNumber,
        rarity: cardFields.rarity,
        image: cardFields.image,
        illustrator: cardFields.illustrator,
        language: cardFields.language,
      };

      queryClient.setQueryData<CollectionData>(COLLECTION_KEY, (old) => {
        if (!old?.collection) return old;
        return {
          ...old,
          collection: old.collection.map((pokemon) =>
            pokemon.dex_number === dexNumber
              ? { ...pokemon, ...patch }
              : pokemon,
          ),
        };
      });

      queryClient.setQueryData(
        ["collection", dexNumber],
        (old: { entry?: CollectionEntry } | CollectionEntry | undefined) => {
          if (!old) return old;
          if ("entry" in old && old.entry) {
            return { ...old, entry: { ...old.entry, ...patch } };
          }
          return { ...old, ...patch };
        },
      );

      return { previousCollection, previousEntry };
    },

    onError: (err, variables, context) => {
      if (context?.previousCollection) {
        queryClient.setQueryData(COLLECTION_KEY, context.previousCollection);
      }
      if (context?.previousEntry) {
        queryClient.setQueryData(
          ["collection", variables.dexNumber],
          context.previousEntry,
        );
      }
      console.error("Failed to assign card:", err);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: COLLECTION_KEY });
      queryClient.invalidateQueries({
        queryKey: ["collection", variables.dexNumber],
      });
      queryClient.invalidateQueries({ queryKey: MERGED_KEY });
    },
  });
}
