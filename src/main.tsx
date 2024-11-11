import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { BrowserRouter } from "react-router-dom"
import GlobalContextProvider from './context/GlobalContext.tsx'

import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalContextProvider>
      <BrowserRouter>
        <Toaster />
        <App />
      </BrowserRouter>
    </GlobalContextProvider>
  </StrictMode>,
)
