import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

const BookingEditModal = ({ isOpen, onClose, onSave, booking, users }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    booking_date: '',
    booking_time: '',
    status: 'confirmed'
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        user_id: booking.user_id || '',
        booking_date: booking.booking_date || '',
        booking_time: booking.booking_time || '',
        status: booking.status || 'confirmed'
      });
    } else {
      setFormData({
        user_id: '',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '09:00',
        status: 'confirmed'
      });
    }
  }, [booking, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(booking?.id, formData);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-serif text-slate-900">{booking ? 'Editar Turno' : 'Nuevo Turno Manual'}</h2>
            <p className="text-sm text-slate-500">Gestioná los detalles de la reserva.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Cliente Select */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center">
              <User size={14} className="mr-2" /> Cliente
            </label>
            <select
              required
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            >
              <option value="">Seleccionar un cliente...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email} {u.phone ? `(${u.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center">
                <Calendar size={14} className="mr-2" /> Fecha
              </label>
              <input
                type="date"
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none"
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
              />
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center">
                <Clock size={14} className="mr-2" /> Hora (HH:MM)
              </label>
              <input
                type="text"
                required
                placeholder="09:00"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none"
                value={formData.booking_time}
                onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center">
               Estado de la Reserva
            </label>
            <div className="flex space-x-3">
              {[
                { id: 'confirmed', label: 'Confirmado', icon: <CheckCircle size={16} />, color: 'bg-green-50 text-green-600' },
                { id: 'pending', label: 'Pendiente', icon: <AlertCircle size={16} />, color: 'bg-amber-50 text-amber-600' }
              ].map(status => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: status.id })}
                  className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-2xl text-xs font-bold transition-all border ${
                    formData.status === status.id 
                      ? `${status.color} border-current` 
                      : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                  }`}
                >
                  {status.icon}
                  <span>{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-5 bg-primary-900 text-white rounded-[1.5rem] font-bold shadow-xl shadow-primary-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {booking ? 'Guardar Cambios' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingEditModal;
