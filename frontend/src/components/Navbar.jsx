import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();
  const { setIsCartOpen, cartCount } = useCart();
  const navigate = useNavigate();
  const [logoSettings, setLogoSettings] = useState({
    type: 'text',
    text: '',
    url: ''
  });
  const [sectionVisibilities, setSectionVisibilities] = useState({
    services: true,
    productos: true,
    turnos: true
  });

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .in('section', ['general', 'services_section', 'products_section', 'turnos_section']);
        
        let logoTemp = { type: 'text', text: '', url: '' };
        let servTemp = true;
        let prodTemp = true;
        let turnosTemp = true;

        if (data) {
          data.forEach(item => {
            if (item.section === 'general' && item.content) {
               logoTemp = {
                 type: item.content.logo_type || 'text',
                 text: item.content.logo_text || '',
                 url: item.content.logo_url || ''
               };
            }
            if (item.section === 'services_section' && item.content) {
               servTemp = item.content.is_visible !== false;
            }
            if (item.section === 'products_section' && item.content) {
               prodTemp = item.content.is_visible !== false;
            }
            if (item.section === 'turnos_section' && item.content) {
               turnosTemp = item.content.is_visible !== false;
            }
          });
          setLogoSettings(logoTemp);
          setSectionVisibilities({ services: servTemp, productos: prodTemp, turnos: turnosTemp });
        }
      } catch (err) {
        console.error('Error loading nav settings:', err);
      }
    };

    fetchSections();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { title: 'Inicio', href: '/' },
    ...(sectionVisibilities.services ? [{ title: 'Servicios', href: '#servicios' }] : []),
    ...(sectionVisibilities.productos ? [{ title: 'Productos', href: '#productos' }] : []),
    ...(sectionVisibilities.turnos ? [{ title: 'Turnos', href: '#turnos' }] : []),
    { title: 'Contacto', href: '#contacto' },
  ];

  return (
    <>
      <nav
        className="sticky top-0 w-full z-50 bg-primary-900/75 backdrop-blur-md shadow-md py-4 transition-all duration-500"
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
                <span className="text-2xl font-serif italic text-white">{logoSettings.text}</span>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {menuItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-white ${isScrolled ? 'text-primary-100' : 'text-primary-200/80'
                  }`}
              >
                {item.title}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 text-white border border-white/20 rounded-full hover:bg-white/10 transition-all focus:outline-none"
                >
                  <User size={20} />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                     <div className="p-6 bg-slate-50 border-b border-slate-100 text-center">
                        <div className="w-16 h-16 mx-auto bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mb-3">
                           <User size={32} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-base">{profile?.full_name || 'Sin nombre'}</h4>
                        <p className="text-xs text-slate-500 font-medium break-all">{user.email}</p>
                        <p className="text-xs text-primary-600 font-black mt-1">{profile?.phone || 'Sin teléfono'}</p>
                     </div>
                     <div className="p-2">
                        <button 
                          onClick={() => { setIsProfileOpen(false); navigate('/admin'); }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-700 rounded-xl transition-all"
                        >
                          Ir a mi Panel
                        </button>
                        <button 
                          onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-between"
                        >
                          <span>Cerrar sesión</span>
                          <LogOut size={16} />
                        </button>
                     </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="p-2 text-white border border-white/20 rounded-full hover:bg-white/10 transition-all"
              >
                <User size={20} />
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white border border-white/20 rounded-full hover:bg-white/10 transition-all"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-primary-900">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-primary-900/95 backdrop-blur-xl border-b border-white/10 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col p-8 space-y-6">
              {menuItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="text-lg font-serif italic text-white hover:text-primary-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
};

export default Navbar;
