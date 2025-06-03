import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';   // This now correctly refers to our refactored App
import './index.css';       // Vite's default global styles (can be kept or modified)
import './App.css';         // Our main application styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
