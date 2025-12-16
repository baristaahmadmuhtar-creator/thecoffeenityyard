import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Perhatikan: Kita pakai console.info (bukan console.log)
if (import.meta.env.MODE === 'production') {
  console.info(
    "%cDeveloped with ❤️ by BaristaAhmadmuhtar",
    "background: #1e293b; color: #f59e0b; font-size: 14px; font-weight: bold; padding: 10px; border-radius: 5px; border: 1px solid #f59e0b;"
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)