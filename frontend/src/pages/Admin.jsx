import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Shield, User, Star, Trash2, Save } from 'lucide-react';

const Admin = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const updateRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      fetchUsers();
      alert('Rol actualizado con éxito');
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
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {profile.role === 'superadmin' && u.email !== profile.email && (
                      <div className="flex items-center justify-center">
                        <select 
                          className="text-xs bg-white border-2 border-slate-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer hover:border-primary-200"
                          defaultValue={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                        >
                          <option value="cliente">Cliente (Nivel 1)</option>
                          <option value="usuario">Usuario (Nivel 2)</option>
                          <option value="admin">Admin (Nivel 3)</option>
                          <option value="superadmin">Superadmin (Máximo)</option>
                        </select>
                      </div>
                    )}
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
