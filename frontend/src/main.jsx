import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
// compiled tailwind output if available
import './tailwind.generated.css'
// fallback minimal CSS when Tailwind isn't processed by PostCSS
import './fallback.css'
// internal stylesheet to provide consistent styles when Tailwind isn't available
import './internal.css'
import AuthProvider from './context/AuthProvider'
import {CartProvider} from './context/CartProvider'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <App />
            <Toaster position="top-right" />
          </Layout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
