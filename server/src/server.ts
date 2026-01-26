import express from 'express';
import 'dotenv/config'
import mockCards from './data/mock-cards.json'

const app = express();
const PORT = 3001;

app.use(express.json());

const cardMap = new Map(mockCards.map((card: any) => [card.id, card]))

app.get('/api/health', (req, res) => {
    res.json({
        status: "ok",
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
})

app.get('/api/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await new Promise(resolve => setTimeout(resolve, 500))

        const card = cardMap.get(id)

        if (card) {
            res.json(card);
        } else {
            res.status(404).json({ error: 'Card not found' })
        }

        // const response = await fetch(
        //     `https://api.pokemontcg.io/v2/cards/${id}`,
        //     {
        //         headers: {
        //             'X-Api-Key': process.env.POKEMON_TCG_API_KEY || ''
        //         }
        //     }
        // )

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
    console.log(`Mock data loaded! `)
})