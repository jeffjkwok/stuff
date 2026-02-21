import { useState, useEffect } from "react";
import { useResponsive } from "@/hooks/useResponsive";
import CardProfile from "@/components/CardProfile/CardProfile";
import NationalDexGridMobile from "@/components/NationalDexGridMobile/NationalDexGridMobile";
import SlidingPane from "@/components/SlidingPane/SlidingPane";
import type { Pokemon } from "@/types";
import styles from "./homepage.module.scss";

export default function HomePage() {
  const [isPaneOpen, setIsPaneOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Pokemon | null>(null);

  const { isDesktop } = useResponsive();

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
    // await query
    // await collectionEntry

    setSelected(pokemon);
    setIsPaneOpen(true);
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <header className={styles.homepageHeader}>
          <h1>PokéProject</h1>
          <p>Nationaldex Card Tracker</p>
        </header>
        <NationalDexGridMobile openCardPaneCallback={openCardPane} />
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
