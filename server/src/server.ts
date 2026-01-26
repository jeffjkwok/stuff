import express from 'express';

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

app.get('/api/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const response = await fetch(
            `https://api.pokemontcg.io/v2/cards/${id}`
        )

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Card not found'
            });
        }

        const data = await response.json();
        res.json(data.data);

    } catch (err) {
        console.error('Erro fetching card:', err);
        res.status(500).json({error: 'Failed to fetch cardF'})
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})