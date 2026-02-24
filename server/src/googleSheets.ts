import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import type { CollectionEntry, CollectionData, CardData } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

let auth;
if (process.env.GOOGLE_CREDENTIALS) {
  // Production: Use environment variable
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
} else {
  // Local development: Use file
  auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../credentials.json"),
    scopes: SCOPES,
  });
}

const sheets = google.sheets({ version: "v4", auth });

const nationalDexColumnMap = {
  dexNumber: "A" as ColumnLetter,
  cardName: "B" as ColumnLetter,
  acquired: "C" as ColumnLetter,
  cardId: "D" as ColumnLetter,
  setName: "E" as ColumnLetter,
  setNumber: "F" as ColumnLetter,
  rarity: "G" as ColumnLetter,
  image: "H" as ColumnLetter,
  illustrator: "I" as ColumnLetter,
  language: "J" as ColumnLetter,
  holoReverse: "K" as ColumnLetter,
  upgrade_target: "L" as ColumnLetter,
};

export async function getCollection(): Promise<CollectionData> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "MyCollection!A2:I", // Excludes notes and targets
  });

  const rows = response.data.values || [];

  const collection = rows.map((row) => ({
    dex_number: parseInt(row[0] || "0"),
    card_name: row[1] || "",
    acquired: row[2] === "TRUE", // Simplified boolean check
    card_id: row[3] || "",
    set_name: row[4] || "",
    set_number: row[5] || "",
    rarity: row[6] || "",
    image: row[7] || "",
    illustrator: row[8] || "",
    language: row[9] || "",
    holo_reverse: row[10] || "",
    cost: row[11] || "",
  }));

  return { collection };
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
  | "L";

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

// Adding Card data from Query of TCG DEX
export async function updateCardData(
  dexNumber: number,
  cardData: CardData,
): Promise<CollectionEntry> {
  const rowNumber = dexNumber + 1;
  const range = `MyCollection!D${rowNumber}:K${rowNumber}`;

  console.log(cardData.language);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          cardData.cardId,
          cardData.setName,
          cardData.setNumber,
          cardData.rarity,
          cardData.image,
          cardData.illustrator || "",
          cardData.language,
          cardData.holoReverse,
        ],
      ],
    },
  });

  return await getCollectionEntry(dexNumber);
}

export async function deleteCardDataFromEntry(
  dexNumber: number,
): Promise<void> {
  const rowNumber = dexNumber + 1;
  const range = `MyCollection!D${rowNumber}:K${rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["", "", "", "", "", "", "", "", ""]],
    },
  });
}

// Get row data for specific entry/pokemon
export async function getCollectionEntry(
  dexNumber: number,
): Promise<CollectionEntry> {
  const rowNumber = dexNumber + 1;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `MyCollection!${rowNumber}:${rowNumber}`,
  });

  const rawRowValues = res.data.values![0];

  const {
    0: dex_number,
    1: card_name,
    2: acquired,
    3: card_id,
    4: set_name,
    5: set_number,
    6: rarity,
    7: image,
    8: illustrator,
    9: language,
    10: holo_reverse,
  } = rawRowValues;

  const collectionItem = {
    dex_number: Number(dex_number),
    card_name,
    acquired: acquired == "TRUE" ? true : false,
    card_id,
    set_name,
    set_number,
    rarity,
    image,
    illustrator,
    language,
    holo_reverse,
  };

  return collectionItem;
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

// Toggle Acquistion value
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
