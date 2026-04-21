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
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-widest">
                <th className="px-8 py-4">Usuario</th>
                <th className="px-8 py-4">Email</th>
                <th className="px-8 py-4">Rol Actual</th>
                <th className="px-8 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-primary-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                      <span className="font-medium text-slate-700">{u.username || 'Sin nombre'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 text-sm">{u.email}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'superadmin' ? 'bg-red-100 text-red-700' :
                      u.role === 'admin' ? 'bg-primary-100 text-primary-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {profile.role === 'superadmin' && u.email !== profile.email && (
                      <div className="flex items-center justify-center space-x-2">
                        <select 
                          className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          defaultValue={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                        >
                          <option value="cliente">Cliente</option>
                          <option value="usuario">Usuario</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
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
