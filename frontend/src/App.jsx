import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Preloader from './components/Preloader'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
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
    // Cargar y aplicar fuentes y paletas seleccionadas
    const loadDynamicSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('content')
          .eq('section', 'general')
          .single();
          
        if (data?.content) {
          // FUENTES
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

          // PALETAS DE COLORES
          const palette = data.content.selected_palette || 'paleta001.png';
          
          // Mapeo de colores por archivo
          const palettes = {
            'paleta001.png': {
              '--color-slate-100': '#E9E6E7',
              '--color-slate-900': '#5E5653',
              '--color-primary-500': '#6B7C98',
              '--color-primary-600': '#5A6A85',
              '--color-accent-blue': '#7B7F8A',
              '--color-neutral-taupe': '#AB978C'
            },
            'paleta002.png': {
              '--color-slate-100': '#F1F3F0', // Nature / Sage
              '--color-slate-900': '#2D342F',
              '--color-primary-500': '#7D8B7A',
              '--color-primary-600': '#637061',
              '--color-accent-blue': '#AAB3A8',
              '--color-neutral-taupe': '#D4C8BE'
            },
            'paleta003.png': {
              '--color-slate-100': '#F9F6F2', // Warm / Sand
              '--color-slate-900': '#4A3E3B',
              '--color-primary-500': '#C89B8C',
              '--color-primary-600': '#AF8274',
              '--color-accent-blue': '#D9C5B2',
              '--color-neutral-taupe': '#E6D5C3'
            }
          };

          const colors = palettes[palette] || palettes['paleta001.png'];
          Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
          });
        }
      } catch (err) {
        console.error('Error cargando ajustes dinámicos:', err);
      }
    };
    
    loadDynamicSettings();
  }, []);

  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App
