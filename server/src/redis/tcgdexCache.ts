import { getCard, getCardsByName } from "../graphQL/tcgdex";
import { getCached } from "./redis";

const TTL = {
  CARD: 60 * 60 * 24 * 45, // 45 days for card; Shouldn't typically change; maybe if updated
  QUERY: 60 * 60 * 24 * 90, // 90 days for search result;
};

export async function getCachedCard(cardId: string) {
  return getCached(`tcgdex:card:${cardId}`, TTL.CARD, () => getCard(cardId));
}

export async function getCachedQueryByName(name: string) {
  const normalizeName = name.toLowerCase().trim();

  return getCached(`tcgdex:queryByName:${normalizeName}`, TTL.QUERY, () =>
    getCardsByName(name),
  );
}
