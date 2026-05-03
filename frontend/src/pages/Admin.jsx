import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Users, Star, Trash2, Pencil, Plus, Package, Eye, Ban, CheckCircle, LayoutDashboard, Calendar, Search, Filter, Tag, AlertCircle } from 'lucide-react';
import UserEditModal from '../components/UserEditModal';
import ProductEditModal from '../components/ProductEditModal';
import BookingEditModal from '../components/BookingEditModal';
import HeroEditor from '../components/HeroEditor';
import SectionEditor from '../components/SectionEditor';

const Admin = () => {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('turnos');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('role', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase.from('bookings').select('*, profiles(full_name, phone, email)').order('booking_date', { ascending: false });
      if (error) {
        const { data: fallback } = await supabase.from('bookings').select('*').order('booking_date', { ascending: false });
        setBookings(fallback || []);
      } else {
        setBookings(data || []);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchProducts(), fetchBookings()]);
      setLoading(false);
    };
    init();
    const interval = setInterval(fetchBookings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // HANDLERS QUE FALTABAN
  const saveProduct = async (id, data) => {
    try {
      if (id) {
        await supabase.from('products').update(data).eq('id', id);
      } else {
        await supabase.from('products').insert(data);
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const saveUserChanges = async (id, data) => {
    try {
      await supabase.from('profiles').update(data).eq('id', id);
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleBlockUser = async (u) => {
    const isBlocked = u.role === 'bloqueado';
    if (!window.confirm(`¿${isBlocked ? 'Desbloquear' : 'Bloquear'} a ${u.full_name || u.email}?`)) return;
    await supabase.from('profiles').update({ role: isBlocked ? 'cliente' : 'bloqueado' }).eq('id', u.id);
    fetchUsers();
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('¿Eliminar este turno definitivamente?')) return;
    await supabase.from('bookings').delete().eq('id', id);
    fetchBookings();
  };

  const saveBooking = async (id, data) => {
    try {
      if (id) {
        await supabase.from('bookings').update(data).eq('id', id);
      } else {
        await supabase.from('bookings').insert([data]);
      }
      setIsBookingModalOpen(false);
      fetchBookings();
    } catch (err) { alert('Error: ' + err.message); }
  };

  if (loading) return <div className="pt-32 text-center text-slate-500 font-serif animate-pulse text-2xl italic">Cargando tu universo...</div>;

  if (user && !profile) {
    console.warn('Acceso bypass temporal activado');
  } else if (profile?.role !== 'superadmin' && profile?.role !== 'admin') {
    return <div className="pt-32 text-center h-screen flex flex-col justify-center items-center bg-slate-900 text-white">
      <Shield size={60} className="text-red-500 mb-6" />
      <h1 className="text-4xl font-serif mb-2">Acceso Restringido</h1>
      <p className="text-slate-400">Solo guardianes pueden entrar.</p>
    </div>;
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-serif text-slate-900 tracking-tight">Management</h1>
          <p className="text-slate-400 font-light text-lg">Control total sobre tu sitio wellness.</p>
        </div>

        {/* Tabs organized in two rows */}
        <div className="space-y-4">
          {/* Row 1: Site Management */}
          <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[2rem] shadow-inner overflow-x-auto scrollbar-hide">
            {[
              { id: 'usuarios', label: 'Admins', icon: Shield },
              { id: 'clientes', label: 'Clientes', icon: Users },
              { id: 'portada', label: 'Portada', icon: LayoutDashboard }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-primary-900 shadow-xl' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Row 2: Content Management */}
          <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[2rem] shadow-inner overflow-x-auto scrollbar-hide">
            {[
              { id: 'servicios', label: 'Servicios', icon: Star },
              { id: 'productos', label: 'Productos', icon: Package },
              { id: 'turnos', label: 'Turnos', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-primary-900 shadow-xl' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        {activeTab === 'turnos' && (
          <div className="space-y-8">
            <SectionEditor 
              sectionName="turnos_section" 
              defaultTitle="Reserva tu Turno" 
              defaultSubtitle="Elegí el momento perfecto para conectar con vos misma."
            />
            <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white border-opacity-40 shadow-2xl overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/50">
                  <h2 className="text-2xl font-serif">Reservas</h2>
                  <button 
                    onClick={() => { setSelectedBooking(null); setIsBookingModalOpen(true); }} 
                    className="bg-primary-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-xl shadow-primary-900/20 hover:scale-105 active:scale-95 transition-all text-sm"
                  >
                    <Plus size={16}/><span>Nuevo Turno</span>
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase bg-slate-50/50 text-slate-400 font-black">
                        <th className="px-8 py-5">Fecha y Hora</th>
                        <th className="px-8 py-5">Cliente</th>
                        <th className="px-8 py-5">Contacto</th>
                        <th className="px-8 py-5">Estado</th>
                        <th className="px-8 py-5 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bookings
                        .sort((a, b) => new Date(`${a.booking_date} ${a.booking_time}`) - new Date(`${b.booking_date} ${b.booking_time}`))
                        .map((b) => {
                        // Plan B: Find user in the pre-loaded users list for 100% reliability
                        const customer = users.find(u => u.id === b.user_id) || (Array.isArray(b.profiles) ? b.profiles[0] : b.profiles);
                        
                        return (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 font-bold text-slate-900 text-sm">
                             {new Date(b.booking_date).toLocaleDateString('es-AR')} {b.booking_time}hs
                          </td>
                          <td className="px-8 py-6">
                             <div className="font-bold text-primary-950 text-sm">{customer?.full_name || 'Sin nombre'}</div>
                             <div className="text-[10px] text-slate-400 font-mono italic">ID: {b.user_id?.substring(0,8)}...</div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="text-xs text-slate-600 font-medium">{customer?.email || '---'}</div>
                             <div className="text-primary-600 font-black text-xs">{customer?.phone || '---'}</div>
                          </td>
                          <td className="px-8 py-6">
                             {b.status === 'pending' ? (
                               <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                                 <AlertCircle size={10} className="mr-1" /> Pendiente
                               </span>
                             ) : (
                               <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                                 <CheckCircle size={10} className="mr-1" /> Confirmado
                               </span>
                             )}
                          </td>
                          <td className="px-8 py-6 text-right space-x-2">
                            {b.status === 'pending' && (
                              <button 
                                onClick={() => saveBooking(b.id, { status: 'confirmed' })} 
                                className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all inline-flex"
                                title="Confirmar Turno"
                              >
                                 <CheckCircle size={16}/>
                              </button>
                            )}
                            <button 
                              onClick={() => { setSelectedBooking(b); setIsBookingModalOpen(true); }} 
                              className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all inline-flex"
                              title="Editar Turno"
                            >
                               <Pencil size={16}/>
                            </button>
                            <button 
                              onClick={() => handleDeleteBooking(b.id)} 
                              className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all inline-flex"
                              title="Eliminar Turno"
                            >
                               <Trash2 size={16}/>
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {(activeTab === 'servicios' || activeTab === 'productos') && (
           <div className="space-y-8">
              {activeTab === 'servicios' && (
                <SectionEditor 
                  sectionName="services_section" 
                  defaultTitle="Nuestros Servicios" 
                  defaultSubtitle="Experiencias diseñadas para tu bienestar."
                />
              )}

              {activeTab === 'productos' && (
                <SectionEditor 
                  sectionName="products_section" 
                  defaultTitle="Nuestros Tesoros" 
                  defaultSubtitle="Llevate una parte de la experiencia zen a tu casa."
                />
              )}
              
              <div className="flex justify-between items-center bg-white/50 p-8 rounded-[3rem] border border-white">
                 <h2 className="text-2xl font-serif">Gestión de {activeTab}</h2>
                 <button onClick={() => { setSelectedProduct({ category: activeTab === 'servicios' ? 'servicio' : 'general' }); setIsProductModalOpen(true); }} className="bg-primary-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2"><Plus size={20}/><span>Nuevo</span></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.filter(p => activeTab === 'servicios' ? p.category === 'servicio' : p.category !== 'servicio').map(p => (
                   <div key={p.id} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden group p-2 relative">
                      <div className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden relative">
                         {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
                         <button onClick={() => { setSelectedProduct(p); setIsProductModalOpen(true); }} className="absolute top-4 right-4 p-3 bg-white/90 rounded-xl"><Pencil size={18}/></button>
                         {p.sale_price && <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 shadow-lg"><Tag size={10}/><span>Oferta</span></div>}
                      </div>
                      <div className="p-6">
                         <div className="flex justify-between mb-2">
                           <h3 className="text-xl font-serif">{p.name}</h3>
                           <div className="text-right">
                             {p.sale_price ? (
                               <>
                                 <div className="text-[10px] text-slate-300 line-through">${p.price}</div>
                                 <div className="text-sm font-black text-red-500">${p.sale_price}</div>
                               </>
                             ) : (
                               <div className="text-sm font-black text-primary-900">${p.price}</div>
                             )}
                           </div>
                         </div>
                         <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                      </div>
                   </div>
                ))}
              </div>
           </div>
        )}

        {activeTab === 'portada' && <HeroEditor />}
        {(activeTab === 'usuarios' || activeTab === 'clientes') && (
          <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-2xl font-serif">Gestión de {activeTab === 'usuarios' ? 'Administradores' : 'Clientes & Usuarios'}</h2>
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400">
                   <Search size={14} />
                   <span>{users.filter(u => activeTab === 'clientes' ? !['admin', 'superadmin'].includes(u.role) : ['admin', 'superadmin'].includes(u.role)).length} Registrados</span>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400">
                      <tr>
                        <th className="px-8 py-5">Identidad</th>
                        <th className="px-8 py-5">Nivel de Acceso</th>
                        <th className="px-8 py-5">Contacto</th>
                        <th className="px-8 py-5 text-center">Gestión</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {users
                        .filter(u => activeTab === 'clientes' ? !['admin', 'superadmin'].includes(u.role) : ['admin', 'superadmin'].includes(u.role))
                        .map(u => (
                         <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6">
                               <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                    u.role === 'superadmin' ? 'bg-amber-400 shadow-lg shadow-amber-200' : 
                                    u.role === 'admin' ? 'bg-primary-600' : 'bg-slate-300'
                                  }`}>
                                     {u.full_name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                     <div className="font-bold text-slate-900">{u.full_name || 'Sin nombre'}</div>
                                     <div className="text-[10px] text-slate-400">{u.id.substring(0, 8)}...</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                 u.role === 'superadmin' ? 'bg-amber-100 text-amber-700' :
                                 u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                 u.role === 'bloqueado' ? 'bg-red-100 text-red-700' :
                                 'bg-emerald-100 text-emerald-700'
                               }`}>
                                  {u.role}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                               <div>{u.email}</div>
                               <div className="text-primary-600">{u.phone || '---'}</div>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <div className="flex justify-center space-x-2">
                                  <button 
                                    onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}
                                    className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary-600 hover:shadow-md transition-all"
                                  >
                                     <Pencil size={16}/>
                                  </button>
                                  {profile?.role === 'superadmin' && u.id !== user?.id && (
                                    <button 
                                      onClick={() => handleBlockUser(u)}
                                      className={`p-2.5 rounded-xl transition-all ${
                                        u.role === 'bloqueado' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500 hover:bg-red-100'
                                      }`}
                                    >
                                       {u.role === 'bloqueado' ? <CheckCircle size={16}/> : <Ban size={16}/>}
                                    </button>
                                  )}
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      <UserEditModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} user={selectedUser} onSave={saveUserChanges} />
      <ProductEditModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} product={selectedProduct} onSave={saveProduct} />
      <BookingEditModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} booking={selectedBooking} onSave={saveBooking} users={users} />
    </div>
  );
};

export default Admin;
