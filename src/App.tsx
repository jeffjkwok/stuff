import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage/HomePage';
import CardDetailPage from './pages/detail/CardDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/card/:id" element={<CardDetailPage />} />
    </Routes>
  );
}

export default App;