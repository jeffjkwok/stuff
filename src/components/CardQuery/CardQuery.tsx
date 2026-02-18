import styles from "./CardQuery.module.scss";
import CardQueryItem from "@/components/CardQueryItem/CardQueryItem";
import { useState, useEffect } from "react";

interface CardQueryProps {
  nationalDexNumber: number;
  nameQuery: string;
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
}: CardQueryProps) {
  const [pokemonQuery, setPokemonQuery] = useState<PokemonQueryData[]>([]);

  const queryForPokemon = async (pokemonName: string) => {
    try {
      const res = await fetch(`/api/search/${pokemonName}`);
      if (!res.ok) throw new Error(res.statusText);
      const query = await res.json();
      setPokemonQuery(Array.isArray(query.cards) ? query.cards : []);
    } catch (err) {
      console.log("Failed to query cards: ", err);
    }
  };

  useEffect(() => {
    queryForPokemon(nameQuery);
  }, []);

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
