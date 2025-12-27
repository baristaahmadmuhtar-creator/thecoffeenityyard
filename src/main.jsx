import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' //  
import App from './App.jsx'
import './index.css'

if (import.meta.env.MODE === 'production') {
  console.info(
    "%cDeveloped with ❤️ by BaristaAhmadmuhtar",
    "background: #1e293b; color: #f59e0b; font-size: 14px; font-weight: bold; padding: 10px; border-radius: 5px; border: 1px solid #f59e0b;"
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Bungkus App dengan BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)