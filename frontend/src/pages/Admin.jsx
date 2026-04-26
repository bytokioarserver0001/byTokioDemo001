import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Shield, User, Star, Trash2, Pencil, Plus, Package, Eye, Ban, CheckCircle, LayoutDashboard } from 'lucide-react';
import UserEditModal from '../components/UserEditModal';
import ProductEditModal from '../components/ProductEditModal';
import HeroEditor from '../components/HeroEditor';
import SectionEditor from '../components/SectionEditor';

const Admin = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios', 'Productos'
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUsers();
      await fetchProducts();
    };
    init();
  }, []);

  // User Handlers
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const saveUserChanges = async (userId, updatedData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedData.full_name,
          phone: updatedData.phone,
          role: updatedData.role
        })
        .eq('id', userId);
      
      if (error) throw error;
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Error al actualizar: ' + err.message);
    }
  };

  const handleBlockUser = async (u) => {
    const isBlocked = u.role === 'bloqueado';
    const msg = isBlocked
      ? `¿Desbloquear a ${u.full_name || u.email}?`
      : `¿Bloquear a ${u.full_name || u.email}? No podrá ingresar al sistema.`;
    if (!window.confirm(msg)) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: isBlocked ? 'cliente' : 'bloqueado' })
        .eq('id', u.id);
      if (error) throw error;
      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`¿Eliminar definitivamente a ${u.full_name || u.email}? Esta acción no tiene vuelta atrás.`)) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', u.id);
      if (error) throw error;
      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Product Handlers
  const handleAddProduct = () => {
    setSelectedProduct({ category: activeTab === 'servicios' ? 'servicio' : 'general' });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const saveProduct = async (id, data) => {
    try {
      if (id) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert(data);
        if (error) throw error;
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert('Error al guardar producto: ' + err.message);
    }
  };

  if (loading) return <div className="pt-32 text-center text-slate-500">Cargando panel...</div>;

  if (profile?.role !== 'superadmin' && profile?.role !== 'admin') {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-serif text-red-600">Acceso Denegado</h1>
        <p className="text-gray-500">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-serif text-slate-900">Panel de Control</h1>
            <p className="text-gray-500 italic">Gestión de usuarios y Productos wellness.</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.open('https://bytokiodemo.serverbytokio.duckdns.org', '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-slate-600 hover:text-primary-900 rounded-xl border border-slate-100 shadow-sm transition-all font-bold text-sm"
          >
            <Eye size={18} />
            <span>Ver Sitio</span>
          </button>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'usuarios' 
                ? 'bg-white text-primary-900 shadow-md' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={18} />
            <span>Usuarios</span>
          </button>
          <button 
            onClick={() => setActiveTab('productos')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'productos' 
                ? 'bg-white text-primary-900 shadow-md' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Star size={18} />
            <span>Productos</span>
          </button>
          <button 
            onClick={() => setActiveTab('servicios')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'servicios' 
                ? 'bg-white text-primary-900 shadow-md' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package size={18} />
            <span>Servicios</span>
          </button>
          <button 
            onClick={() => setActiveTab('portada')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'portada' 
                ? 'bg-white text-primary-900 shadow-md' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Portada</span>
          </button>
        </div>
        </div>
      </div>

      {activeTab === 'portada' ? (
        <HeroEditor />
      ) : activeTab === 'usuarios' ? (
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Contacto</th>
                <th className="px-8 py-5">Rol Actual</th>
                <th className="px-8 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr 
                  key={u.id} 
                  className={`transition-colors group ${
                    u.role === 'bloqueado' ? 'bg-red-50/40 opacity-70' : 'hover:bg-primary-50/30'
                  }`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                        u.role === 'bloqueado' ? 'from-red-100 to-red-200 text-red-500' : 'from-slate-100 to-slate-200 text-slate-500'
                      }`}>
                        {u.role === 'bloqueado' ? <Ban size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{u.full_name || 'Sin nombre'}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-slate-600">{u.phone || '—'}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Teléfono</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      u.role === 'superadmin' ? 'bg-red-500 text-white' :
                      u.role === 'admin' ? 'bg-primary-600 text-white' :
                      u.role === 'bloqueado' ? 'bg-red-200 text-red-700' :
                      u.role === 'cliente' ? 'bg-green-100 text-green-700' :
                      u.role === 'usuario' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      {/* Editar */}
                      <button
                        onClick={() => handleEditClick(u)}
                        title="Editar usuario"
                        className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                      >
                        <Pencil size={15} />
                      </button>
                      {/* Bloquear / Desbloquear */}
                      {profile?.role === 'superadmin' && u.role !== 'superadmin' && (
                        <button
                          onClick={() => handleBlockUser(u)}
                          title={u.role === 'bloqueado' ? 'Desbloquear usuario' : 'Bloquear usuario'}
                          className={`p-2 rounded-lg transition-all shadow-sm ${
                            u.role === 'bloqueado'
                              ? 'bg-green-100 text-green-600 hover:bg-green-500 hover:text-white'
                              : 'bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white'
                          }`}
                        >
                          {u.role === 'bloqueado' ? <CheckCircle size={15} /> : <Ban size={15} />}
                        </button>
                      )}
                      {/* Eliminar */}
                      {profile?.role === 'superadmin' && u.role !== 'superadmin' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Eliminar usuario"
                          className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={15} />
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
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-slate-800">
              Inventario de {activeTab === 'servicios' ? 'Servicios' : 'Productos'}
            </h2>
            <button 
              onClick={() => handleAddProduct()}
              className="bg-primary-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-slate-800 transition-all shadow-lg"
            >
              <Plus size={18} />
              <span>Nuevo {activeTab === 'servicios' ? 'Servicio' : 'Producto'}</span>
            </button>
          </div>

          {activeTab === 'servicios' && (
            <SectionEditor 
              sectionName="services_section" 
              defaultTitle="Nuestros Servicios"
              defaultSubtitle="Selecciona un viaje diseñado para tu renovación." 
            />
          )}

          {activeTab === 'productos' && (
            <SectionEditor 
              sectionName="products_section" 
              defaultTitle="Productos de Bienestar"
              defaultSubtitle="Una selección exclusiva de productos diseñados para prolongar tu experiencia Zen en casa." 
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.filter(p => activeTab === 'servicios' ? p.category === 'servicio' : p.category !== 'servicio').map((p) => (

              <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all">
                <div className="aspect-video bg-slate-100 overflow-hidden relative">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Star size={40} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary-900 border border-white/20">
                    ${p.price}
                  </div>
                </div>
                <div className="p-6 text-left">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl text-slate-800">{p.name}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(p);
                      }}
                      className="p-2 text-slate-400 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{p.category}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${p.is_active ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <UserEditModal 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        onSave={saveUserChanges}
      />

      <ProductEditModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSave={saveProduct}
      />
    </div>
  );
};

export default Admin;
