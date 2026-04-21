import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Cloud, Flower2, Moon, Mountain } from 'lucide-react';
import { siteContent } from '../data/content';

const iconMap = {
  Wind,
  Cloud,
  Flower2,
  Moon,
  Mountain,
};

const Services = () => {
  return (
    <section id="experiencias" className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-indigo-950 mb-4">Nuestras Experiencias</h2>
          <p className="text-gray-500 max-w-xl mx-auto italic">Selecciona un viaje diseñado para tu renovación.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {siteContent.services.map((service, index) => {
            const Icon = iconMap[service.icon] || Wind;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-indigo-100 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-serif text-indigo-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{service.duration}</span>
                  <span className="text-lg font-semibold text-indigo-600">{service.price}</span>
                </div>
                <button className="w-full mt-6 py-3 border border-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-600 hover:text-white transition-all">
                  Reservar
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
