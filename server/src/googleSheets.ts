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

export interface CollectionData {
  num_acquired: number;
  collection: CollectionCard[];
}

const nationalDexColumnMap = {
  dexNumber: "A" as ColumnLetter,
  cardName: "B",
  acquired: "C" as ColumnLetter,
  cardId: "D",
  setName: "E",
  setNumber: "F",
  rarity: "G",
  symbol: "H",
  image: "I",
  acquired_date: "J",
  cost: "K",
  notes: "L",
  upgrade_target: "M",
};

export async function getCollection(): Promise<CollectionData> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "MyCollection!A2:I",
  });

  const rows = response.data.values || [];
  let num_acquired = 0;

  const collection = rows.map((row) => {
    if (row[2] == "TRUE") {
      num_acquired++;
    }

    // Card ID, Set Name, Set Number, Rarity, Image, Symbol come from TCGDex
    return {
      dex_number: parseInt(row[0] || "0"),
      card_name: row[1] || "",
      acquired: row[2] == "TRUE" ? true : false,
      card_id: row[3] || "",
      set_name: row[4] || "",
      set_number: row[5] || "",
      rarity: row[6] || "",
      symbol: row[7] || "",
      image: row[8] || "",
      acquired_date: row[9] || "",
      cost: parseFloat(row[10] || "0"),
      notes: row[11] || "",
      upgrade_target: row[12] || "",
    };
  });

  return {
    num_acquired: num_acquired,
    collection,
  };
}

export async function clearAcquisition(dexNumber: number): Promise<void> {
  await updateCell(dexNumber, nationalDexColumnMap.acquired, "FALSE");
}

// MyCollection columns: A=dex, B=card_name, C=acquired, D=card_id, E=set_name, ...
type ColumnLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M";

/** Update a single cell in MyCollection by dex number and column. */
export async function updateCell(
  dexNumber: number,
  column: ColumnLetter,
  value: string | number | boolean,
): Promise<void> {
  const rowNumber = dexNumber + 1;
  const range = `MyCollection!${column}${rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[String(value)]],
    },
  });
}

export async function updateCellAcquisition(
  dexNumber: number,
  acquired: boolean,
): Promise<void> {
  const rowNumber = dexNumber + 1;
  const range = `MyCollection!C${rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[acquired.toString()]],
    },
  });
}

export async function toggleAcquistion(dexNumber: number): Promise<boolean> {
  const collectionData = await getCollection();
  const pokemon = collectionData.collection.find(
    (p) => p.dex_number == dexNumber,
  );

  if (!pokemon) {
    throw new Error(`Pokeon #${dexNumber} not found`);
  }

  const newStatus = !pokemon.acquired;

  await updateCellAcquisition(dexNumber, newStatus);

  return newStatus;
}
