/* eslint-disable  @typescript-eslint/no-explicit-any */
import type {
  CardSearchResponse,
  CollectionData,
  CollectionEntry,
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

  toggle: (dexNumber: number) =>
    fetchAPI<{ success: boolean }>(`/api/collection/acquired/${dexNumber}`, {
      method: "POST",
    }),

  addCard: (
    dexNumber: number,
    cardId: string,
    setName: string,
    setNumber: string,
    rarity: string,
    image: string,
  ) =>
    fetchAPI<{ success: boolean }>(`/api/collection/card/${dexNumber}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, setName, setNumber, rarity, image }),
    }),

  getEntry: (dexNumber: number) =>
    fetchAPI<{ entry: CollectionEntry }>(`/api/collection/${dexNumber}`),
};

// Card Endpoint to get data from TCGDex
export const cardAPI = {
  getById: (cardId: string) => fetchAPI<any>(`/api/card/${cardId}`),

  searchByName: (name: string) =>
    fetchAPI<CardSearchResponse>(`/api/search/${name}`),
};

// National Dex information
export const nationalDexAPI = {
  getAll: () => fetchAPI<any[]>(`/api/nationaldex`),
};
