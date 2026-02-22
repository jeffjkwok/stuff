export interface TCGdexCard {
  id: string;
  name: string;
  image: string;
  illustrator: string;
  rarity: string;
  localId: string;
  set: {
    id: string;
    name: string;
    logo: string;
    symbol: string;
    cardCount: { official: string };
  };
}

export interface CardSearchResponse {
  cards: TCGdexCard[];
}
