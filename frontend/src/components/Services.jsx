import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Services = () => {
  const [services, setServices] = useState([]);
  const [sectionData, setSectionData] = useState({ title: 'Nuestros Servicios', subtitle: 'Selecciona un viaje diseñado para tu renovación.' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const [productsRes, settingsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('category', 'servicio')
          .order('created_at', { ascending: false }),
        supabase
          .from('site_settings')
          .select('content')
          .eq('section', 'services_section')
          .single()
      ]);

      if (!productsRes.error && productsRes.data) {
        setServices(productsRes.data);
      }
      
      if (settingsRes.data?.content) {
        setSectionData({
          title: settingsRes.data.content.title || 'Nuestros Servicios',
          subtitle: settingsRes.data.content.subtitle || 'Selecciona un viaje diseñado para tu renovación.'
        });
      }

      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading) return (
    <div className="py-20 text-center animate-pulse">
      <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4" />
      <p className="text-slate-400 font-serif italic text-xl">Cargando Servicios...</p>
    </div>
  );

  return (
    <section id="experiencias" className="py-20 bg-slate-100/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl font-serif text-primary-950 mb-4">{sectionData.title}</h2>
          <p className="text-gray-500 max-w-xl mx-auto italic">{sectionData.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200 hover:border-primary-300 transition-all group overflow-hidden flex flex-col"
              >
                {service.images?.[0] ? (
                  <div className="w-full h-48 bg-slate-100 overflow-hidden relative">
                    <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="w-full p-8 flex justify-center border-b border-primary-50">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <Wind size={24} />
                    </div>
                  </div>
                )}
                
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-serif text-primary-900 mb-3">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-1">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">{service.category}</span>
                    <span className="text-lg font-semibold text-primary-600">${service.price}</span>
                  </div>
                  <button className="w-full mt-6 py-3 border border-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-600 hover:text-white transition-all">
                    Reservar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
