import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
    >
      {/* Carrusel de Imágenes */}
      <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={product.images[currentImage] || 'https://via.placeholder.com/400x500?text=No+Image'}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Controles del Carrusel */}
        {product.images.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={prevImage} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextImage} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Indicadores */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
              {product.images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${i === currentImage ? 'w-6 bg-primary-900' : 'w-2 bg-white/50 blur-[0.5px]'}`} 
                />
              ))}
            </div>
          </>
        )}

        {/* Badge de Precio */}
        <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-md text-white px-5 py-2 rounded-2xl text-lg font-serif border border-white/10 shadow-xl">
          ${product.price}
        </div>
      </div>

      {/* Info */}
      <div className="p-8 flex flex-col flex-1 text-left">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-900 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            {product.category}
          </span>
        </div>
        
        <h3 className="text-2xl font-serif text-slate-800 mb-3 group-hover:text-primary-900 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
          {product.description}
        </p>

        <button className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-primary-900 transform active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10">
          <ShoppingCart size={20} />
          <span>Añadir al Carrito</span>
        </button>
      </div>
    </motion.div>
  );
};

const Tesoros = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return (
    <div className="py-20 text-center animate-pulse">
      <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4" />
      <p className="text-slate-400 font-serif italic text-xl">Descubriendo tesoros wellness...</p>
    </div>
  );

  if (products.length === 0) return null;

  return (
    <section id="tesoros" className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 text-primary-900 mb-4"
          >
            <Star size={16} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-widest">Tienda Curada</span>
            <Star size={16} fill="currentColor" />
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-serif text-slate-800 mb-6">Tesoros de Bienestar</h2>
          <p className="text-slate-500 max-w-2xl mx-auto italic text-lg">
            Una selección exclusiva de productos diseñados para prolongar tu experiencia Zen en casa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
    </section>
  );
};

export default Tesoros;
