import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, DollarSign, Tag, Image, Save, Trash2, Eye, EyeOff, Upload, Loader2, List } from 'lucide-react';

const ProductEditModal = ({ isOpen, onClose, product, onSave }) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'general',
    images: [],
    is_active: true,
    stock: 0
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
        is_active: product.is_active ?? true,
        stock: product.stock || 0
      });
      setImageInput(product.images?.join(', ') || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'general',
        images: [],
        is_active: true,
        stock: 0
      });
      setImageInput('');
    }
  }, [product, isOpen]);

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
    
    // Solo enviamos las columnas que existen en la DB
    const finalData = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      images: imagesArray,
      is_active: formData.is_active,
      stock: formData.stock
    };
    
    onSave(product?.id, finalData);
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
          className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-slate-900 p-10 text-white relative flex-shrink-0">
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-2xl transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <Package size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-serif">{product?.id ? 'Editar Ítem' : 'Nuevo Ítem'}</h3>
                <p className="text-slate-400 text-sm">Actualiza la información del catálogo.</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Identificación</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-4 text-slate-300" size={20} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-slate-900 font-bold"
                      placeholder="Nombre del servicio o producto"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Precio ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-4 text-slate-300" size={20} />
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Stock / Cupo</label>
                    <div className="relative">
                      <List className="absolute left-4 top-4 text-slate-300" size={20} />
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-900"
                  >
                    <option value="servicio">Servicio (Turnero)</option>
                    <option value="general">Producto General</option>
                    <option value="masajes">Masajes</option>
                    <option value="esencias">Esencias</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Imagen Principal</label>
                  <div className="flex flex-col space-y-3">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${uploading ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/50 border-slate-200 hover:bg-slate-100 hover:border-slate-400'}`}>
                      <div className="flex flex-col items-center justify-center">
                        {uploading ? (
                          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-[10px] text-slate-500 font-black uppercase">Subir Foto nueva</p>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">URL de Imagen</label>
                  <textarea
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-xs min-h-[100px]"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-between p-5 bg-slate-100/50 rounded-3xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    {formData.is_active ? <Eye className="text-emerald-500" size={20} /> : <EyeOff className="text-slate-400" size={20} />}
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-600">{formData.is_active ? 'Visible en Web' : 'Oculto'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.is_active ? 'bg-black' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Descripción / Beneficios</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-10 border-t border-slate-50 flex space-x-4 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-5 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-[2] bg-black text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductEditModal;
