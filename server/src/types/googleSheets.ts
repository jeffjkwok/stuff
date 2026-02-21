export interface CollectionItem {
  dex_number: number;
  card_id: string;
  acquired: boolean;
  card_name: string;
  set_name: string;
  rarity: string;
  image: string;
  acquired_date?: string;
  cost?: number;
  notes?: string;
  upgrade_target?: string;
}

export interface CollectionData {
  collection: CollectionItem[];
}

export interface CardData {
  cardId: string;
  setName: string;
  setNumber: string;
  rarity: string;
  image: string;
}
