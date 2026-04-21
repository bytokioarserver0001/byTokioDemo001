import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Shield, User, Star, Trash2, Save, X, Pencil } from 'lucide-react';

const Admin = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: false });
      
      if (error) throw error;
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setEditValues({
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role
    });
  };

  const saveChanges = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editValues.full_name,
          phone: editValues.phone,
          role: editValues.role
        })
        .eq('id', userId);
      
      if (error) throw error;
      setEditingId(null);
      fetchUsers();
      alert('Información actualizada correctamente');
    } catch (err) {
      alert('Error al actualizar: ' + err.message);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

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
      <div className="flex items-center space-x-4 mb-12">
        <div className="w-12 h-12 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-serif text-slate-900">Panel de Control</h1>
          <p className="text-gray-500 italic">Gestión de usuarios y niveles de acceso.</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Contacto</th>
                <th className="px-8 py-5">Rol Actual</th>
                <th className="px-8 py-5 text-center">Gestión de Nivel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-500 shadow-sm group-hover:from-primary-100 group-hover:to-primary-200 group-hover:text-primary-600 transition-all">
                        <User size={20} />
                      </div>
                      <div>
                        {editingId === u.id ? (
                          <input
                            type="text"
                            value={editValues.full_name}
                            onChange={(e) => setEditValues({...editValues, full_name: e.target.value})}
                            className="text-sm font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 mb-1 w-full"
                          />
                        ) : (
                          <div className="font-bold text-slate-800">{u.full_name || 'Sin nombre'}</div>
                        )}
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {editingId === u.id ? (
                      <input
                        type="text"
                        value={editValues.phone}
                        onChange={(e) => setEditValues({...editValues, phone: e.target.value})}
                        className="text-sm bg-white border border-slate-200 rounded-lg px-2 py-1 w-full"
                      />
                    ) : (
                      <>
                        <div className="text-sm text-slate-600">{u.phone || '—'}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Teléfono</div>
                      </>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {editingId === u.id ? (
                      <select 
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 w-full"
                        value={editValues.role}
                        onChange={(e) => setEditValues({...editValues, role: e.target.value})}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="usuario">Usuario</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    ) : (
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        u.role === 'superadmin' ? 'bg-red-500 text-white' :
                        u.role === 'admin' ? 'bg-primary-600 text-white' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center space-x-2">
                      {editingId === u.id ? (
                        <>
                          <button 
                            onClick={() => saveChanges(u.id)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                            title="Guardar cambios"
                          >
                            <Save size={16} />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        profile.role === 'superadmin' && (
                          <button 
                            onClick={() => startEditing(u)}
                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                            title="Editar información"
                          >
                            <Pencil size={16} />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
