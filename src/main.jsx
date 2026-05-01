import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Facebook Messenger Chat Plugin
window.fbAsyncInit = function() {
  // eslint-disable-next-line no-undef
  FB.init({
    xfbml: true,
    version: 'v19.0'
  });
};

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)