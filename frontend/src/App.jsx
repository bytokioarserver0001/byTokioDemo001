import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Services />
        
        {/* Placeholder for future sections */}
        <section id="tesoros" className="py-20 text-center">
          <h2 className="text-3xl font-serif text-primary-950 mb-8">Nuestros Tesoros</h2>
          <p className="text-gray-400 italic">Próximamente: Una selección curada de productos para tu bienestar.</p>
        </section>

        <section id="reserva" className="py-20 bg-primary-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-serif mb-6">Encuentra tu momento</h2>
            <p className="mb-10 text-primary-200 max-w-lg mx-auto">Consulta nuestra disponibilidad en tiempo real y reserva tu espacio de paz.</p>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 inline-block w-full max-w-3xl">
              {/* Aquí irá el widget de Google Calendar */}
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl italic text-white/40">
                Integración con Google Calendar en proceso...
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
        </section>
      </main>
      
      <footer className="py-12 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>&copy; 2026 byTokio - Un santuario de bienestar.</p>
      </footer>
    </div>
  )
}

export default App
