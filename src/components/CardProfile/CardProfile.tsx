/* eslint-disable  @typescript-eslint/no-explicit-any */
import styles from "./CardProfile.module.scss";
import mysterSrc from "../../assets/mystery.png";
import type { Pokemon } from "@/types/pokemon";
import CardQuery from "../CardQuery/CardQuery";
import { useState, useEffect } from "react";

interface CardProfileProps {
  pokemon: Pokemon;
}

export default function CardProfile({ pokemon }: CardProfileProps) {
  const [entryProfile, setEntryProfile] = useState<any>(null);
  const [acquisitionState, setAcquisitionState] = useState<boolean>(false);

  const fetchProfile = async (pokemonId: string) => {
    try {
      const res = await fetch(`/api/collection/${pokemonId}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setEntryProfile(data);
      setAcquisitionState(data.acquired);
    } catch (err) {
      console.log("Failed to query cards: ", err);
    }
  };

  useEffect(() => {
    fetchProfile(pokemon.id);
  }, [pokemon.id]);

  const queryForPokemon = async (pokemonName: string) => {
    try {
      const res = await fetch(`/api/search/${pokemonName}`);
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (err) {
      console.log("Failed to query cards: ", err);
    }
  };

  const unassignCardFromProfile = async (pokemonId: string) => {
    try {
      const res = await fetch(`/api/collection/remove/${pokemonId}`);
      if (!res.ok) throw new Error(res.statusText);
      setEntryProfile(null);
      setAcquisitionState(false);
    } catch (err) {
      console.log("Failed to query cards: ", err);
    }
  };

  const updateAcquistion = async (dexNumber: number) => {
    try {
      const response = await fetch(`/api/collection/acquired/${dexNumber}`, {
        method: "POST",
      });

      await response.json();
      // rudimentary update local state to true

      setAcquisitionState(!acquisitionState);
    } catch (error) {
      console.log(error);
    }
  };

  console.log(entryProfile);
  return (
    <>
      <div className={styles.cardProfileMobile}>
        <h2>{pokemon!.name}</h2>
        <img
          className={`${acquisitionState ? styles.acquired : ""}`}
          src={
            entryProfile && entryProfile.image
              ? entryProfile.image + "/high.webp"
              : mysterSrc
          }
          alt=""
        />

        {entryProfile && (
          <div className={styles.cardProfileInfoMobile}>
            {entryProfile.setName && <p>Set Name: {entryProfile.set_name}</p>}
            {entryProfile.rarity && <p>Rarity: {entryProfile.rarity}</p>}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "row", gap: ".5rem" }}>
          {
            <button
              onClick={() => {
                updateAcquistion(Number(pokemon.id));
              }}
            >
              {acquisitionState ? "Unacquire" : "Acquired"}{" "}
            </button>
          }
          <button
            onClick={() => {
              unassignCardFromProfile(pokemon.id);
            }}
          >
            Remove Entry?
          </button>
        </div>
      </div>
      <hr />
      <CardQuery
        nationalDexNumber={Number(pokemon.id)}
        nameQuery={pokemon.name}
        queryFunction={queryForPokemon}
      />
    </>
  );
}
