import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const wotcSets = [
    'base1',
    'base2',
    'base3',
    'base4',
    'base5',
    'gym1',
    'gym2',
    'neo1',
    'neo2',
    'neo3',
    'neo4',
    'base6',
    'ecard1',
    'ecard2',
    'ecard3'
];

async function fetchAllCards() {
    const allCards: any[] = [];

    for (const setId of wotcSets) {
        try {
            console.log(`Fetching ${setId}..`)
            const response = await fetch(
                `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&pageSize=250`,
                {
                    headers: {
                        'X-Api-Key': process.env.POKEMON_TCG_API_KEY || ''
                    }
                }

            )
            if (response.ok) {
                const data = await response.json();
                allCards.push(...data.data);
                console.log(`Got ${data.data.length} cards from ${setId}`);

            } else {
                console.log(`Failed to fetch ${setId}`)
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.log(`Error fetching ${setId}: ${err}`)
        }

    }

    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }

    const filePath = path.join(dataDir, 'wotc-cards.json');
    fs.writeFileSync(filePath, JSON.stringify(fetchAllCards, null, 2));

    console.log(`Done!: saved ${allCards.length} to ${filePath}`)
}

fetchAllCards();
