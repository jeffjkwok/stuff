import { getCollection } from "./googleSheets";

async function test() {
  console.log("Testing Google Sheets connection...");
  try {
    const data = await getCollection();
    console.log("✅ SUCCESS! Connected to Google Sheets");
    console.log("📊 Found", data.length, "cards in collection");
    console.log("Data:", data);
  } catch (error) {
    console.error("❌ ERROR:", error);
  }
}

test();
