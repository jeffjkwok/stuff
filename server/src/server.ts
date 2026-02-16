import express from "express";
import "dotenv/config";
import mockCards from "./data/mock-cards.json";
import nationalDex from "./data/updatedDex.json";
import { getCollection, toggleAcquistion } from "./googleSheets";
import { getCard, getCardsByName } from "./graphQL/tcgdex";

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/search/:name", async (req, res) => {
  try {
    const response = await getCardsByName(req.params.name);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/card/:cardId", async (req, res) => {
  try {
    console.log(req.params.cardId);
    const response = await getCard(req.params.cardId);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mock data loaded! `);
});
