import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contacto = () => {
  return (
    <section id="contacto" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-slate-800 mb-4">Ponte en Contacto</h2>
          <p className="text-slate-500 italic max-w-xl mx-auto">Estamos aquí para escucharte y brindarte toda la información que necesites.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div className="space-y-10">
            <h3 className="text-2xl font-serif text-slate-800">Nuestros Datos</h3>
            
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Dirección</h4>
                <p className="text-slate-500">Av. Siempre Viva 742, <br />Springfield, CP 1234</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Teléfono</h4>
                <p className="text-slate-500">+54 9 11 1234-5678</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Email</h4>
                <p className="text-slate-500">contacto@sitedemo.com</p>
              </div>
            </div>
          </div>

          <form className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 shadow-sm" onSubmit={(e) => e.preventDefault()}>
            <h3 className="text-2xl font-serif text-slate-800 mb-6">Envíanos un Mensaje</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nombre Completo</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-400" placeholder="Ej. Ana García" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Correo Electrónico</label>
                <input type="email" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-400" placeholder="ana@ejemplo.com" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Cuentanos como podemos ayudarte</label>
                <textarea rows="4" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-400 resize-none" placeholder="Escribe tu mensaje..."></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold mt-4 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/20">
                Enviar Mensaje
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contacto;
