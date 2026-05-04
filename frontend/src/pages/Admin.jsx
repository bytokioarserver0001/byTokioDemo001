import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Users, Star, Trash2, Pencil, Plus, Package, LayoutDashboard, Calendar, Clock, CheckCircle } from 'lucide-react';
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
      const { data: b } = await supabase.from('bookings').select('*, profiles(full_name, phone, email)').order('booking_date', { ascending: false });
      
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

  const saveBooking = async (id, data) => {
    try {
      if (id) await supabase.from('bookings').update(data).eq('id', id);
      else await supabase.from('bookings').insert([data]);
      setIsBookingModalOpen(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    await supabase.from('bookings').delete().eq('id', bookingToDelete.id);
    setIsDeleteModalOpen(false);
    fetchData();
  };

  if (loading) return <div className="p-20 text-center font-serif italic text-slate-400">Cargando...</div>;

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div><h1 className="text-5xl font-serif text-slate-900">Management</h1><p className="text-slate-400 italic">Control total de tu sitio wellness.</p></div>
        <div className="flex flex-col gap-2">
           <div className="flex bg-slate-100 p-1 rounded-full">{[{id:'usuarios', label:'Admins', icon:Shield}, {id:'clientes', label:'Clientes', icon:Users}, {id:'portada', label:'Portada', icon:LayoutDashboard}].map(t => (<button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-6 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${activeTab===t.id? 'bg-white shadow-md text-black':'text-slate-400'}`}><t.icon size={14}/><span>{t.label}</span></button>))}</div>
           <div className="flex bg-slate-100 p-1 rounded-full">{[{id:'servicios', label:'Servicios', icon:Star}, {id:'productos', label:'Productos', icon:Package}, {id:'turnos', label:'Turnos', icon:Calendar}].map(t => (<button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-6 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${activeTab===t.id? 'bg-white shadow-md text-black':'text-slate-400'}`}><t.icon size={14}/><span>{t.label}</span></button>))}</div>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {activeTab === 'turnos' && (
           <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center">
                 <h2 className="text-2xl font-serif">Turnos</h2>
                 <button onClick={()=>{setSelectedBooking(null); setIsBookingModalOpen(true)}} className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 text-sm"><Plus size={16}/><span>Nuevo</span></button>
              </div>
              <table className="w-full text-left">
                 <thead><tr className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black"><th className="px-8 py-4">Fecha</th><th className="px-8 py-4">Cliente</th><th className="px-8 py-4 text-center">Estado</th><th className="px-8 py-4 text-right">Acción</th></tr></thead>
                 <tbody className="divide-y">
                    {bookings.map(b => (
                       <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6 font-bold text-sm">{formatDate(b.booking_date)} {b.booking_time?.substring(0,5)}hs</td>
                          <td className="px-8 py-6"><div className="font-bold text-sm">{b.profiles?.full_name || 'Cargando...'}</div><div className="text-[10px] text-slate-400">{b.profiles?.phone || b.profiles?.email || '---'}</div></td>
                          <td className="px-8 py-6 text-center">{b.status==='pending'?<span className="text-[10px] font-bold uppercase py-1 px-3 bg-amber-50 text-amber-600 rounded-full">Pendiente</span>:<span className="text-[10px] font-bold uppercase py-1 px-3 bg-emerald-50 text-emerald-600 rounded-full">Confirmado</span>}</td>
                          <td className="px-8 py-6 text-right space-x-2"><button onClick={()=>{setSelectedBooking(b); setIsBookingModalOpen(true)}} className="p-2 bg-slate-50 rounded-lg"><Pencil size={14}/></button><button onClick={()=>{setBookingToDelete(b); setIsDeleteModalOpen(true)}} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button></td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
        
        {activeTab === 'clientes' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
             <h2 className="text-2xl font-serif mb-6">Clientes</h2>
             <table className="w-full text-left">
                <thead><tr className="text-[10px] uppercase text-slate-400 font-bold border-b"><th className="pb-4">Usuario</th><th className="pb-4 text-right">Acción</th></tr></thead>
                <tbody className="divide-y">{users.filter(u=>u.role==='cliente').map(u=>(<tr key={u.id}><td className="py-6 font-bold text-slate-800">{u.full_name}</td><td className="py-6 text-right"><button onClick={()=>{setSelectedUser(u);setIsUserModalOpen(true)}} className="p-2 bg-slate-100 rounded-lg"><Pencil size={14}/></button></td></tr>))}</tbody>
             </table>
          </div>
        )}

        {activeTab === 'usuarios' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.filter(u=>u.role!=='cliente').map(u=>(<div key={u.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                 <div className="font-bold text-xl mb-1">{u.full_name}</div>
                 <div className="text-[10px] font-black text-primary-600 uppercase mb-4">{u.role}</div>
                 <div className="text-xs text-slate-500 mb-6">{u.email}</div>
                 <button onClick={()=>{setSelectedUser(u);setIsUserModalOpen(true)}} className="w-full py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Editar</button>
              </div>))}
           </div>
        )}

        {(activeTab === 'servicios' || activeTab === 'productos') && (
           <div className="space-y-8">
              <SectionEditor sectionName={activeTab==='servicios'?'services_section':'productos_section'} />
              <div className="bg-white p-8 rounded-3xl shadow-xl">
                 <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-serif">Catálogo</h2><button onClick={()=>{setSelectedProduct({category:activeTab==='servicios'?'servicio':'producto'}); setIsProductModalOpen(true)}} className="p-3 bg-slate-50 rounded-xl"><Plus size={20}/></button></div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.filter(p=>activeTab==='servicios'?p.category==='servicio':p.category!=='servicio').map(p=>(
                       <div key={p.id} className="relative aspect-square bg-slate-50 rounded-3xl overflow-hidden group">
                          {p.image_url && <img src={p.image_url} className="w-full h-full object-cover"/>}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-2"><button onClick={()=>{setSelectedProduct(p); setIsProductModalOpen(true)}} className="p-3 bg-white rounded-xl"><Pencil size={16}/></button></div>
                          <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 rounded-xl text-[10px] font-bold truncate">{p.name}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
        {activeTab === 'portada' && <HeroEditor />}
      </div>

      <UserEditModal isOpen={isUserModalOpen} onClose={()=>setIsUserModalOpen(false)} user={selectedUser} onSave={fetchData} />
      <ProductEditModal isOpen={isProductModalOpen} onClose={()=>setIsProductModalOpen(false)} product={selectedProduct} onSave={fetchData} />
      <BookingEditModal isOpen={isBookingModalOpen} onClose={()=>setIsBookingModalOpen(false)} booking={selectedBooking} onSave={saveBooking} users={users} />
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-10 rounded-[3rem] text-center"><h2 className="text-2xl font-serif mb-6">¿Borrar?</h2><button onClick={confirmDeleteBooking} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold mb-2">Confirmar</button><button onClick={()=>setIsDeleteModalOpen(false)} className="text-slate-400">Volver</button></div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
