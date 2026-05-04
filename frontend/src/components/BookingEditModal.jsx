import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BookingEditModal = ({ isOpen, onClose, onSave, booking, users }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    booking_date: '',
    booking_time: '',
    status: 'confirmed',
    customer_name: '',
    customer_phone: '',
    customer_email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        user_id: booking.user_id || '',
        booking_date: booking.booking_date || '',
        booking_time: booking.booking_time || '',
        status: booking.status || 'confirmed',
        customer_name: booking.profiles?.full_name || '',
        customer_phone: booking.profiles?.phone || '',
        customer_email: booking.profiles?.email || ''
      });
    } else {
      setFormData({
        user_id: '',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '09:00',
        status: 'confirmed',
        customer_name: '',
        customer_phone: '',
        customer_email: ''
      });
    }
  }, [booking, isOpen]);

  if (!isOpen) return null;

  const handleUserChange = (userId) => {
    const selected = users.find(u => u.id === userId);
    setFormData({
      ...formData,
      user_id: userId,
      customer_name: selected?.full_name || '',
      customer_phone: selected?.phone || '',
      customer_email: selected?.email || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If we have data for the profile, update it too
      if (formData.user_id) {
        await supabase.from('profiles').update({
          full_name: formData.customer_name,
          phone: formData.customer_phone,
          email: formData.customer_email
        }).eq('id', formData.user_id);
      }
      
      const { customer_name, customer_phone, customer_email, ...bookingData } = formData;
      await onSave(booking?.id, bookingData);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-serif text-slate-900">{booking ? 'Editar Turno' : 'Nuevo Turno'}</h2>
            <p className="text-sm text-slate-500">Gestioná los detalles y datos del cliente.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors font-bold text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* Fila Cliente Selección */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              <User size={12} className="mr-2" /> Vincular a Usuario Registrado
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={formData.user_id}
              onChange={(e) => handleUserChange(e.target.value)}
            >
              <option value="">Seleccionar un usuario...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email} {u.phone ? `(${u.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Datos del Cliente Editables */}
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Cliente</label>
                <input type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm" placeholder="Anastasio" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</label>
                  <input type="text" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" placeholder="54911..." />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                  <input type="email" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm" placeholder="japo@mail.com" />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Calendar size={12} className="mr-2" /> Fecha</label>
              <input type="date" required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm" value={formData.booking_date} onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Clock size={12} className="mr-2" /> Hora</label>
              <input type="text" required placeholder="09:00" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" value={formData.booking_time} onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
            <div className="flex space-x-3">
              {[
                { id: 'confirmed', label: 'Confirmado', color: 'bg-green-50 text-green-600' },
                { id: 'pending', label: 'Pendiente', color: 'bg-amber-50 text-amber-600' }
              ].map(status => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: status.id })}
                  className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all border ${
                    formData.status === status.id ? `${status.color} border-current shadow-sm` : 'bg-slate-50 text-slate-300 border-transparent hover:bg-slate-100'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 pb-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'GUARDANDO...' : booking ? 'Guardar Cambios' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingEditModal;
