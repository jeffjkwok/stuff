import styles from './App.module.scss';
import { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        console.log('Success!', data);
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err)
      })
  }, []);

  return (
    <>
      <div className={styles.container}>
        <h1>Pokedex Tracker</h1>
        <div>
          <h2>Backend test</h2>

          {loading && <p>Loading...</p>}

          {error && (
            <div style={{ color: "red" }}>
              <p>Error: {error}</p>
              <p>Check that your backend is running on por 3001</p>
            </div>
          )}

          {health && (
            <div>
              <h3>Backend Connected!</h3>
              <pre style={{
                background: '#f4f4f4',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto'
              }}>
                {JSON.stringify(health, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
