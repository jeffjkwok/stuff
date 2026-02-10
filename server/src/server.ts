/* eslint-disable  @typescript-eslint/no-explicit-any */

import express from "express";
import "dotenv/config";
import mockCards from "./data/mock-cards.json";
import nationalDex from "./data/updatedDex.json";
import { getCollection, toggleAcquistion } from "./googleSheets";

const app = express();
const PORT = 3001;

app.use(express.json());

const cardMap = new Map(mockCards.map((card: any) => [card.id, card]));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/cards", (req, res) => {
  res.json(mockCards);
});

app.get("/api/nationaldex", (req, res) => {
  res.json(nationalDex);
});

app.get("/api/collection", async (req, res) => {
  try {
    const collection = await getCollection();
    res.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ error: "Failed tofetch colleciton" });
  }
});

app.post("/api/collection/acquired/:dexNumber", async (req, res) => {
  // UPDATE LOGIC HERE
  // console.log(req,res)
  try {
    const dexNumber = parseInt(req.params.dexNumber);
    const newStatus = await toggleAcquistion(dexNumber);
    res.json({ success: true, acquired: newStatus });
  } catch (error) {
    console.error("Error toggling pokemon:", error);
    res
      .status(500)
      .json({ error: "Failed to update acquistion status of pokemon" });
  }
});

app.get("/api/pokemon/sprite/:pokeId", async (req, res) => {
  try {
    const { pokeId } = req.params;
    console.log(pokeId);

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Pokemon not found",
      });
    }

    const data = await response.json();
    console.log(data);
    res.json(data.sprites);
  } catch (err) {
    console.error("Erro fetching card:", err);
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

app.get("/api/cards/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const card = cardMap.get(id);

    if (card) {
      res.json(card);
    } else {
      res.status(404).json({ error: "Card not found" });
    }

    // const response = await fetch(
    //     `https://api.pokemontcg.io/v2/cards/${id}`,
    //     {
    //         headers: {
    //             'X-Api-Key': process.env.POKEMON_TCG_API_KEY || ''
    //         }
    //     }
    // )

    // if (!response.ok) {
    //     return res.status(response.status).json({
    //         error: 'Card not found'
    //     });
    // }

    // const data = await response.json();
    // res.json(data.data);
  } catch (err) {
    console.error("Erro fetching card:", err);
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mock data loaded! `);
});
