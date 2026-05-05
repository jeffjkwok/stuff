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
import { pingRedis } from "./redis/redis";
import { ensureCardImage, isSupabaseConfigured } from "./storage/supabase";
import {
  getOrFetch as getOrFetchImage,
  stats as imageProxyStats,
} from "./storage/imageProxyCache";

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

app.get("/api/health", async (_req, res) => {
  const redis = await pingRedis();
  res.status(redis.ok ? 200 : 503).json({
    status: redis.ok ? "ok" : "degraded",
    redis,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/search/:name", async (req, res) => {
  try {
    const response = await getCachedQueryByName(req.params.name);
    res.json(response);
  } catch (error) {
    console.error("Error searching cards:", error);
    res.status(502).json({ error: "Upstream search failed" });
  }
});

app.get("/api/card/:cardId", async (req, res) => {
  try {
    const response = await getCachedCard(req.params.cardId);
    res.json(response);
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(502).json({ error: "Upstream card fetch failed" });
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

    // Mirror the image to Supabase and store *that* URL in the sheet so we
    // never depend on TCGdex's CDN at view time.
    if (cardData.cardId && cardData.image && isSupabaseConfigured()) {
      try {
        cardData.image = await ensureCardImage(cardData.cardId, cardData.image);
      } catch (err) {
        console.error(
          `[Supabase] mirror failed for ${cardData.cardId}, keeping TCGdex URL:`,
          err,
        );
      }
    }

    const collectionItem = await updateCardData(dexNumber, cardData);
    res.json({ success: true, entry: collectionItem });
  } catch (error) {
    console.error(
      `Error assigning card to Collection row ${req.params.dexNumber}: ${error}`,
    );
    res.status(500).json({ error: "Failed to assign card" });
  }
});

const ALLOWED_IMAGE_HOSTS = new Set(["assets.tcgdex.net"]);

app.get("/api/image-proxy", async (req, res) => {
  const rawUrl = req.query.url;
  if (typeof rawUrl !== "string" || !rawUrl) {
    return res.status(400).json({ error: "Missing url param" });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }
  if (!ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) {
    return res.status(403).json({ error: "Blocked host" });
  }

  try {
    const { entry, hit } = await getOrFetchImage(rawUrl, async () => {
      const upstream = await fetch(rawUrl);
      if (!upstream.ok) {
        throw new Error(`upstream ${upstream.status}`);
      }
      return {
        body: Buffer.from(await upstream.arrayBuffer()),
        contentType: upstream.headers.get("content-type") || "image/webp",
      };
    });

    res.set("Content-Type", entry.contentType);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.set("X-Cache", hit ? "HIT" : "MISS");
    return res.send(entry.body);
  } catch (err) {
    console.error("[image-proxy]", rawUrl, (err as Error).message);
    return res.status(502).json({ error: "Image fetch failed" });
  }
});

app.get("/api/image-proxy/stats", (_req, res) => {
  res.json(imageProxyStats());
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mock data loaded! `);
});
