import React, { useState } from 'react';
import { ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-slate-100/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-serif italic text-primary-900">byTokio</span>
            </div>
            
            <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
              <a href="#experiencias" className="hover:text-primary-600 transition-colors">Experiencias</a>
              <a href="#tesoros" className="hover:text-primary-600 transition-colors">Tesoros</a>
              <a href="#reserva" className="hover:text-primary-600 transition-colors">Reservar Turno</a>
              {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                <a href="/admin" className="text-primary-600 font-bold hover:text-primary-800 transition-colors">Admin</a>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-400 hover:text-primary-600 transition-colors relative"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-900 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-slate-100 animate-in zoom-in duration-300">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-gray-400">Bienvenido</span>
                    <span className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                      {user.email.split('@')[0]}
                    </span>
                    {profile?.role && profile.role !== 'cliente' && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                        {profile.role}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    title="Cerrar Sesión"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors text-sm font-medium"
                >
                  <User size={18} />
                  <span>Login</span>
                </button>
              )}

              <div className="md:hidden">
                <Menu size={24} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Navbar;
