import React from 'react'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Productos from '../components/Productos'
import Turnos from '../components/Turnos'
import Contacto from '../components/Contacto'

const Home = () => {
  return (
    <>
      <Hero />
      <Services />
      <Productos />
      <Turnos />
      <Contacto />
    </>
  )
}

export default Home
