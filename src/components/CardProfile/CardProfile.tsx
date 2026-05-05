import { useMemo } from "react";
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
import { useMergedPokemon } from "@/hooks/useMergedLists";
import { cardAPI } from "@/lib/api";
import { resolveCardImageUrl } from "@/utils/imageUrl";

interface CardProfileProps {
  pokemon: Pokemon;
  onSelect: (pokemon: Pokemon) => void;
}

const HOLO_REVERSE_RARITIES = ["Common", "Uncommon", "Rare"];

export default function CardProfile({ pokemon, onSelect }: CardProfileProps) {
  const dexId = Number(pokemon.id);
  const { data: profile, isLoading } = useGetEntryInCollection(dexId);
  const { data: mergedData } = useMergedPokemon();

  const toggleAcquisitionMutation = useToggleAcquisitionStatus();
  const toggleLanguageMutation = useToggleLanguage();
  const toggleHoloReverseMutation = useToggleHoloReverse();
  const addCardMutation = useAssignCardToCollectionEntry();

  const { prev, next } = useMemo(() => {
    const list = mergedData?.pokemon ?? [];
    const idx = list.findIndex((p) => p.id === pokemon.id);
    return {
      prev: idx > 0 ? list[idx - 1] : null,
      next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
    };
  }, [mergedData, pokemon.id]);

  const handleCardRemoval = () => {
    addCardMutation.mutate({
      dexNumber: dexId,
      cardId: "",
      setName: "",
      setNumber: "",
      rarity: "",
      image: "",
      illustrator: "",
      language: "",
    });
  };

  if (isLoading)
    return <div className={styles.loading}>Loading Profile...</div>;

  // useGetEntryInCollection may return either { entry } or the entry directly.
  const entry =
    profile && "entry" in profile ? profile.entry : (profile ?? null);

  return (
    <>
      <div className={styles.cardProfileMobile}>
        <h2>{`${pokemon.name} #${pokemon.id}`}</h2>

        <div className={styles.cardProfileNav}>
          <button onClick={() => prev && onSelect(prev)} disabled={!prev}>
            ← {prev ? `#${prev.id} ${prev.name}` : "Start"}
          </button>
          <button onClick={() => next && onSelect(next)} disabled={!next}>
            {next ? `#${next.id} ${next.name}` : "End"} →
          </button>
        </div>

        <img
          className={`${entry?.acquired ? styles.acquired : ""}`}
          src={resolveCardImageUrl(entry?.image) ?? mysterSrc}
          alt={pokemon.name}
        />

        {entry?.card_id && (
          <div className={styles.cardProfileToggles}>
            <button
              className={styles.cardProfileToggleButton}
              onClick={() => toggleLanguageMutation.mutate(dexId)}
              disabled={toggleLanguageMutation.isPending}
            >
              {entry.language?.includes("English") ? "ENG 🇺🇸" : "JPN 🇯🇵"}
            </button>

            {HOLO_REVERSE_RARITIES.includes(entry.rarity) && (
              <button
                className={styles.cardProfileToggleButton}
                onClick={() => toggleHoloReverseMutation.mutate(dexId)}
                disabled={toggleHoloReverseMutation.isPending}
              >
                {entry.holo_reverse ? "Holo/Rev ✨" : "Base"}
              </button>
            )}
          </div>
        )}

        {entry?.card_id && (
          <div className={styles.cardProfileInfoMobile}>
            {entry.set_name && <p>Set Name: {entry.set_name}</p>}
            {entry.illustrator && <p>Artist: {entry.illustrator}</p>}
            {entry.rarity && <p>Rarity: {entry.rarity}</p>}
          </div>
        )}

        <div className={styles.cardProfileCTAs}>
          <button
            className={
              entry?.acquired
                ? styles.cardProfileUnassignButton
                : styles.cardProfileAssignButton
            }
            onClick={() => toggleAcquisitionMutation.mutate(dexId)}
            disabled={toggleAcquisitionMutation.isPending}
          >
            {entry?.acquired ? "Unacquire" : "Mark as Acquired"}
          </button>
          {entry?.card_id && (
            <button
              className={styles.cardProfileRemoveButton}
              onClick={handleCardRemoval}
            >
              Remove Card?
            </button>
          )}
        </div>
      </div>

      <hr />

      <CardQuery
        nationalDexNumber={dexId}
        nameQuery={pokemon.name}
        queryFunction={cardAPI.searchByName}
      />
    </>
  );
}
