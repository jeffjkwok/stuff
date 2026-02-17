import NationalDexGrid from "@/components/NationalDexGrid/NationalDexGrid";
import NationalDexGridMobile from "@/components/NationalDexGridMobile/NationalDexGridMobile";
import { useState, useEffect } from "react";
import styles from "./HomePage.module.scss";
import { useResponsive } from "@/hooks/useResponsive";
import SlidingPane from "@/components/SlidingPane/SlidingPane";
import mysterSrc from "../../assets/mystery.png";
import cardBackSrc from "../../assets/pokemonback.png";

export interface Pokemon {
  id: string;
  name: string;
  generation: number;
  region: string;
  sprite: string;
  originalArtwork: string;
  acquired: boolean;
}

export interface CollectionData {
  num_acquired: number;
  collection: CollectionEntry[];
}

interface CollectionEntry {
  dex_number: number;
  card_id: string;
  card_name: string;
  set_name: string;
  rarity: string;
  acquired_date: string;
  cost: number;
  notes: string;
  upgrade_target: string;
  acquired: boolean;
}

interface PokemonData {
  id: string;
  name: string;
  generation?: number;
  region?: string;
  sprite?: string;
  originalArtwork?: string;
  [key: string]: unknown;
}

interface PokemonQueryData {
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

export default function HomePage() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [acquiredCount, setAcquiredCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaneOpen, setIsPaneOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [pokemonQuery, setPokemonQuery] = useState<PokemonQueryData[]>([]);

  const { isDesktop } = useResponsive();

  useEffect(() => {
    Promise.all([
      fetch("/api/nationaldex").then((res) => res.json()),
      fetch("/api/collection").then((res) => res.json()),
    ])
      .then(
        ([nationaldexData, collectionData]: [
          PokemonData[],
          CollectionData,
        ]) => {
          // Create a map of dex_number -> acquired status for fast lookup
          const acquiredMap = new Map<number, boolean>();
          collectionData.collection.forEach((entry: CollectionEntry) => {
            acquiredMap.set(entry.dex_number, entry.acquired || false);
          });

          // Merge collection data into pokemon data
          const mergedPokemon: Pokemon[] = nationaldexData.map(
            (pokemon: PokemonData): Pokemon => ({
              id: pokemon.id,
              name: pokemon.name,
              generation: (pokemon.generation as number) ?? 0,
              region: (pokemon.region as string) ?? "",
              sprite: (pokemon.sprite as string) ?? "",
              originalArtwork: (pokemon.originalArtwork as string) ?? "",
              acquired: acquiredMap.get(Number(pokemon.id)) ?? false,
            }),
          );

          setAllPokemon(mergedPokemon);
          setAcquiredCount(collectionData.num_acquired);

          setLoading(false);
        },
      )
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isPaneOpen) {
      // Disable background scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "unset";
    }

    // Cleanup function: ensures scroll is restored if the component
    // is removed from the DOM unexpectedly
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPaneOpen]);

  const openCardPane = async (pokemon: Pokemon) => {
    try {
      const res = await fetch(`/api/search/${pokemon.name}`);
      if (!res.ok) throw new Error(res.statusText);
      const query = await res.json();
      // console.log(query)
      setPokemonQuery(Array.isArray(query.cards) ? query.cards : []);
      setSelected(pokemon);
      setIsPaneOpen(true);
      console.log(pokemonQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cards");
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading National Dex...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <>
      <div style={{ position: "relative" }}>
        <header className={styles.homepageHeader}>
          <h1>PokéProject</h1>
          <p>Nationaldex Card Tracker</p>
        </header>
        {!isDesktop ? (
          <NationalDexGridMobile
            allPokemon={allPokemon}
            acquiredCount={acquiredCount}
            openCardPaneCallback={openCardPane}
          />
        ) : (
          <NationalDexGrid
            allPokemon={allPokemon}
            acquiredCount={acquiredCount}
          />
        )}
      </div>
      {selected && (
        <SlidingPane
          isOpen={isPaneOpen}
          onClose={() => {
            setIsPaneOpen(false);
            setSelected(null);
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <h2>{selected!.name}</h2>
            <img
              style={{
                maxWidth: "33%",
                height: "auto",
                filter: "grayscale(1)",
                maxHeight: "250px",
              }}
              src={mysterSrc}
              alt=""
            />
          </div>
          <hr />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              width: "100%",
              marginTop: "2rem",
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              justifyContent: "center",
            }}
          >
            {pokemonQuery.map((card) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "165px",
                  flex: "0 0 165px",
                }}
              >
                <img
                  className=""
                  style={{
                    width: "100%",
                    maxHeight: "250px",
                    borderRadius: ".5rem",
                    objectFit: "contain",
                  }}
                  src={`${card.image ? card.image + "/low.webp" : cardBackSrc}`}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".5rem",
                    justifyContent: "space-between",
                    flex: "1",
                  }}
                >
                  <div style={{ flex: "1" }}>
                    <b
                      style={{
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        maxWidth: "100%",
                        display: "block",
                      }}
                      title={card.set.name}
                    >
                      Set: {card.set.name}
                    </b>
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: ".5rem",
                    }}
                  >
                    <b>
                      {card.localId}/{card.set.cardCount.official}{" "}
                    </b>
                    <button>Add to Collection?</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SlidingPane>
      )}
    </>
  );
}
