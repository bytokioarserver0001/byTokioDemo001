import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Shield, Save } from 'lucide-react';

const UserEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    role: user?.role || 'cliente'
  });

  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        role: user.role || 'cliente'
      });
    }
  }, [user]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary-900 p-8 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-serif">Ficha de Cliente</h3>
                <p className="text-primary-200 text-sm opacity-80">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-300" size={18} />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-medium"
                  placeholder="Sin nombre"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Teléfono de Contacto</label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-300" size={18} />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-medium"
                  placeholder="Ingresar teléfono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nivel de Acceso (Rol)</label>
              <div className="relative">
                <Shield className="absolute left-4 top-4 text-slate-300" size={18} />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-medium appearance-none"
                >
                  <option value="cliente">Cliente (Nivel 1)</option>
                  <option value="usuario">Usuario (Nivel 2)</option>
                  <option value="admin">Administrador (Nivel 3)</option>
                  <option value="superadmin">Superadmin (Máximo)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 pt-0 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all font-serif"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(user.id, formData)}
              className="flex-[2] bg-primary-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-primary-900/10 font-serif"
            >
              <Save size={18} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserEditModal;
