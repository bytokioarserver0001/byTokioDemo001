import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Preloader from './components/Preloader'
import { CartProvider } from './context/CartContext'

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulamos una carga inicial para asegurar que React y los primeros datos estén listos
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000); // 2 segundos de preloader para asegurar una experiencia premium

    return () => clearTimeout(timer);
  }, []);

  return (
    <CartProvider>
      <AnimatePresence mode="wait">
        {isAppLoading && <Preloader key="preloader" />}
      </AnimatePresence>

      <Router>
        <div className="min-h-screen">
          <Navbar />
          <CartDrawer />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>

          <footer className="py-12 border-t border-slate-200 text-center text-sm text-gray-400">
            <p>&copy; 2026 byTokio.ar - Todos los derechos reservados</p>
          </footer>
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
