import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// To double check that App is not double invoking effects in non-dev Environments
// createRoot(document.getElementById('root')!).render(
//   <App />
// )
