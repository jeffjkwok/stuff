/* eslint-disable  @typescript-eslint/no-explicit-any */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function fetchAllSpritesAndUpdateJson() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const jsonPath = path.resolve(__dirname, "../data/national-dex.json");
  const rawData = fs.readFileSync(jsonPath, "utf8");
  const data: any[] = JSON.parse(rawData);

  const updatedData = await Promise.all(
    data.map(async (pokemon: any, index: number) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        console.log(`Fetching sprite for ${pokemon.name}..`);

        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${index + 1}`,
        );

        if (!response.ok) {
          console.log(
            `Failed to fetch ${pokemon.name} sprite (status: ${response.status})`,
          );
          return pokemon;
        }

        const apiData = await response.json();
        console.log(`Success! retrieved ${pokemon.name}'s sprite`);

        return {
          ...pokemon,
          // Adjust the path here if you want a different sprite variant
          sprite: apiData.sprites?.front_default ?? null,
          originalArtwork:
            apiData.sprites?.other?.["official-artwork"]?.front_default ?? null,
        };
      } catch (err) {
        console.log(`Error fetching ${pokemon.name}: ${String(err)}`);
        return pokemon;
      }
    }),
  );

  const outputPath = path.resolve(__dirname, "../data/updatedDex.json");
  fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 4), "utf8");
}

fetchAllSpritesAndUpdateJson();
