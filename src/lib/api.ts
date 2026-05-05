import type {
  AssignCardVariables,
  CardSearchResponse,
  CollectionData,
  CollectionEntry,
  TCGdexCard,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}
// Collection endpoints
export const collectionAPI = {
  getAll: () => fetchAPI<CollectionData>("/api/collection"),

  toggleAcquistion: (dexNumber: number) =>
    fetchAPI<{ success: boolean }>(`/api/collection/acquired/${dexNumber}`, {
      method: "POST",
    }),

  toggleLanguage: (dexNumber: number) =>
    fetchAPI<{ success: boolean }>(`/api/collection/language/${dexNumber}`, {
      method: "POST",
    }),

  toggleHoloReverseStatus: (dexNumber: number) =>
    fetchAPI<{ success: boolean }>(`/api/collection/holo/${dexNumber}`, {
      method: "POST",
    }),

  assignCard: ({ dexNumber, ...cardData }: AssignCardVariables) =>
    fetchAPI<{ success: boolean }>(`/api/collection/card/${dexNumber}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardData),
    }),

  getEntry: (dexNumber: number) =>
    fetchAPI<{ entry: CollectionEntry }>(`/api/collection/${dexNumber}`),
};

// Card Endpoint to get data from TCGDex
export const cardAPI = {
  getById: (cardId: string) => fetchAPI<TCGdexCard>(`/api/card/${cardId}`),

  searchByName: (name: string) =>
    fetchAPI<CardSearchResponse>(`/api/search/${name}`),
};

// National Dex information — minimal shape needed by the client.
interface NationalDexEntry {
  id: string;
  name: string;
  generation?: number;
  region?: string;
  sprite?: string;
  originalArtwork?: string;
}

export const nationalDexAPI = {
  getAll: () => fetchAPI<NationalDexEntry[]>(`/api/nationaldex`),
};
