import styles from "./CardProfile.module.scss";
import mysterSrc from "../../assets/mystery.png";
import type { Pokemon } from "../../pages/homepage/HomePage";
import CardQuery from "../CardQuery/CardQuery";

interface CardProfileProps {
  pokemon: Pokemon;
}

export default function CardProfile({ pokemon }: CardProfileProps) {
  return (
    <>
      <div className={styles.cardProfileMobile}>
        <h2>{pokemon!.name}</h2>
        <img src={mysterSrc} alt="" />
      </div>
      <hr />
      <CardQuery
        nationalDexNumber={Number(pokemon.id)}
        nameQuery={pokemon.name}
      />
    </>
  );
}
