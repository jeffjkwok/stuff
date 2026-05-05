export interface CollectionData {
  collection: CollectionEntry[];
}

export interface CollectionEntry {
  dex_number: number;
  card_id: string;
  card_name: string;
  set_name: string;
  set_number: string;
  rarity: string;
  acquired: boolean;
  image: string;
  illustrator: string;
  holo_reverse: boolean;
  language: string;
  cost?: string | number;
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

export interface AssignCardVariables {
  dexNumber: number;
  cardId: string;
  setName: string;
  setNumber: string;
  rarity: string;
  image: string;
  illustrator: string;
  language: string;
}
