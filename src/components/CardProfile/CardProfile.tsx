import styles from "./CardProfile.module.scss";
import mysterSrc from "../../assets/mystery.png";
import type { Pokemon } from "@/types/pokemon";
import CardQuery from "../CardQuery/CardQuery";
import {
  useAssignCardToCollectionEntry,
  useGetEntryInCollection,
  useToggleAcquisitionStatus,
  useToggleHoloReverse,
  useToggleLanguage,
} from "@/hooks/useCollection";
import { cardAPI } from "@/lib/api";

interface CardProfileProps {
  pokemon: Pokemon;
}

export default function CardProfile({ pokemon }: CardProfileProps) {
  // 1. Fetch profile data (Hook handles the ID conversion and 'enabled' check)
  const dexId = Number(pokemon.id);
  const { data: profile, isLoading } = useGetEntryInCollection(dexId);

  const holoReverseInclusion = ["Common", "Uncommon", "Rare"];

  // 2. Setup Mutations for actions
  const toggleAcquisitionMutation = useToggleAcquisitionStatus();
  const toggleLanguageMutation = useToggleLanguage();
  const toggleHoloReverseMutation = useToggleHoloReverse();

  const addCardMutation = useAssignCardToCollectionEntry();

  const handleCardRemoval = () => {
    addCardMutation.mutate({
      dexNumber: dexId,
      cardId: "",
      setName: "",
      setNumber: "",
      rarity: "",
      image: "",
      illustrator: "",
      language: "", //Currently default to english TCG dex does not have good coverage
    });
  };

  // 3. Loading state guard
  if (isLoading)
    return <div className={styles.loading}>Loading Profile...</div>;

  return (
    <>
      <div className={styles.cardProfileMobile}>
        <h2>{`${pokemon.name} #${pokemon.id}`}</h2>

        <img
          className={`${profile?.acquired ? styles.acquired : ""}`}
          src={profile?.image ? `${profile.image}/high.webp` : mysterSrc}
          alt={pokemon.name}
        />

        {profile?.card_id && (
          <div className={styles.cardProfileToggles}>
            <button
              className={styles.cardProfileToggleButton}
              onClick={() => toggleLanguageMutation.mutate(dexId)}
              disabled={toggleLanguageMutation.isPending}
            >
              {profile?.language.includes("English") ? "ENG 🇺🇸" : "JPN 🇯🇵"}
            </button>

            {holoReverseInclusion.includes(profile.rarity) && (
              <button
                className={styles.cardProfileToggleButton}
                onClick={() => toggleHoloReverseMutation.mutate(dexId)}
                disabled={toggleHoloReverseMutation.isPending}
              >
                {profile?.holo_reverse ? "Holo/Rev ✨" : "Base"}
              </button>
            )}
          </div>
        )}

        {profile?.card_id && (
          <div className={styles.cardProfileInfoMobile}>
            {profile.set_name && <p>Set Name: {profile.set_name}</p>}
            {profile.illustrator && <p>Artist: {profile.illustrator}</p>}
            {profile.rarity && <p>Rarity: {profile.rarity}</p>}
          </div>
        )}

        <div className={styles.cardProfileCTAs}>
          <button
            className={
              profile?.acquired
                ? styles.cardProfileUnassignButton
                : styles.cardProfileAssignButton
            }
            onClick={() => toggleAcquisitionMutation.mutate(dexId)}
            disabled={toggleAcquisitionMutation.isPending}
          >
            {profile?.acquired ? "Unacquire" : "Mark as Acquired"}
          </button>
          {profile.card_id && (
            <button
              className={styles.cardProfileRemoveButton}
              onClick={() => handleCardRemoval()}
            >
              Remove Card?
            </button>
          )}
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
