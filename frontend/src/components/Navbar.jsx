import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { setIsCartOpen, cartCount } = useCart();
  const navigate = useNavigate();
  const [logoSettings, setLogoSettings] = useState({
    type: 'text',
    text: '',
    url: ''
  });

  useEffect(() => {
    // Escuchar cambios de autenticación
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .eq('section', 'general')
          .single();

        if (data?.content) {
          setLogoSettings({
            type: data.content.logo_type || 'text',
            text: data.content.logo_text || '',
            url: data.content.logo_url || ''
          });
        }
      } catch (err) {
        console.error('Error loading logo settings:', err);
      }
    };

    fetchLogoSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Servicios', href: '#servicios' },
    { title: 'Productos', href: '#productos' },
    { title: 'Contacto', href: '#contacto' },
  ];

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div
              className={`cursor-pointer transition-transform hover:scale-105 active:scale-95`}
              onClick={() => navigate('/')}
            >
              {logoSettings.type === 'image' && logoSettings.url ? (
                <img src={logoSettings.url} alt="Logo" className="h-10 w-auto" />
              ) : (
                <span className="text-2xl font-serif italic text-primary-900">{logoSettings.text}</span>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {menuItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-primary-600 ${isScrolled ? 'text-slate-600' : 'text-slate-500'
                  }`}
              >
                {item.title}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-primary-900 border border-primary-900/10 rounded-full hover:bg-primary-50 transition-all"
                >
                  <User size={20} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-all"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="p-2 text-primary-900 border border-primary-900/10 rounded-full hover:bg-primary-50 transition-all"
              >
                <User size={20} />
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-primary-600 border border-primary-900/10 rounded-full hover:bg-primary-50 transition-all"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-primary-900"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col p-8 space-y-6">
              {menuItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="text-lg font-serif italic text-primary-900 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Navbar;
