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
  toggleLanguage,
  toggleHoloReverseStatus,
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
    console.error("Error toggling acquistion status for entry:", error);
    res
      .status(500)
      .json({ error: "Failed to update acquistion status of entry" });
  }
});

app.post("/api/collection/language/:dexNumber", async (req, res) => {
  try {
    const dexNumber = parseInt(req.params.dexNumber);
    const newStatus = await toggleLanguage(dexNumber);
    res.json({ success: true, language: newStatus });
  } catch (error) {
    console.error("Error toggling langauge for entry:", error);
    res.status(500).json({ error: "Failed to update language of entry" });
  }
});

app.post("/api/collection/holo/:dexNumber", async (req, res) => {
  try {
    const dexNumber = parseInt(req.params.dexNumber);
    const newStatus = await toggleHoloReverseStatus(dexNumber);
    res.json({ success: true, holoReverse: newStatus });
  } catch (error) {
    console.error("Error toggling holo/reverse status for entry:", error);
    res
      .status(500)
      .json({ error: "Failed to update holo/reverse status of entry" });
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
      `Error assigning card to Collection row ${req.params.dexNumber}: ${error}`,
    );
  }
});

app.get("/api/image-proxy", async (req, res) => {
  const { url } = req.query;

  // Validate it's from the expected asset host
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "assets.tcgdex.net") {
      // swap in the actual hostname
      return res.status(403).json({ error: "Blocked" });
    }
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    res.set("Content-Type", response.headers.get("content-type"));
    res.set("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: `Image fetch failed, ${err}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mock data loaded! `);
});
