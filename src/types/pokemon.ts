export interface Pokemon {
  id: string;
  name: string;
  generation: number;
  region: string;
  sprite: string;
  originalArtwork: string;
  acquired: boolean;
  rarity?: string;
  language: string;
  holo_reverse: boolean;
  cardAssigned: boolean;
}
