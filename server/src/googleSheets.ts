import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../credentials.json"),
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

export interface CollectionCard {
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

export async function getCollection(): Promise<CollectionCard[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "MyCollection!A2:J",
  });

  const rows = response.data.values || [];

  return rows.map((row) => ({
    dex_number: parseInt(row[0] || "0"),
    card_name: row[1] || "",
    acquired: row[2] == "TRUE" ? true : false,
    card_id: row[3] || "",
    set_name: row[4] || "",
    rarity: row[5] || "",
    acquired_date: row[6] || "",
    cost: parseFloat(row[7] || "0"),
    notes: row[8] || "",
    upgrade_target: row[9] || "",
  }));
}

export async function updateCollection(
  dexNumber: number,
  acquired: boolean,
): Promise<void> {
  // Only Supports Acquired update
  const rowNumber = dexNumber + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `MyCollection!C${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[acquired.toString().toUpperCase()]],
    },
  });
}

export async function toggleAcquistion(dexNumber: number): Promise<boolean> {
  const collection = await getCollection();
  const pokemon = collection.find((p) => p.dex_number == dexNumber);

  if (!pokemon) {
    throw new Error(`Pokeon #${dexNumber} not found`);
  }

  const newStatus = !pokemon.acquired;

  await updateCollection(dexNumber, newStatus);

  return newStatus;
}
