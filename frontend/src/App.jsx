import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Admin from './pages/Admin'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen">
        <Navbar />
        <CartDrawer />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            {/* Future routes like /reset-password will go here */}
          </Routes>
        </main>
        
        <footer className="py-12 border-t border-slate-200 text-center text-sm text-gray-400">
          <p>&copy; 2026 byTokio - Un santuario de bienestar.</p>
        </footer>
      </div>
    </Router>
  </CartProvider>
  )
}

export default App
