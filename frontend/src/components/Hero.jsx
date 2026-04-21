import React from 'react';
import { motion } from 'framer-motion';
import { siteContent } from '../data/content';

const Hero = () => {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-serif text-primary-900 mb-6 leading-tight">
            {siteContent.hero.title}
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-light">
            {siteContent.hero.subtitle}
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-8 py-4 bg-primary-600 text-white rounded-full font-medium shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all transform hover:-translate-y-1">
              {siteContent.hero.cta}
            </button>
            <button className="px-8 py-4 border border-primary-100 text-primary-600 rounded-full font-medium hover:bg-primary-50 transition-all">
              Ver Servicios
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-pink-50 rounded-full blur-3xl opacity-50" />
    </div>
  );
};

export default Hero;
