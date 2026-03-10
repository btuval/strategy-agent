import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Force the 'dark' class on the HTML element so all UI libraries sync with the theme
document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)