/* eslint-disable  @typescript-eslint/no-explicit-any */
import styles from "./CardQuery.module.scss";
import CardQueryItem from "@/components/CardQueryItem/CardQueryItem";
import type { TCGdexCard } from "@/types";
import { useCardSearch } from "@/hooks/useCards";

interface CardQueryProps {
  nationalDexNumber: number;
  nameQuery: string;
  queryFunction: any;
}

export default function CardQuery({
  nationalDexNumber,
  nameQuery,
}: CardQueryProps) {
  const { data: pokemonQuery, isLoading } = useCardSearch(nameQuery);

  if (isLoading) {
    return <>Loading...</>;
  }

  if (!pokemonQuery) {
    return <>No results found.</>;
  }

  return (
    <div className={styles.cardQueryMobile}>
      {pokemonQuery.map((card: TCGdexCard) => (
        <CardQueryItem
          nationalDexNumber={nationalDexNumber}
          card={card}
          key={card.id}
        />
      ))}
    </div>
  );
}
