import { ClientError, GraphQLClient, gql } from "graphql-request";

const client = new GraphQLClient("https://api.tcgdex.net/v2/graphql");

const GET_CARD_QUERY = gql`
  query GetCard($id: ID!) {
    card(id: $id) {
      name
      image
      illustrator
      rarity
      set {
        id
        name
        logo
        symbol
      }
    }
  }
`;

const GET_CARDS_BY_NAME_QUERY = gql`
  query GetCardsByName($name: String!) {
    cards(
      filters: { name: $name, image: "not:tcgp", category: "not:trainer" }
    ) {
      id
      name
      category
      image
      illustrator
      rarity
      localId
      set {
        id
        name
        logo
        symbol
        cardCount {
          official
        }
      }
      variants {
        holo
        reverse
      }
    }
  }
`;

const MAX_RETRIES = 2;
const MAX_BACKOFF_MS = 30_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseRetryAfter(headers: Headers | undefined): number | null {
  const raw = headers?.get?.("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const dateMs = Date.parse(raw);
  if (Number.isFinite(dateMs)) return Math.max(0, dateMs - Date.now());
  return null;
}

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!(err instanceof ClientError)) throw err;

      const status = err.response.status;
      const retryable = status === 429 || (status >= 500 && status < 600);
      if (!retryable || attempt === MAX_RETRIES) throw err;

      const headerWait =
        status === 429
          ? parseRetryAfter(err.response.headers as Headers)
          : null;
      const backoff =
        headerWait ?? Math.min(2 ** attempt * 500, MAX_BACKOFF_MS);
      const waitMs = Math.min(backoff, MAX_BACKOFF_MS);

      console.warn(
        `[TCGdex] ${label} got ${status}, retry ${attempt + 1}/${MAX_RETRIES} after ${waitMs}ms`,
      );
      await sleep(waitMs);
    }
  }
  throw lastErr;
}

export async function getCard(cardId: string) {
  return withRetry(`getCard(${cardId})`, () =>
    client.request(GET_CARD_QUERY, { id: cardId }),
  );
}

export async function getCardsByName(name: string) {
  return withRetry(`getCardsByName(${name})`, () =>
    client.request(GET_CARDS_BY_NAME_QUERY, { name }),
  );
}
