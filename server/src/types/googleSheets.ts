export interface CollectionEntry {
  dex_number: number;
  card_id: string;
  acquired: boolean;
  card_name: string;
  set_name: string;
  rarity: string;
  image: string;
  language?: string;
  illustrator?: string;
  holo_reverse?: boolean;
  cost?: string;
}

export interface CollectionData {
  collection: CollectionEntry[];
}

export interface CardData {
  cardId: string;
  setName: string;
  setNumber: string;
  rarity: string;
  image: string;
  illustrator: string;
  language: string;
  holoReverse: boolean;
}
