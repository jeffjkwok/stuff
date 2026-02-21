export interface CollectionData {
  collection: CollectionEntry[];
}

export interface CollectionEntry {
  dex_number: number;
  card_id: string;
  card_name: string;
  set_name: string;
  rarity: string;
  acquired_date: string;
  cost: number;
  notes: string;
  upgrade_target: string;
  acquired: boolean;
}

export interface CollectionPokemon {
  dex_number: number;
  card_id: string;
  card_name: string;
  set_name: string;
  rarity: string;
  acquired_date?: string;
}

export interface CollectionStats {
  acquired: number;
  total: number;
  percentage: number;
}

export interface AcquistionToggleResponse {
  success: boolean;
  acquired: boolean;
}

// export interface AddCardPayload {
//   dexNumber: number;
//   cardId: string;
// }
