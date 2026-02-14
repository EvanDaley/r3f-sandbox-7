import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ updated import
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // ✅ new API

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Optional: continue logging performance
// reportWebVitals(console.log);
