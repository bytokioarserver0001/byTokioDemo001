import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronRight, ChevronLeft, Check, Lock, UserCheck, Trash2, Phone, Mail, X, AlertOctagon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Turnos = () => {
  const { user, profile, openLoginModal } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  const N8N_RESERVA_URL = 'https://n8n.serverbytokio.duckdns.org/webhook/reserva-bytokio';
  const N8N_CANCELAR_URL = 'https://n8n.serverbytokio.duckdns.org/webhook/cancelar-reserva';
  
  const [sectionData, setSectionData] = useState({
    title: 'Encuentra tu momento',
    subtitle: 'Consulta nuestra disponibilidad en tiempo real y reserva tu espacio de paz.',
    is_visible: true
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); 

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${day}/${month}/${year}`;
  };

  const timeSlots = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'];

  const getWeekDates = (offset = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (offset * 7));
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return labels.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return { label, date: `${yyyy}-${mm}-${dd}`, dayNum: dd };
    });
  };

  const fetchData = async () => {
    try {
      const { data: section } = await supabase
        .from('site_settings')
        .select('content')
        .eq('section', 'turnos_section')
        .single();

      if (section?.content) {
        setSectionData({
          title: section.content.title || 'Encuentra tu momento',
          subtitle: section.content.subtitle || 'Consulta nuestra disponibilidad en tiempo real y reserva tu espacio de paz.',
          is_visible: section.content.is_visible !== undefined ? section.content.is_visible : true
        });
      }

      const { data: allBookings, error: slotError } = await supabase
        .from('bookings')
        .select('booking_date, booking_time, status');
      
      if (!slotError) {
        const normalized = (allBookings || []).map(s => ({
          ...s,
          booking_time: (s.booking_time || '').substring(0, 5)
        }));
        setOccupiedSlots(normalized);
      }

      if (user) {
        const selectStr = isAdmin ? '*, profiles(full_name, phone, email)' : '*';
        let query = supabase.from('bookings').select(selectStr);
        if (!isAdmin) query = query.eq('user_id', user.id);
        const { data: bookings, error } = await query.order('booking_date', { ascending: true });
        
        if (!error) {
          const normalizedB = (bookings || []).map(b => ({
            ...b,
            booking_time: (b.booking_time || '').substring(0, 5)
          }));
          setMyBookings(normalizedB);
        }
      } else {
        setMyBookings([]);
      }
    } catch (error) {
      console.error('Error fetching Turnos data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, isAdmin]);

  const handleSlotClick = (day, slot, realDate) => {
    if (!user) {
      openLoginModal();
      return;
    }
    setSelectedDate(realDate);
    setSelectedSlot(slot);
    setShowConfirm(true);
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    try {
      const { data: isBusy } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', selectedDate)
        .eq('booking_time', selectedSlot)
        .maybeSingle();

      if (isBusy) throw new Error('Lo sentimos, este turno se acaba de ocupar.');

      const { data: dbData, error: dbError } = await supabase
        .from('bookings')
        .insert([{
          user_id: user.id,
          booking_date: selectedDate,
          booking_time: selectedSlot,
          status: 'pending'
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // ADJUST FOR n8n/GOOGLE CALENDAR TIMEZONE SHIFT (+1H) BY SUBTRACTING 1H
      const [h, m] = dbData.booking_time.split(':').map(Number);
      const adjustedHourStart = String(h - 1).padStart(2, '0');
      const adjustedHourEnd = String(h).padStart(2, '0'); 
      const minuteStr = String(m).padStart(2, '0');

      const calendar_start = `${dbData.booking_date} ${adjustedHourStart}:${minuteStr}:00`;
      const calendar_end = `${dbData.booking_date} ${adjustedHourEnd}:${minuteStr}:00`;

      const n8nPayload = {
        user: {
          full_name: profile?.full_name || 'Cliente',
          phone: profile?.phone || ''
        },
        booking: {
          calendar_start,
          calendar_end,
          time: dbData.booking_time.substring(0,5)
        }
      };

      fetch(N8N_RESERVA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload)
      }).catch(e => console.error('n8n error:', e));

      setBookingSuccess(true);
      fetchData();
      setTimeout(() => { setShowConfirm(false); setBookingSuccess(false); }, 3000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const initiateCancellation = (booking) => {
    if (!isAdmin) {
      try {
        const [year, month, day] = booking.booking_date.split('-').map(Number);
        const [hour, minute] = booking.booking_time.split(':').map(Number);
        const bookingDate = new Date(year, month - 1, day, hour, minute);
        if ((bookingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60) < 48) {
          alert('Los turnos solo pueden cancelarse con al menos 48 horas de anticipación.');
          return;
        }
      } catch (e) { console.error(e); }
    }
    setBookingToDelete(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToDelete) return;
    setBookingLoading(true);
    try {
      // PREPARE TIME WITH OFFSET COMPENSATION (-1H) FOR CANCELLATION TOO
      const [h, m] = bookingToDelete.booking_time.split(':').map(Number);
      const adjustedHour = String(h - 1).padStart(2, '0');
      const minStr = String(m).padStart(2, '0');
      const adjustedTimeForN8N = `${adjustedHour}:${minStr}`;

      try {
        await fetch(N8N_CANCELAR_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            booking_id: bookingToDelete.id,
            booking_date: bookingToDelete.booking_date,
            booking_time: adjustedTimeForN8N, // SEND ADJUSTED TIME TO MATCH GOOGLE CALENDAR
            user_id: bookingToDelete.user_id,
            status: 'cancelled',
            real_time: bookingToDelete.booking_time
          })
        });
      } catch (n8nErr) { console.error('n8n error:', n8nErr); }

      const { error } = await supabase.from('bookings').delete().eq('id', bookingToDelete.id);
      if (error) throw error;
      
      await fetchData();
      setShowCancelModal(false);
      setBookingToDelete(null);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && !myBookings.length && !occupiedSlots.length) return null;
  if (sectionData.is_visible === false && !isAdmin) return null;

  return (
    <section id="turnos" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-slate-900 mb-4">{sectionData.title}</h2>
          <p className="text-slate-500 max-w-xl mx-auto">{sectionData.subtitle}</p>
        </div>
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden p-8 mb-16">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setWeekOffset(w => w - 1)} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 font-bold text-xs"><ChevronLeft size={16} /></button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDate(getWeekDates(weekOffset)[0].date)} — {formatDate(getWeekDates(weekOffset)[5].date)}</span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 font-bold text-xs"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {getWeekDates(weekOffset).map(({ label, date, dayNum }) => (
              <div key={date} className="space-y-4 text-center">
                <div className="py-2 bg-slate-50 rounded-xl"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span><div className="text-xs text-slate-500 font-bold">{dayNum}</div></div>
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const occupiedSlot = occupiedSlots.find(s => s.booking_date === date && (s.booking_time || '').substring(0, 5) === time);
                    const isOccupied = !!occupiedSlot;
                    return <button key={time} disabled={isOccupied} onClick={() => handleSlotClick(label, time, date)} className={`w-full py-3 rounded-xl border transition-all text-xs font-bold ${isOccupied ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-50 hover:border-primary-200 text-slate-500'}`}>{isOccupied ? 'Ocupado' : time}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {user && myBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myBookings.map((b) => (
              <div key={b.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col space-y-6">
                <div className="flex justify-between items-center"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{b.status}</span></div>
                <div className="space-y-3">
                  <div className="flex items-center text-slate-800 font-bold text-lg"><Calendar size={20} className="mr-4 text-slate-400" />{formatDate(b.booking_date)}</div>
                  <div className="flex items-center text-slate-500 font-medium"><Clock size={20} className="mr-4 text-slate-400" />{b.booking_time} hs</div>
                </div>
                <button onClick={() => initiateCancellation(b)} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"><Trash2 size={16} className="mr-2" /> Cancelar</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 text-center shadow-2xl">
              {bookingSuccess ? (
                <div className="space-y-6"><div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"><Check size={40} /></div><h3 className="text-3xl font-serif">¡Reservado!</h3></div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar size={32} /></div>
                  <h3 className="text-2xl font-serif mb-2">Confirmar</h3>
                  <p className="text-slate-500 mb-8 font-medium">{formatDate(selectedDate)} — {selectedSlot} hs</p>
                  <button onClick={confirmBooking} disabled={bookingLoading} className="w-full py-5 bg-primary-900 text-white rounded-[1.5rem] font-bold shadow-xl active:scale-95 transition-all mb-4">{bookingLoading ? 'Reservando...' : 'Confirmar Reserva'}</button>
                  <button onClick={() => setShowConfirm(false)} className="text-slate-400 font-bold">Volver</button>
                </>
              )}
            </motion.div>
          </div>
        )}
        {showCancelModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[3.5rem] p-12 text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8"><Trash2 size={40} /></div>
              <h3 className="text-3xl font-serif mb-4">¿Cancelar?</h3>
              <p className="text-slate-700 font-bold mb-10">{bookingToDelete && formatDate(bookingToDelete.booking_date)} a las {bookingToDelete?.booking_time} hs</p>
              <button onClick={handleConfirmCancel} disabled={bookingLoading} className="w-full py-5 bg-red-600 text-white rounded-[2.5rem] font-black text-sm uppercase shadow-xl hover:bg-red-700 active:scale-95 transition-all mb-4">{bookingLoading ? 'Borrando...' : 'Sí, Cancelar'}</button>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 font-bold">No, mantener</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Turnos;
