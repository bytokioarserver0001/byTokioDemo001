import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Turnos = () => {
  const [sectionData, setSectionData] = useState({
    title: 'Encuentra tu momento',
    subtitle: 'Consulta nuestra disponibilidad en tiempo real y reserva tu espacio de paz.',
    is_visible: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('content')
          .eq('section', 'turnos_section')
          .single();

        if (data?.content) {
          setSectionData({
            title: data.content.title || 'Encuentra tu momento',
            subtitle: data.content.subtitle || 'Consulta nuestra disponibilidad en tiempo real y reserva tu espacio de paz.',
            is_visible: data.content.is_visible !== undefined ? data.content.is_visible : true
          });
        }
      } catch (error) {
        // Fallback a los defaults
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, []);

  if (loading) return null;
  if (sectionData.is_visible === false) return null;

  return (
    <section id="reserva" className="py-20 bg-primary-900 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl font-serif mb-6">{sectionData.title}</h2>
        <p className="mb-10 text-primary-200 max-w-lg mx-auto">{sectionData.subtitle}</p>
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 inline-block w-full max-w-3xl">
          {/* Aquí irá el widget de Google Calendar */}
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl italic text-white/40">
            Integración con Google Calendar en proceso...
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
    </section>
  );
};

export default Turnos;
