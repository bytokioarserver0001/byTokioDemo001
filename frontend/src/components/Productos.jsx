import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductModal = ({ product, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
        >
          {/* Image area */}
          <div className="relative bg-white flex-shrink-0">
            <div className="aspect-square p-6">
              <img
                src={product.images?.[currentImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={18} className="text-slate-600" />
            </button>

            {/* Price badge */}
            <div className="absolute top-4 left-4 bg-slate-900 text-white px-4 py-1.5 rounded-xl text-base font-serif shadow">
              ${product.price}
            </div>

            {/* Image nav */}
            {product.images?.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                <button onClick={() => setCurrentImage(p => (p - 1 + product.images.length) % product.images.length)} className="p-1.5 bg-white rounded-full shadow">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-400">{currentImage + 1} / {product.images.length}</span>
                <button onClick={() => setCurrentImage(p => (p + 1) % product.images.length)} className="p-1.5 bg-white rounded-full shadow">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 border-t border-slate-100 overflow-y-auto">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
              {product.category}
            </span>
            <h2 className="text-2xl font-serif text-slate-800 mt-3 mb-2">{product.name}</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">{product.description}</p>
            <button
              onClick={() => { addToCart(product); onClose(); }}
              className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-900 transition-colors shadow-lg"
            >
              <ShoppingCart size={18} />
              <span>Añadir al Carrito</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProductCard = ({ product, onClick }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();

  const nextImage = (e) => {
    e.stopPropagation();
    setImgError(false);
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setImgError(false);
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="bg-white rounded-[1.5rem] border border-slate-100 shadow-md shadow-slate-200/50 overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col h-full cursor-pointer"
    >
      {/* Carrusel de Imágenes */}
      <div className="aspect-[3/2] bg-white relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!imgError && product.images?.[currentImage] ? (
            <motion.img
              key={currentImage}
              src={product.images[currentImage]}
              onError={() => setImgError(true)}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-200">
              <Star size={64} strokeWidth={1} />
              <p className="text-[10px] uppercase tracking-widest font-black mt-4 opacity-50">Vista Previa No Disponible</p>
            </div>
          )}
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
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-sm font-serif border border-white/10 shadow-lg">
          ${product.price}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 text-left">
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-primary-900 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
            {product.category}
          </span>
        </div>
        
        <h3 className="text-base font-serif text-slate-800 mb-1.5 group-hover:text-primary-900 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        <button 
          onClick={() => addToCart(product)}
          className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 hover:bg-primary-900 transform active:scale-[0.98] transition-all shadow-md shadow-slate-900/10"
        >
          <ShoppingCart size={15} />
          <span>Al Carrito</span>
        </button>
      </div>
    </motion.div>
  );
};

const Productos = () => {
  const [products, setProducts] = useState([]);
  const [sectionData, setSectionData] = useState({ 
    title: 'Productos de Bienestar', 
    subtitle: 'Una selección exclusiva de productos diseñados para prolongar tu experiencia Zen en casa.',
    is_visible: true
  });
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const [productsRes, settingsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .neq('category', 'servicio')
          .order('created_at', { ascending: false }),
        supabase
          .from('site_settings')
          .select('content')
          .eq('section', 'products_section')
          .single()
      ]);

      if (!productsRes.error && productsRes.data) {
        setProducts(productsRes.data);
      }
      
      if (settingsRes.data?.content) {
        setSectionData({
          title: settingsRes.data.content.title || 'Productos de Bienestar',
          subtitle: settingsRes.data.content.subtitle || 'Una selección exclusiva de productos diseñados para prolongar tu experiencia Zen en casa.',
          is_visible: settingsRes.data.content.is_visible !== undefined ? settingsRes.data.content.is_visible : true
        });
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return (
    <div className="py-20 text-center animate-pulse">
      <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4" />
      <p className="text-slate-400 font-serif italic text-xl">Descubriendo Productos wellness...</p>
    </div>
  );

  if (sectionData.is_visible === false) return null;
  if (products.length === 0) return null;

  return (
    <section id="productos" className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 text-primary-900 mb-4"
          >
            <Star size={16} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-widest">Tienda Online Exclusiva</span>
            <Star size={16} fill="currentColor" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-3">{sectionData.title}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto italic">
            {sectionData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      {/* Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
};

export default Productos;
