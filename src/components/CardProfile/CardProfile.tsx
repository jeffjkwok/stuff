import { useMemo, useState } from "react";
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

  const [loadedImageId, setLoadedImageId] = useState<string | null>(null);
  const imageLoaded = loadedImageId === String(pokemon.id);

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

  // useGetEntryInCollection may return either { entry } or the entry directly.
  const entry =
    profile && "entry" in profile ? profile.entry : (profile ?? null);

  return (
    <>
      <div className={styles.cardProfileMobile}>
        <h2>
          {entry?.card_name || pokemon.name} #{pokemon.id}
        </h2>

        <div className={styles.cardProfileMainDisplay}>
          <div className={styles.navContainerLeft}>
            <button
              className={styles.navButton}
              onClick={() => prev && onSelect(prev)}
              disabled={!prev}
            >
              <span className={styles.navDesktop}>
                ← {prev ? `#${prev.id} ${prev.name}` : "Start"}
              </span>
              <span className={styles.navMobile}>←</span>
            </button>
          </div>

          <div
            style={{
              position: "relative",
              width: "108px",
              height: "150px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {(isLoading || !imageLoaded) && (
              <div
                className="skeleton"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              />
            )}

            {!isLoading && (
              <img
                className={`${entry?.acquired ? styles.acquired : ""}`}
                src={resolveCardImageUrl(entry?.image) ?? mysterSrc}
                alt={pokemon.name}
                onLoad={() => setLoadedImageId(String(pokemon.id))}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            )}
          </div>

          <div className={styles.navContainerRight}>
            <button
              className={styles.navButton}
              onClick={() => next && onSelect(next)}
              disabled={!next}
            >
              <span className={styles.navDesktop}>
                {next ? `#${next.id} ${next.name}` : "End"} →
              </span>
              <span className={styles.navMobile}>→</span>
            </button>
          </div>
        </div>

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

        {isLoading ? (
          <div
            className={styles.cardProfileInfoMobile}
            style={{ alignItems: "center" }}
          >
            <div
              className="skeleton"
              style={{
                width: "120px",
                height: "16px",
                marginBottom: "8px",
                borderRadius: "4px",
              }}
            />
            <div
              className="skeleton"
              style={{
                width: "100px",
                height: "16px",
                marginBottom: "8px",
                borderRadius: "4px",
              }}
            />
            <div
              className="skeleton"
              style={{ width: "80px", height: "16px", borderRadius: "4px" }}
            />
          </div>
        ) : (
          entry?.card_id && (
            <div className={styles.cardProfileInfoMobile}>
              {entry.set_name && <p>Set Name: {entry.set_name}</p>}
              {entry.illustrator && <p>Artist: {entry.illustrator}</p>}
              {entry.rarity && <p>Rarity: {entry.rarity}</p>}
            </div>
          )
        )}

        {!isLoading && (
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
        )}
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
