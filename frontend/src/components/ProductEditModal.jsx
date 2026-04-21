import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, DollarSign, Tag, Image, Save, Trash2, Eye, EyeOff, Upload, Loader2 } from 'lucide-react';

const ProductEditModal = ({ isOpen, onClose, product, onSave }) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'general',
    images: [],
    is_active: true
  });
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: product.category || 'general',
        images: product.images || [],
        is_active: product.is_active ?? true
      });
      setImageInput(product.images?.join(', ') || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'general',
        images: [],
        is_active: true
      });
      setImageInput('');
    }
  }, [product]);

  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const newImages = [...formData.images, publicUrl];
      setFormData({ ...formData, images: newImages });
      setImageInput(newImages.join(', '));
      
    } catch (error) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const imagesArray = imageInput.split(',').map(img => img.trim()).filter(img => img !== '');
    onSave(product?.id, { ...formData, images: imagesArray });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-900 p-8 text-white relative flex-shrink-0">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <Package size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-serif">{product ? 'Editar Tesoro' : 'Nuevo Tesoro'}</h3>
                <p className="text-slate-400 text-sm">Gestiona la información del producto.</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Producto</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-medium"
                      placeholder="Ej: Esencia Zen"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-medium"
                  >
                    <option value="general">General</option>
                    <option value="masajes">Masajes</option>
                    <option value="esencias">Esencias</option>
                    <option value="piedras">Piedras</option>
                    <option value="accesorios">Accesorios</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Imagen del Producto (Subir archivo)</label>
                  <div className="flex flex-col space-y-2">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-primary-300'}`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-xs text-slate-500 font-bold">Haz clic para subir o arrastra</p>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">O pegar URLs manual (Separadas por coma)</label>
                  <div className="relative">
                    <Image className="absolute left-4 top-4 text-slate-300" size={18} />
                    <textarea
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-medium min-h-[100px]"
                      placeholder="https://images.com/foto1.jpg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-3 text-slate-600">
                    {formData.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                    <span className="font-bold text-sm">Estado: {formData.is_active ? 'Activo' : 'Oculto'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_active ? 'bg-primary-900' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción del Producto</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-medium min-h-[100px]"
                placeholder="Describe los beneficios y características de este tesoro..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 flex space-x-4 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-white transition-all shadow-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-[2] bg-primary-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-primary-900/10"
            >
              <Save size={18} />
              <span>{product ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductEditModal;
