export interface Card {
  id: string;
  localId: string;
  name: string;
  image?: string;
  dexId?: string[];
  hp?: number;
  types?: string[];
  rarity?: string;
  set?: {
    id: string;
    name: string;
    logo?: string;
  };
  variants?: {
    normal?: boolean;
    reverse?: boolean;
    holo?: boolean;
    firstEdition?: boolean;
  };
}

export interface CardSearchResult {
  cards: Card[];
}
