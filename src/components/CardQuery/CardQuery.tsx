/* eslint-disable  @typescript-eslint/no-explicit-any */
import styles from "./CardQuery.module.scss";
import CardQueryItem from "@/components/CardQueryItem/CardQueryItem";
import { useState, useEffect } from "react";

interface CardQueryProps {
  nationalDexNumber: number;
  nameQuery: string;
  queryFunction: any;
}

export interface PokemonQueryData {
  id: string;
  name: string;
  image: string;
  illustrator: string;
  rarity: string;
  localId: string;
  set: PokemonSetQueryData;
}

interface PokemonSetQueryData {
  id: string;
  name: string;
  logo: string;
  symbol: string;
  cardCount: { official: string };
}

export default function CardQuery({
  nationalDexNumber,
  nameQuery,
  queryFunction,
}: CardQueryProps) {
  const [pokemonQuery, setPokemonQuery] = useState<PokemonQueryData[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const query = await queryFunction(nameQuery);
        setPokemonQuery(Array.isArray(query.cards) ? query.cards : []);
      } catch (err) {
        console.error("Failed to fetch Pokemon query:", err);
      }
    };

    fetchCards();
  }, [nameQuery, queryFunction]);

  return (
    <div className={styles.cardQueryMobile}>
      {pokemonQuery.map((card) => (
        <CardQueryItem
          nationalDexNumber={nationalDexNumber}
          card={card}
          key={card.id}
        />
      ))}
    </div>
  );
}
