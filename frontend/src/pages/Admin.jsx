import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Users, Star, Trash2, Pencil, Plus, Package, LayoutDashboard, Calendar, Clock, CheckCircle, Ban, Search } from 'lucide-react';
import UserEditModal from '../components/UserEditModal';
import ProductEditModal from '../components/ProductEditModal';
import BookingEditModal from '../components/BookingEditModal';
import HeroEditor from '../components/HeroEditor';
import SectionEditor from '../components/SectionEditor';

const N8N_RESERVA_URL = 'https://n8n.serverbytokio.duckdns.org/webhook/reserva-bytokio';
const N8N_CANCELAR_URL = 'https://n8n.serverbytokio.duckdns.org/webhook/cancelar-reserva';

const Admin = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('turnos');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const { data: u } = await supabase.from('profiles').select('*').order('role', { ascending: false });
      const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      let { data: b, error: bErr } = await supabase.from('bookings').select('*, profiles(full_name, phone, email)').order('booking_date', { ascending: false });
      if (bErr || !b) {
        const { data: bFallback } = await supabase.from('bookings').select('*').order('booking_date', { ascending: false });
        b = bFallback || [];
      }
      setUsers(u || []);
      setProducts(p || []);
      setBookings(b || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatDate = (d) => {
    if (!d) return '---';
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const saveProduct = async (id, data) => {
    try {
      if (id) await supabase.from('products').update(data).eq('id', id);
      else await supabase.from('products').insert([data]);
      setIsProductModalOpen(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const saveBooking = async (id, data) => {
    try {
      let res;
      if (id) res = await supabase.from('bookings').update(data).eq('id', id).select().single();
      else res = await supabase.from('bookings').insert([data]).select().single();
      
      if (res.data && (!id || data.status === 'confirmed')) {
        const u = users.find(x => x.id === (data.user_id || res.data.user_id));
        const [h, m] = (res.data.booking_time || '00:00').split(':').map(Number);
        fetch(N8N_RESERVA_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: { full_name: u?.full_name || 'Cliente', phone: u?.phone || '' },
            booking: { calendar_start: `${res.data.booking_date} ${String(h-1).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`, calendar_end: `${res.data.booking_date} ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`, time: res.data.booking_time?.substring(0,5) }
          })
        }).catch(e => console.error(e));
      }
      setIsBookingModalOpen(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    const [h, m] = (bookingToDelete.booking_time || '00:00').split(':').map(Number);
    const adjustedTime = `${String(h - 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    fetch(N8N_CANCELAR_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ booking_id: bookingToDelete.id, booking_date: bookingToDelete.booking_date, booking_time: adjustedTime, status: 'cancelled' }) }).catch(e => console.error(e));
    await supabase.from('bookings').delete().eq('id', bookingToDelete.id);
    setIsDeleteModalOpen(false);
    fetchData();
  };

  if (loading) return <div className="p-20 text-center font-serif italic text-slate-400">Cargando Management...</div>;

  const clientCount = users.filter(u => u.role === 'cliente').length;

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
        <div><h1 className="text-5xl font-serif text-slate-900 tracking-tight mb-2">Management</h1><p className="text-slate-400 italic font-light">Administración centralizada de tu negocio.</p></div>
        <div className="flex flex-col gap-2">
           <div className="flex bg-slate-100/70 p-1.5 rounded-full shadow-inner">{[{id:'usuarios', label:'Admins', icon:Shield}, {id:'clientes', label:'Clientes', icon:Users}, {id:'portada', label:'Portada', icon:LayoutDashboard}].map(t => (<button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${activeTab===t.id? 'bg-white shadow-xl text-black':'text-slate-400 hover:text-slate-600'}`}><t.icon size={14}/><span>{t.label}</span></button>))}</div>
           <div className="flex bg-slate-100/70 p-1.5 rounded-full shadow-inner">{[{id:'servicios', label:'Servicios', icon:Star}, {id:'productos', label:'Productos', icon:Package}, {id:'turnos', label:'Turnos', icon:Calendar}].map(t => (<button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${activeTab===t.id? 'bg-white shadow-xl text-black':'text-slate-400 hover:text-slate-600'}`}><t.icon size={14}/><span>{t.label}</span></button>))}</div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-2">
        {activeTab === 'turnos' && (
           <div className="space-y-8">
              <SectionEditor sectionName="turnos_section" />
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                 <div className="p-8 border-b flex justify-between items-center bg-slate-50/20">
                    <h2 className="text-3xl font-serif text-slate-900">Reservas</h2>
                    <button onClick={()=>{setSelectedBooking(null); setIsBookingModalOpen(true)}} className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 text-sm shadow-xl hover:shadow-black/20"><Plus size={16}/><span>Nuevo Turno</span></button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead><tr className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest"><th className="px-10 py-6">Fecha y Hora</th><th className="px-10 py-6">Cliente</th><th className="px-10 py-6 text-center">Estado</th><th className="px-10 py-6 text-right">Acción</th></tr></thead>
                       <tbody className="divide-y divide-slate-50">
                          {bookings.map(b => {
                             const customer = b.profiles || users.find(u => u.id === b.user_id);
                             return (
                             <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-8 font-bold text-slate-900 text-sm whitespace-nowrap">{formatDate(b.booking_date)} {b.booking_time?.substring(0,5)}hs</td>
                                <td className="px-10 py-8"><div className="font-bold text-sm text-slate-800">{customer?.full_name || 'Sin nombre'}</div><div className="text-[10px] text-slate-400 font-mono italic">ID: {b.user_id?.substring(0,8)}...</div></td>
                                <td className="px-10 py-8 text-center text-xs">{b.status==='pending'?<span className="inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-100 min-w-[110px] justify-center tracking-widest"><Clock size={12} className="mr-2" /> PENDIENTE</span>:<span className="inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 min-w-[110px] justify-center tracking-widest"><CheckCircle size={12} className="mr-2" /> CONFIRMADO</span>}</td>
                                <td className="px-10 py-8 text-right space-x-2"><div className="flex justify-end items-center space-x-2">{b.status==='pending' && <button onClick={()=>saveBooking(b.id, { status:'confirmed' })} className="p-3 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle size={18}/></button>}<button onClick={()=>{setSelectedBooking(b); setIsBookingModalOpen(true)}} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 transition-all"><Pencil size={18}/></button><button onClick={()=>{setBookingToDelete(b); setIsDeleteModalOpen(true)}} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button></div></td>
                             </tr>
                          )})}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}
        
        {activeTab === 'clientes' && (
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-10 overflow-hidden">
             <div className="flex justify-between items-center mb-12 px-2">
                <h2 className="text-3xl font-serif text-slate-900">Gestión de Clientes & Usuarios</h2>
                <div className="flex items-center space-x-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                   <div className="flex items-center space-x-2"><Search size={16} /> <span className="text-[10px]">{clientCount} Registrados</span></div>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-widest border-b border-slate-50 pb-8">
                        <th className="pb-8 px-4">Identidad</th>
                        <th className="pb-8 px-4">Nivel de Acceso</th>
                        <th className="pb-8 px-4">Contacto</th>
                        <th className="pb-8 px-4 text-right">Gestión</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {users.filter(u => u.role === 'cliente').map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                           <td className="py-8 px-4 flex items-center space-x-5">
                              <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-black text-xl shadow-inner uppercase">{(u.full_name || u.email || 'U')[0]}</div>
                              <div>
                                 <div className="font-black text-slate-900 text-lg tracking-tight mb-0.5">{u.full_name || 'Sin Nombre'}</div>
                                 <div className="text-[10px] text-slate-400 font-mono">{u.id.substring(0,8)}...</div>
                              </div>
                           </td>
                           <td className="py-8 px-4">
                              <span className="inline-flex px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100/50 rounded-full">Cliente</span>
                           </td>
                           <td className="py-8 px-4">
                              <div className="text-xs text-slate-400 font-medium mb-1">{u.email || '---'}</div>
                              <div className="text-slate-800 font-black text-sm tracking-tighter">{u.phone || '---'}</div>
                           </td>
                           <td className="py-8 px-4 text-right space-x-3">
                              <div className="flex justify-end items-center space-x-3">
                                 <button onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }} className="p-3.5 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Pencil size={18}/></button>
                                 <button className="p-3.5 bg-white border border-slate-100 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Ban size={18}/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {users.filter(u=>u.role!=='cliente').map(u=>(<div key={u.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all">
                 <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center font-black text-xl uppercase">{(u.full_name || 'A')[0]}</div>
                    <div>
                       <div className="font-black text-xl text-slate-900 tracking-tight">{u.full_name}</div>
                       <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{u.role}</div>
                    </div>
                 </div>
                 <div className="space-y-2 text-xs text-slate-500 mb-8 border-t border-slate-50 pt-6"><div>{u.email}</div><div>{u.phone || 'Sin teléfono'}</div></div>
                 <button onClick={()=>{setSelectedUser(u);setIsUserModalOpen(true)}} className="w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Configurar Administrador</button>
              </div>))}
           </div>
        )}

        {(activeTab === 'servicios' || activeTab === 'productos') && (
           <div className="space-y-10">
              <SectionEditor sectionName={activeTab==='servicios'?'services_section':'productos_section'} />
              <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100">
                 <div className="flex justify-between items-center mb-10 px-4"><h2 className="text-3xl font-serif">Catálogo</h2><button onClick={()=>{setSelectedProduct({category:activeTab==='servicios'?'servicio':'producto'}); setIsProductModalOpen(true)}} className="p-4 bg-slate-50 rounded-2xl transition-transform active:scale-95"><Plus size={24}/></button></div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {products.filter(p=>activeTab==='servicios'?p.category==='servicio':p.category!=='servicio').map(p=>(
                       <div key={p.id} className="relative aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden group shadow-inner">
                          {(p.images && p.images[0]) && <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>}
                          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl tracking-tighter">${p.price}</div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-3"><button onClick={()=>{setSelectedProduct(p); setIsProductModalOpen(true)}} className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-all"><Pencil size={18}/></button></div>
                          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-3.5 rounded-3xl text-[10px] font-black truncate text-center shadow-lg tracking-tight uppercase">{p.name}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
        {activeTab === 'portada' && <HeroEditor />}
      </div>

      <UserEditModal isOpen={isUserModalOpen} onClose={()=>setIsUserModalOpen(false)} user={selectedUser} onSave={fetchData} />
      <ProductEditModal isOpen={isProductModalOpen} onClose={()=>setIsProductModalOpen(false)} product={selectedProduct} onSave={saveProduct} />
      <BookingEditModal isOpen={isBookingModalOpen} onClose={()=>setIsBookingModalOpen(false)} booking={selectedBooking} onSave={saveBooking} users={users} />
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"><div className="bg-white p-12 rounded-[4rem] text-center shadow-2xl max-w-sm w-full"><div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8"><Trash2 size={40}/></div><h2 className="text-3xl font-serif mb-4">¿Borrar?</h2><p className="text-slate-400 mb-10 text-sm leading-relaxed">¿Seguro que querés eliminarlo? Esta acción no se puede deshacer.</p><button onClick={confirmDeleteBooking} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-xl active:scale-95 mb-4">Confirmar</button><button onClick={()=>setIsDeleteModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600 transition-colors">Volver</button></div></div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
