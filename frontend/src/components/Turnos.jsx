import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, Check, Lock, UserCheck, Trash2, Calendar, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Turnos = () => {
  const { user, profile, openLoginModal } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  const N8N_RESERVA_URL = 'https://n8n.serverbytokio.duckdns.org/webhook-test/reserva-bytokio';
  const N8N_CANCELAR_URL = 'https://n8n.serverbytokio.duckdns.org/webhook-test/cancelar-reserva';
  
  const [sectionData, setSectionData] = useState({
    title: 'Encuentra tu momento',
    subtitle: 'Consulta nuestra disponibilidad en tiempo real y reserva tu espacio de paz.',
    is_visible: true
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.

  // Generar semana dinámica con offset
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
  const weekDates = getWeekDates(weekOffset);
  const timeSlots = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'];

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

      // Fetch availability including status to show pending vs confirmed
      const { data: allBookings, error: slotError } = await supabase
        .from('bookings')
        .select('booking_date, booking_time, status');
      
      if (slotError) {
        console.error('Error fetching slots:', slotError.message);
      }

      // Normalize time format: "09:00:00" -> "09:00"
      const normalized = (allBookings || []).map(s => ({
        ...s,
        booking_time: s.booking_time ? s.booking_time.substring(0, 5) : s.booking_time
      }));
      console.log('Occupied slots fetched:', normalized.length, normalized);
      setOccupiedSlots(normalized);

      if (user) {
        let query = supabase
          .from('bookings')
          .select('*, profiles(full_name, phone, email)');
        
        if (!isAdmin) {
          query = query.eq('user_id', user.id);
        }
        
        const { data: bookings, error } = await query.order('booking_date', { ascending: true });
        if (!error) setMyBookings(bookings || []);
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
      // 1. Double check availability right before inserting
      const { data: isBusy } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', selectedDate)
        .eq('booking_time', selectedSlot)
        .maybeSingle();

      if (isBusy) {
        throw new Error('Lo sentimos, este turno se acaba de ocupar. Por favor selecciona otro.');
      }

      // 2. Proceed with booking if free
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

      const payload = {
        booking_id: dbData.id,
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || 'Cliente',
          phone: profile?.phone || ''
        },
        booking: {
          date: selectedDate,
          time: selectedSlot,
          timestamp: new Date().toISOString()
        }
      };

      await fetch(N8N_RESERVA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setBookingSuccess(true);
      fetchData();
      setTimeout(() => { setShowConfirm(false); setBookingSuccess(false); }, 3000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('¿Quieres cancelar este turno?')) return;
    try {
      await supabase.from('bookings').delete().eq('id', bookingId);
      await fetch(N8N_CANCELAR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
      });
      fetchData();
    } catch (err) { alert(err.message); }
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

        {user && myBookings.length > 0 && (
          <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBookings.map((b) => (
              <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {b.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 flex items-center"><Calendar size={16} className="mr-2 text-slate-400" /> {b.booking_date}</div>
                  <div className="text-sm font-medium text-slate-500 flex items-center"><Clock size={16} className="mr-2 text-slate-400" /> {b.booking_time} hs</div>
                  {isAdmin && <div className="text-[10px] text-slate-400 mt-2">{b.profiles?.full_name}</div>}
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <button onClick={() => handleCancelBooking(b.id)} className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors">
                    Cancelar Turno
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden p-8">
          {/* Week Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 font-bold text-xs transition-all"
            >
              <ChevronLeft size={16} /> <span>Semana anterior</span>
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {weekDates[0]?.date} — {weekDates[5]?.date}
            </span>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 font-bold text-xs transition-all"
            >
              <span>Semana siguiente</span> <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {weekDates.map(({ label, date, dayNum }) => (
              <div key={date} className="space-y-4">
                <div className="text-center py-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                  <div className="text-xs text-slate-500 font-bold">{dayNum}</div>
                </div>
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const isOccupied = occupiedSlots.some(s => s.booking_date === date && s.booking_time === time);
                    const occupiedSlot = occupiedSlots.find(s => s.booking_date === date && s.booking_time === time);
                    const isPending = occupiedSlot?.status === 'pending';
                    
                    return (
                      <button
                        key={time}
                        disabled={isOccupied}
                        onClick={() => handleSlotClick(label, time, date)}
                        className={`w-full py-3 rounded-xl border transition-all text-xs font-bold ${
                          isOccupied 
                            ? isPending 
                              ? 'bg-amber-50 border-amber-100 text-amber-400 cursor-not-allowed'
                              : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'border-slate-50 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 text-slate-500'
                        }`}
                      >
                        {isOccupied ? (isPending ? 'Pendiente' : 'Ocupado') : time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[2rem] p-10 text-center">
              {bookingSuccess ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"><Check size={32} /></div>
                  <h3 className="text-xl font-serif">¡Reservado!</h3>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-serif mb-6">Confirmar Turno</h3>
                  <p className="text-slate-500 mb-8">{selectedDate} a las {selectedSlot}</p>
                  <div className="space-y-3">
                    <button onClick={confirmBooking} disabled={bookingLoading} className="w-full py-4 bg-primary-900 text-white rounded-2xl font-bold">
                      {bookingLoading ? 'Reservando...' : 'Confirmar'}
                    </button>
                    <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-slate-400 font-bold">Volver</button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Turnos;
