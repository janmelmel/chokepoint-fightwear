import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Must be set BEFORE the HubSpot script loads
window.hsConversationsSettings = {
  loadImmediately: true,
};

window.hsConversationsOnReady = [
  function() {
    window.HubSpotConversations.widget.load();
  }
];

const hsScript = document.createElement('script');
hsScript.id = 'hs-script-loader';
hsScript.type = 'text/javascript';
hsScript.async = true;
hsScript.defer = true;
hsScript.src = '//js.hs-scripts.com/443128022.js';
document.head.appendChild(hsScript);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)