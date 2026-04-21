import React, { useState } from 'react';
import { ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import LoginModal from './LoginModal';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-serif italic text-primary-900">byTokio</span>
            </div>
            
            <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
              <a href="#experiencias" className="hover:text-primary-600 transition-colors">Experiencias</a>
              <a href="#tesoros" className="hover:text-primary-600 transition-colors">Tesoros</a>
              <a href="#reserva" className="hover:text-primary-600 transition-colors">Reservar Turno</a>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors relative">
                <ShoppingCart size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full" />
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-gray-400">Bienvenido</span>
                    <span className="text-sm font-medium text-primary-900 truncate max-w-[120px]">
                      {user.email.split('@')[0]}
                    </span>
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
