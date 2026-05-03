import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const fetchProfile = async (userId, userMetadata = null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Escenario A: No existe el perfil, lo creamos
        const newProfile = {
          id: userId,
          full_name: userMetadata?.full_name || '',
          phone: userMetadata?.phone || '',
          role: 'cliente'
        };
        
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
        
        if (createError) console.error('Error al crear perfil:', createError);
        else setProfile(created);
      } else if (!error && data) {
        // Escenario B: El perfil existe pero podría estar incompleto (ej: creado por un trigger básico)
        if (userMetadata && (!data.full_name || !data.phone)) {
          const updates = {
            full_name: data.full_name || userMetadata.full_name || '',
            phone: data.phone || userMetadata.phone || ''
          };
          
          const { data: updated, error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
            
          if (!updateError) setProfile(updated);
          else setProfile(data);
        } else {
          setProfile(data);
        }
      }
    } catch (err) {
      console.error('Error en fetchProfile:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user.user_metadata);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.user_metadata);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error('Debes confirmar tu email antes de ingresar.');
    }
  };

  const register = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      login, 
      register,
      resetPassword,
      logout, 
      isLoginModalOpen, 
      openLoginModal, 
      closeLoginModal 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
