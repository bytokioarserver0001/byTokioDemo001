import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginModal = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await register(email, password);
        alert('Revisa tu email para confirmar el registro.');
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8 pt-12">
            <h2 className="text-3xl font-serif text-primary-950 mb-2">
              {isRegister ? 'Crear una cuenta' : 'Bienvenido de nuevo'}
            </h2>
            <p className="text-gray-500 mb-8 font-light">
              {isRegister 
                ? 'Únete a nuestra comunidad de bienestar.' 
                : 'Ingresa para gestionar tus turnos y experiencias.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-xs px-2">{error}</p>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-medium shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-50">
              <p className="text-gray-500 text-sm">
                {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  className="ml-2 text-primary-600 font-semibold hover:underline"
                >
                  {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
