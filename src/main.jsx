import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Load HubSpot chat widget
const hsScript = document.createElement('script');
hsScript.id = 'hs-script-loader';
hsScript.type = 'text/javascript';
hsScript.async = true;
hsScript.defer = true;
hsScript.src = 'https://js.hs-scripts.com/443128022.js';
document.head.appendChild(hsScript);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)