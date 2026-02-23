import styles from "./CardProfile.module.scss";
import mysterSrc from "../../assets/mystery.png";
import type { Pokemon } from "@/types/pokemon";
import CardQuery from "../CardQuery/CardQuery";
import {
  useGetEntryInCollection,
  useToggleAcquisitionStatus,
} from "@/hooks/useCollection";
import { cardAPI } from "@/lib/api";

interface CardProfileProps {
  pokemon: Pokemon;
}

export default function CardProfile({ pokemon }: CardProfileProps) {
  // 1. Fetch profile data (Hook handles the ID conversion and 'enabled' check)
  const dexId = Number(pokemon.id);
  const { data: profile, isLoading } = useGetEntryInCollection(dexId);

  // 2. Setup Mutations for actions
  const toggleMutation = useToggleAcquisitionStatus();

  // 3. Loading state guard
  if (isLoading)
    return <div className={styles.loading}>Loading Profile...</div>;

  return (
    <>
      <div className={styles.cardProfileMobile}>
        <h2>{pokemon.name}</h2>

        <img
          className={`${profile?.acquired ? styles.acquired : ""}`}
          src={profile?.image ? `${profile.image}/high.webp` : mysterSrc}
          alt={pokemon.name}
        />

        {profile?.acquired && (
          <div className={styles.cardProfileInfoMobile}>
            {profile.set_name && <p>Set Name: {profile.set_name}</p>}
            {profile.rarity && <p>Rarity: {profile.rarity}</p>}
          </div>
        )}

        <div className={styles.cardProfileCTAs}>
          <button
            onClick={() => toggleMutation.mutate(dexId)}
            disabled={toggleMutation.isPending}
          >
            {profile?.acquired ? "Unacquire" : "Mark as Acquired"}
          </button>

          <button onClick={() => console.log("Remove logic here")}>
            Remove Card?
          </button>
        </div>
      </div>

      <hr />

      {/* Pass the cardAPI search function directly */}
      <CardQuery
        nationalDexNumber={dexId}
        nameQuery={pokemon.name}
        queryFunction={cardAPI.searchByName}
      />
    </>
  );
}
