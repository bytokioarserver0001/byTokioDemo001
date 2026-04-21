import React from 'react';
import { ShoppingCart, User, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-serif italic text-indigo-900">byTokio</span>
          </div>
          
          <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
            <a href="#experiencias" className="hover:text-indigo-600 transition-colors">Experiencias</a>
            <a href="#tesoros" className="hover:text-indigo-600 transition-colors">Tesoros</a>
            <a href="#reserva" className="hover:text-indigo-600 transition-colors">Reservar Turno</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <ShoppingCart size={20} />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium">
              <User size={18} />
              <span>Login</span>
            </button>
            <div className="md:hidden">
              <Menu size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
