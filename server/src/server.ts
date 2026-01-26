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

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})