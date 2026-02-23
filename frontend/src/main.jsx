import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './index.css'
import App from './App.jsx'

// Apply saved theme on startup
try {
  const saved = localStorage.getItem('userSettings')
  if (saved) {
    const { appearance } = JSON.parse(saved)
    const root = document.documentElement
    if (appearance === 'Classic Dark') {
      root.style.setProperty('--bg-primary', '#1a1a2e')
      root.style.setProperty('--bg-secondary', '#16213e')
      root.style.setProperty('--bg-card', '#1a1a2e')
      document.body.style.backgroundColor = '#1a1a2e'
    } else if (appearance === 'Glass') {
      root.style.setProperty('--bg-primary', '#0d1117')
      root.style.setProperty('--bg-secondary', '#161b22')
      root.style.setProperty('--bg-card', '#21262d')
      document.body.style.backgroundColor = '#0d1117'
    }
  }
} catch { }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
