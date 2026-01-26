import styles from './App.module.scss';
import { useState } from 'react';

interface Card {
  id: string,
  artist: string,
  name: string;
  nationalPokedexNumbers: number[];
  images: {
    small: string,
    large: string,
  }
  set: {
    name: string;
    series: string;
    images: {
      symbol: string;
      logo: string;
    }
  }
  rarity: string;
}

function App() {
  const [cardId, setCardId] = useState('base1-4');
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCard = async () => {
    if (!cardId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cards/${cardId}`);

      if (!response.ok) {
        throw new Error('Card not found');
      }

      const data = await response.json();
      setCard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch card');
      setCard(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={styles.container}>
        <h1>Pokedex Tracker</h1>
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            ❌ Error: {error}
          </div>
        )}
        <div>
          <h2>Card search by ID</h2>
          <input type='text' value={cardId} onChange={(e) => setCardId(e.target.value)} placeholder="Enter card ID (e.g., base 1-4)" onKeyDown={(e) => e.key === 'Enter' && fetchCard()} />
          <button onClick={fetchCard} disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
        </div>

        {card && (
          <div>
            <h2>{card.name}</h2>
            <img src={card.images.large} alt="card.name" />

            <div>
              <p>ID: {card.id} </p>
              <p>Set: {card.set.name} {card.set.series}</p>
              <p>Rarity: {card.rarity}</p>
              <p><strong>Pokedex #:</strong> {card.nationalPokedexNumbers.join(', ')}</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
