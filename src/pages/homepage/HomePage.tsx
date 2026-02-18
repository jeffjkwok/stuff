import NationalDexGrid from "@/components/NationalDexGrid/NationalDexGrid";
import NationalDexGridMobile from "@/components/NationalDexGridMobile/NationalDexGridMobile";
import { useState, useEffect } from "react";
import styles from "./HomePage.module.scss";
import { useResponsive } from "@/hooks/useResponsive";
import SlidingPane from "@/components/SlidingPane/SlidingPane";
import CardProfile from "@/components/CardProfile/CardProfile";

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

export default function HomePage() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [acquiredCount, setAcquiredCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaneOpen, setIsPaneOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Pokemon | null>(null);

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

  const openCardPane = (pokemon: Pokemon) => {
    setSelected(pokemon);
    setIsPaneOpen(true);
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
      {selected && !isDesktop && (
        <SlidingPane
          isOpen={isPaneOpen}
          onClose={() => {
            setIsPaneOpen(false);
            setSelected(null);
          }}
        >
          <CardProfile pokemon={selected} />
        </SlidingPane>
      )}
    </>
  );
}
