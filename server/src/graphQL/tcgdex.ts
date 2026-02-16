import { GraphQLClient, gql } from "graphql-request";

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
    cards(filters: { name: $name }) {
      id
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

export async function getCard(cardId: string) {
  return await client.request(GET_CARD_QUERY, { id: cardId });
}

export async function getCardsByName(name: string) {
  return await client.request(GET_CARDS_BY_NAME_QUERY, { name: name });
}
