import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Preloader from './components/Preloader'
import { CartProvider } from './context/CartContext'
import { supabase } from './lib/supabase'

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulamos una carga inicial para asegurar que React y los primeros datos estén listos
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000); // 2 segundos de preloader para asegurar una experiencia premium

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Cargar y aplicar fuentes seleccionadas
    const loadDynamicFonts = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('content')
          .eq('section', 'general')
          .single();
          
        if (data?.content) {
          const titleFont = data.content.title_font || 'Playfair Display';
          const bodyFont = data.content.body_font || 'Outfit';
          
          const titleUrl = titleFont.replace(/ /g, '+');
          const bodyUrl = bodyFont.replace(/ /g, '+');
          
          const linkId = 'dynamic-site-fonts';
          let fontLink = document.getElementById(linkId);
          if (!fontLink) {
            fontLink = document.createElement('link');
            fontLink.id = linkId;
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
          }
          fontLink.href = `https://fonts.googleapis.com/css?family=${titleUrl}:300,400,600,700|${bodyUrl}:300,400,600,700&display=swap`;
          
          document.documentElement.style.setProperty('--font-serif', `"${titleFont}", serif`);
          document.documentElement.style.setProperty('--font-sans', `"${bodyFont}", sans-serif`);
        }
      } catch (err) {
        console.error('Error cargando fuentes dinámicas:', err);
      }
    };
    
    loadDynamicFonts();
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
