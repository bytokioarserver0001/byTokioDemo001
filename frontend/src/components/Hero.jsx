import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { siteContent } from '../data/content';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  const [hero, setHero] = useState({
    title: siteContent.hero.title,
    subtitle: siteContent.hero.subtitle,
    cta_text: siteContent.hero.cta,
    cta2_text: 'Ver Servicios',
    bg_images: []
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('content')
          .eq('section', 'hero')
          .single();

        if (data?.content) {
          setHero(prev => ({
            title: data.content.title || prev.title,
            subtitle: data.content.subtitle || prev.subtitle,
            cta_text: data.content.cta_text || prev.cta_text,
            cta2_text: data.content.cta2_text || prev.cta2_text,
            bg_images: data.content.bg_images || (data.content.bg_image ? [data.content.bg_image] : [])
          }));
        }
      } catch (_err) {
        // Fallback to static content silently
      }
    };
    fetchHero();
  }, []);

  const paginate = useCallback((newDirection) => {
    if (hero.bg_images.length <= 1) return;
    setDirection(newDirection);
    setCurrentSlide(prev => {
      let next = prev + newDirection;
      if (next < 0) next = hero.bg_images.length - 1;
      if (next >= hero.bg_images.length) next = 0;
      return next;
    });
  }, [hero.bg_images.length]);

  // Auto-rotate carousel
  useEffect(() => {
    if (hero.bg_images.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [hero.bg_images.length, paginate]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.8 }
    })
  };

  const hasImages = hero.bg_images.length > 0;

  return (
    <div className="relative h-[100vh] min-h-[600px] w-full overflow-hidden flex items-center">
      {/* Background carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction}>
          {hasImages ? (
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.8 },
                scale: { duration: 1.5 }
              }}
              className="absolute inset-0"
            >
              <img
                src={hero.bg_images[currentSlide]}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-slate-50">
               <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50" />
               <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-pink-50 rounded-full blur-3xl opacity-50" />
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            key={hero.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-5xl md:text-8xl font-serif mb-8 leading-[1.1] ${
              hasImages ? 'text-white drop-shadow-2xl' : 'text-primary-900'
            }`}
          >
            {hero.title}
          </motion.h1>
          <motion.p 
            key={hero.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-light leading-relaxed ${
              hasImages ? 'text-white/90 drop-shadow-md' : 'text-gray-600'
            }`}
          >
            {hero.subtitle}
          </motion.p>
          <div className="flex flex-wrap justify-center gap-5">
            <a 
              href="#reserva"
              className="px-10 py-5 bg-primary-600 inline-block text-white rounded-2xl font-bold shadow-2xl shadow-primary-900/20 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all"
            >
              {hero.cta_text}
            </a>
            <a 
              href="#servicios"
              className={`px-10 py-5 inline-block rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 ${
              hasImages 
                ? 'bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-md'
                : 'border-2 border-primary-100 text-primary-900 hover:bg-primary-50'
            }`}>
              {hero.cta2_text}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {hero.bg_images.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all z-20 group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all z-20 group"
          >
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      )}

      {/* Progress indicators / Pagination dots */}
      {hero.bg_images.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-end space-x-3 z-20">
          {hero.bg_images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentSlide ? 1 : -1);
                setCurrentSlide(i);
              }}
              className="relative py-2 group"
              aria-label={`Slide ${i + 1}`}
            >
              <div className={`h-1 rounded-full transition-all duration-500 overflow-hidden ${
                i === currentSlide ? 'w-12 bg-white' : 'w-6 bg-white/30 hover:bg-white/50'
              }`}>
                {i === currentSlide && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: "linear" }}
                    className="h-full bg-primary-400"
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;
