import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { login, register, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (mode === 'register') {
        if (!fullName) throw new Error('El nombre completo es obligatorio.');
        await register(email, password, { full_name: fullName, phone });
        setSuccess('Revisa tu email para confirmar el registro.');
      } else if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccess('Se ha enviado un enlace de recuperación a tu email.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border border-white/20"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8 pt-12">
            <h2 className="text-3xl font-serif text-slate-900 mb-2">
              {mode === 'register' && 'Crear una cuenta'}
              {mode === 'login' && 'Bienvenido de nuevo'}
              {mode === 'forgot' && 'Recuperar contraseña'}
            </h2>
            <p className="text-gray-500 mb-8 font-light">
              {mode === 'register' && 'Únete a nuestra comunidad de bienestar.'}
              {mode === 'login' && 'Ingresa para gestionar tus turnos y experiencias.'}
              {mode === 'forgot' && 'Te enviaremos un enlace para restablecer tu acceso.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900"
                    placeholder="+54 9..."
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {mode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    className="w-full pl-12 pr-12 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
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
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-primary-600 font-medium hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-xs px-2">{error}</p>
              )}
              {success && (
                <p className="text-green-600 text-xs px-2 bg-green-50 py-2 rounded-lg">{success}</p>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-primary-500 text-white rounded-2xl font-medium shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all flex items-center justify-center space-x-2"
              >
                <span>
                  {mode === 'register' && 'Registrarse'}
                  {mode === 'login' && 'Iniciar Sesión'}
                  {mode === 'forgot' && 'Enviar Enlace'}
                </span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-200">
              <p className="text-gray-500 text-sm">
                {mode === 'register' && (
                  <>
                    ¿Ya tienes una cuenta?
                    <button onClick={() => setMode('login')} className="ml-2 text-primary-600 font-semibold hover:underline">
                      Inicia Sesión
                    </button>
                  </>
                )}
                {mode === 'login' && (
                  <>
                    ¿Aún no tienes cuenta?
                    <button onClick={() => setMode('register')} className="ml-2 text-primary-600 font-semibold hover:underline">
                      Regístrate aquí
                    </button>
                  </>
                )}
                {mode === 'forgot' && (
                  <button onClick={() => setMode('login')} className="text-primary-600 font-semibold hover:underline">
                    Volver al inicio de sesión
                  </button>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
