import type { Pokemon } from "../NationalDexGrid/NationalDexGrid";
import styles from "./NationalDexGridItem.module.scss";
import { useEffect, useRef, useState } from "react";

interface NationalDexGridItemProps {
  pokemon: Pokemon;
}

export default function NationalDexGridItem({
  pokemon,
}: NationalDexGridItemProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [dynamicClipPathValue, setDynamicClipPathValue] = useState<number>(0);

  const getClipPathValue = function () {
    if (cardRef.current && imageRef.current) {
      setDynamicClipPathValue(
        imageRef.current.clientWidth - cardRef.current.clientWidth,
      );
    }
  };

  useEffect(() => {
    getClipPathValue();

    const handleResize = () => {
      getClipPathValue();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const clipPathStyle = {
    clipPath: `inset(0 ${dynamicClipPathValue}px 0 0)`,
  };

  const clipPathHoverStyle = {
    clipPath: `inset(0 ${dynamicClipPathValue}px 0 -50%)`,
  };

  return (
    <div
      key={pokemon.id}
      className={`${styles.card} ${pokemon.acquired ? styles.acquired : ""}`}
      onClick={() => {
        console.log(`This is #${pokemon.id}, ${pokemon.name} `);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={cardRef}
    >
      <div className={styles.cardInfo}>
        <h3 className={styles.cardName}>{pokemon.name}</h3>
        <p className={styles.cardSet}>#{pokemon.id}</p>
        <div
          className={styles.placeholderImageWrapper}
          style={isHovered ? clipPathHoverStyle : clipPathStyle}
        >
          <img
            ref={imageRef}
            className={[styles.placeholderImage].join(" ")}
            src={pokemon.originalArtwork}
            onLoad={() => getClipPathValue()}
            loading="lazy"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}
