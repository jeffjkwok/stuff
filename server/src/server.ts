import express from "express";
import cors from "cors";
import "dotenv/config";
import mockCards from "./data/mock-cards.json";
import nationalDex from "./data/updatedDex.json";
import {
  getCollection,
  getCollectionEntry,
  toggleAcquistion,
  updateCardData,
  deleteCardDataFromEntry,
} from "./googleSheets";
// import { getCard, getCardsByName } from "./graphQL/tcgdex";
import { getCachedCard, getCachedQueryByName } from "./redis/tcgdexCache";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("📨 Request from:", origin);

      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) {
        console.log("✅ No origin - allowed");
        return callback(null, true);
      }

      // Allow localhost
      if (origin.includes("localhost")) {
        console.log("✅ Localhost - allowed");
        return callback(null, true);
      }

      // Allow ALL Vercel domains
      if (origin.endsWith(".vercel.app")) {
        console.log("✅ Vercel domain - allowed");
        return callback(null, true);
      }

      // Block everything else
      console.log("❌ BLOCKED:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

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
    const response = await getCachedQueryByName(req.params.name);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/card/:cardId", async (req, res) => {
  try {
    console.log(req.params.cardId);
    const response = await getCachedCard(req.params.cardId);
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
    res.status(500).json({ error: "Failed to fetch collection" });
  }
});

app.get("/api/collection/:dexNumber", async (req, res) => {
  try {
    const dexNumber = parseInt(req.params.dexNumber);
    const entry = await getCollectionEntry(dexNumber);
    res.json(entry);
  } catch (error) {
    console.error("Error fetching entry in collection:", error);
    res.status(500).json({ error: "Failed to fetch collection entry" });
  }
});

app.get("/api/collection/remove/:dexNumber", async (req, res) => {
  try {
    const dexNumber = parseInt(req.params.dexNumber);
    await deleteCardDataFromEntry(dexNumber);
  } catch (error) {
    console.error("Error fetching entry in collection:", error);
    res.status(500).json({ error: "Failed to fetch collection entry" });
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

app.post("/api/collection/card/:dexNumber", async (req, res) => {
  const cardData = req.body;

  try {
    const dexNumber = parseInt(req.params.dexNumber);
    const collectionItem = await updateCardData(dexNumber, cardData);
    res.json({ success: true, entry: collectionItem });
  } catch (error) {
    console.error(
      `Error adding card to Collection row ${req.params.dexNumber}: ${error}`,
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mock data loaded! `);
});
