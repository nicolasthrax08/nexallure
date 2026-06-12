import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import '@fontsource/playfair-display/700.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'

import { Toaster } from 'react-hot-toast'
import GlobalLoader from './components/GlobalLoader.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalLoader>
      <App />
    </GlobalLoader>
    <Toaster 
      position="top-center"
      toastOptions={{
        style: {
          background: '#141820',
          color: '#fff',
          border: '1px solid rgba(201, 168, 76, 0.2)',
        },
      }}
    />
  </React.StrictMode>,
)
