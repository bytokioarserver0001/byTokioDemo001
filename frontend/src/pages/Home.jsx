import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Productos from '../components/Productos'
import Turnos from '../components/Turnos'
import Contacto from '../components/Contacto'

const Home = () => {
  const [visibility, setVisibility] = useState({
    services_section: true,
    products_section: true,
    turnos_section: true
  });

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('section, content')
          .in('section', ['services_section', 'products_section', 'turnos_section']);
        
        if (data) {
          const newVis = { ...visibility };
          data.forEach(item => {
            if (item.content) {
              newVis[item.section] = item.content.is_visible !== false;
            }
          });
          setVisibility(newVis);
        }
      } catch (err) {
        console.error('Error loading visibility:', err);
      }
    };
    fetchVisibility();
  }, []);

  return (
    <>
      <Hero />
      {visibility.services_section && <Services />}
      {visibility.products_section && <Productos />}
      {visibility.turnos_section && <Turnos />}
      <Contacto />
    </>
  )
}

export default Home
