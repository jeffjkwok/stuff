import express from 'express';
import 'dotenv/config'

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: "ok",
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
})

const mockCards: Record<string, any> = {
    'base1-4': {
        id: 'base1-4',
        name: 'Charizard',
        nationalPokedexNumbers: [6],
        images: {
            small: 'https://images.pokemontcg.io/base1/4.png',
            large: 'https://images.pokemontcg.io/base1/4_hires.png'
        },
        hp: '120',
        types: ['Fire'],
        set: {
            id: 'base1',
            name: 'Base',
            series: 'Base'
        },
        rarity: 'Rare Holo'
    },
    'base1-1': {
        id: 'base1-1',
        name: 'Alakazam',
        nationalPokedexNumbers: [65],
        images: {
            small: 'https://images.pokemontcg.io/base1/1.png',
            large: 'https://images.pokemontcg.io/base1/1_hires.png'
        },
        hp: '80',
        types: ['Psychic'],
        set: {
            id: 'base1',
            name: 'Base',
            series: 'Base'
        },
        rarity: 'Rare Holo'
    },
    'xy1-1': {
        id: 'xy1-1',
        name: 'Venusaur-EX',
        nationalPokedexNumbers: [3],
        images: {
            small: 'https://images.pokemontcg.io/xy1/1.png',
            large: 'https://images.pokemontcg.io/xy1/1_hires.png'
        },
        hp: '180',
        types: ['Grass'],
        set: {
            id: 'xy1',
            name: 'XY',
            series: 'XY'
        },
        rarity: 'Rare Holo EX'
    }
};

app.get('/api/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await new Promise(resolve => setTimeout(resolve, 500))

        // const response = await fetch(
        //     `https://api.pokemontcg.io/v2/cards/${id}`,
        //     {
        //         headers: {
        //             'X-Api-Key': process.env.POKEMON_TCG_API_KEY || ''
        //         }
        //     }
        // )

        if (mockCards[id]) {
            return res.json(mockCards[id]);
        }

        res.status(404).json({ error: 'Card not found' });

        // if (!response.ok) {
        //     return res.status(response.status).json({
        //         error: 'Card not found'
        //     });
        // }

        // const data = await response.json();
        // res.json(data.data);

    } catch (err) {
        console.error('Erro fetching card:', err);
        res.status(500).json({ error: 'Failed to fetch card' })
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})