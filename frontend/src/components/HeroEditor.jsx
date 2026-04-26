import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Image, Type, AlignLeft, MousePointerClick, Upload, CheckCircle, Loader, Trash2, GripVertical, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const HeroEditor = () => {
  const [heroData, setHeroData] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta2_text: '',
    bg_images: []
  });
  const [generalData, setGeneralData] = useState({
    logo_type: 'text', // 'text' or 'image'
    logo_text: '',
    logo_url: '',
    title_font: 'Playfair Display',
    body_font: 'Outfit'
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('section', 'hero')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const content = data.content;
        setHeroData({
          title: content.title || '',
          subtitle: content.subtitle || '',
          cta_text: content.cta_text || '',
          cta2_text: content.cta2_text || '',
          bg_images: content.bg_images || (content.bg_image ? [content.bg_image] : [])
        });
      }
    } catch (err) {
      console.error('Error loading hero settings:', err.message);
    }
  };

  const fetchGeneralSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('section', 'general')
        .single();

      if (data) {
        setGeneralData({
          logo_type: data.content.logo_type || 'text',
          logo_text: data.content.logo_text || '',
          logo_url: data.content.logo_url || '',
          title_font: data.content.title_font || 'Playfair Display',
          body_font: data.content.body_font || 'Outfit'
        });
      }
    } catch (err) {
      console.error('Error loading general settings:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchHeroSettings();
      await fetchGeneralSettings();
    };
    init();
  }, []);

  // Auto-rotate preview
  useEffect(() => {
    if (heroData.bg_images.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % heroData.bg_images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroData.bg_images.length]);


  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const newUrls = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `hero-bg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${fileExt}`;
        const filePath = `hero/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      setHeroData(prev => ({
        ...prev,
        bg_images: [...prev.bg_images, ...newUrls]
      }));
    } catch (err) {
      alert('Error subiendo imagen: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `brand/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setGeneralData(prev => ({ ...prev, logo_url: publicUrl, logo_type: 'image' }));
    } catch (err) {
      alert('Error subiendo logo: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeImage = (index) => {
    setHeroData(prev => ({
      ...prev,
      bg_images: prev.bg_images.filter((_, i) => i !== index)
    }));
    setPreviewIndex(0);
  };

  const moveImage = (from, to) => {
    if (to < 0 || to >= heroData.bg_images.length) return;
    setHeroData(prev => {
      const imgs = [...prev.bg_images];
      const [moved] = imgs.splice(from, 1);
      imgs.splice(to, 0, moved);
      return { ...prev, bg_images: imgs };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Save Hero
      const { error: heroErr } = await supabase
        .from('site_settings')
        .upsert({
          section: 'hero',
          content: heroData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section' });

      if (heroErr) throw heroErr;

      // Save General (Logo)
      const { error: genErr } = await supabase
        .from('site_settings')
        .upsert({
          section: 'general',
          content: generalData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section' });

      if (genErr) throw genErr;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error guardando: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Current preview image is handled in the JSX mapping

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-slate-900">Configuración de Portada</h2>
          <p className="text-slate-500 mt-1">Personaliza el mensaje principal y las imágenes del carrusel</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`group px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 transition-all shadow-xl hover:shadow-2xl active:scale-95 ${saved
            ? 'bg-green-500 text-white animate-bounce-short'
            : 'bg-primary-900 text-white hover:bg-slate-800'
            }`}
        >
          {saving ? (
            <Loader size={20} className="animate-spin" />
          ) : saved ? (
            <CheckCircle size={20} />
          ) : (
            <Save size={20} className="group-hover:scale-110 transition-transform" />
          )}
          <span className="text-lg">{saved ? '¡Guardado con éxito!' : saving ? 'Guardando...' : 'Publicar Cambios'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        {/* Form - Left Section */}
        <div className="xl:col-span-2 space-y-8">
          {/* Logo / Identidad */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 p-8 shadow-2xl shadow-slate-200/50">
            <label className="flex items-center space-x-3 text-[10px] font-black text-primary-900/40 uppercase tracking-[0.2em] mb-6">
              <Star size={14} className="text-primary-500" />
              <span>Identidad de Marca (Logo)</span>
            </label>

            <div className="flex bg-slate-100/50 p-1 rounded-2xl mb-6">
              <button
                onClick={() => setGeneralData(prev => ({ ...prev, logo_type: 'text' }))}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${generalData.logo_type === 'text' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-400'}`}
              >
                Logo por Texto
              </button>
              <button
                onClick={() => setGeneralData(prev => ({ ...prev, logo_type: 'image' }))}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${generalData.logo_type === 'image' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-400'}`}
              >
                Logo por Imagen
              </button>
            </div>

            {generalData.logo_type === 'text' ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <span className="text-xs font-bold text-slate-400 mb-2 block">Texto del Logo</span>
                <input
                  type="text"
                  value={generalData.logo_text}
                  onChange={(e) => setGeneralData(prev => ({ ...prev, logo_text: e.target.value }))}
                  className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 transition-all font-serif italic text-xl text-primary-900"
                  placeholder="byTokio"
                />
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <span className="text-xs font-bold text-slate-400 mb-2 block">Imagen de Logo</span>
                <div className="flex items-center space-x-4">
                  {generalData.logo_url && (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 bg-white p-2">
                      <img src={generalData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex flex-col items-center justify-center py-4 px-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                      {uploadingLogo ? (
                        <Loader size={20} className="animate-spin text-primary-500" />
                      ) : (
                        <Upload size={20} className="text-slate-400 mb-1" />
                      )}
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{uploadingLogo ? 'Subiendo...' : 'Subir Imagen'}</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Fuentes del Sitio */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 p-8 shadow-2xl shadow-slate-200/50 mt-8">
            <label className="flex items-center space-x-3 text-[10px] font-black text-primary-900/40 uppercase tracking-[0.2em] mb-6">
              <Type size={14} className="text-primary-500" />
              <span>Fuentes de Sitio</span>
            </label>
            
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 mb-2 block">Fuente para Títulos</span>
                <select 
                  value={generalData.title_font || 'Playfair Display'}
                  onChange={e => setGeneralData(prev => ({...prev, title_font: e.target.value}))}
                  className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all text-slate-900 font-serif shadow-sm cursor-pointer"
                >
                  <option value="Outfit">Outfit (Sans-Serif)</option>
                  <option value="Montserrat">Montserrat (Sans-Serif)</option>
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Poppins">Poppins (Sans-Serif)</option>
                  <option value="Playfair Display">Playfair Display (Serif)</option>
                  <option value="Merriweather">Merriweather (Serif)</option>
                  <option value="Lora">Lora (Serif)</option>
                  <option value="Bebas Neue">Bebas Neue (Ornamental)</option>
                  <option value="Abril Fatface">Abril Fatface (Ornamental)</option>
                  <option value="Pacifico">Pacifico (Ornamental)</option>
                </select>
              </div>
              
              <div>
                <span className="text-xs font-bold text-slate-400 mb-2 block">Fuente para Textos / Subtítulos</span>
                <select 
                  value={generalData.body_font || 'Outfit'}
                  onChange={e => setGeneralData(prev => ({...prev, body_font: e.target.value}))}
                  className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all text-slate-900 shadow-sm cursor-pointer"
                >
                  <option value="Outfit">Outfit (Sans-Serif)</option>
                  <option value="Montserrat">Montserrat (Sans-Serif)</option>
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Poppins">Poppins (Sans-Serif)</option>
                  <option value="Playfair Display">Playfair Display (Serif)</option>
                  <option value="Merriweather">Merriweather (Serif)</option>
                  <option value="Lora">Lora (Serif)</option>
                  <option value="Bebas Neue">Bebas Neue (Ornamental)</option>
                  <option value="Abril Fatface">Abril Fatface (Ornamental)</option>
                  <option value="Pacifico">Pacifico (Ornamental)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Título principal */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 p-8 shadow-2xl shadow-slate-200/50 mt-8">
            <label className="flex items-center space-x-3 text-[10px] font-black text-primary-900/40 uppercase tracking-[0.2em] mb-4">
              <AlignLeft size={14} className="text-primary-500" />
              <span>Contenido Textual</span>
            </label>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 mb-2 block">Título de Impacto</span>
                <input
                  type="text"
                  value={heroData.title}
                  onChange={(e) => setHeroData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all text-slate-900 text-xl font-serif"
                  placeholder="Tu santuario de desconexión"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 mb-2 block">Descripción / Bajada</span>
                <textarea
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData(prev => ({ ...prev, subtitle: e.target.value }))}
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all text-slate-900 text-lg leading-relaxed resize-none"
                  placeholder="Técnicas terapéuticas personalizadas..."
                />
              </div>
            </div>
          </div>

          {/* Botones CTA */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 p-8 shadow-2xl shadow-slate-200/50 mt-8">
            <label className="flex items-center space-x-3 text-[10px] font-black text-primary-900/40 uppercase tracking-[0.2em] mb-4">
              <MousePointerClick size={14} className="text-primary-500" />
              <span>Llamados a la Acción</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-50/30 p-4 rounded-2xl border border-primary-100/50">
                <span className="text-[10px] text-primary-600/60 uppercase tracking-widest font-black mb-2 block">Botón Principal</span>
                <input
                  type="text"
                  value={heroData.cta_text}
                  onChange={(e) => setHeroData(prev => ({ ...prev, cta_text: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-primary-100 rounded-xl focus:outline-none focus:border-primary-500 transition-all text-slate-900"
                  placeholder="Reservar ahora"
                />
              </div>
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2 block">Botón Secundario</span>
                <input
                  type="text"
                  value={heroData.cta2_text}
                  onChange={(e) => setHeroData(prev => ({ ...prev, cta2_text: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-primary-500 transition-all text-slate-900"
                  placeholder="Ver más"
                />
              </div>
            </div>
          </div>

          {/* Imágenes de fondo - Carrusel */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 p-8 shadow-2xl shadow-slate-200/50 mt-8">
            <label className="flex items-center justify-between mb-6">
              <span className="flex items-center space-x-3 text-[10px] font-black text-primary-900/40 uppercase tracking-[0.2em]">
                <Image size={14} className="text-primary-500" />
                <span>Galería del Carrusel</span>
              </span>
              <div className="flex items-center space-x-2 bg-primary-100/50 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-[10px] text-primary-700 font-bold uppercase tracking-wider">
                  {heroData.bg_images.length} Archivo{heroData.bg_images.length !== 1 ? 's' : ''}
                </span>
              </div>
            </label>

            {/* Upload button */}
            <label className={`group flex flex-col items-center justify-center space-y-3 px-6 py-10 rounded-[2rem] border-2 border-dashed cursor-pointer transition-all mb-8 bg-slate-50/30 ${uploading ? 'border-primary-300 bg-primary-50 animate-pulse' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50/30'
              }`}>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${uploading ? 'bg-primary-500 text-white' : 'bg-white text-slate-400 group-hover:bg-primary-500 group-hover:text-white shadow-sm'
                }`}>
                {uploading ? (
                  <Loader size={24} className="animate-spin" />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              <div className="text-center">
                <span className="text-sm text-slate-800 font-bold block">
                  {uploading ? 'Subiendo archivos...' : 'Agregar imágenes a la portada'}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">Selección múltiple permitida (JPG, PNG, WEBP)</span>
              </div>
            </label>

            {/* Image list */}
            {heroData.bg_images.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {heroData.bg_images.map((url, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 bg-white border border-slate-100 rounded-2xl p-3 group transition-all hover:shadow-lg hover:border-primary-100 ${index === previewIndex ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                      }`}
                  >
                    <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setPreviewIndex(index)}>
                      <img src={url} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                      {index === previewIndex && (
                        <div className="absolute inset-0 bg-primary-500/20 backdrop-blur-[1px] flex items-center justify-center">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-700 block truncate">Imagen {index + 1}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">Fondo de Portada</span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        disabled={index === 0}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-20 rounded-lg transition-all"
                        title="Mover arriba"
                      >
                        <ChevronLeft size={16} className="rotate-90" />
                      </button>
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        disabled={index === heroData.bg_images.length - 1}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-20 rounded-lg transition-all"
                        title="Mover abajo"
                      >
                        <ChevronRight size={16} className="rotate-90" />
                      </button>
                      <button
                        onClick={() => removeImage(index)}
                        className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-1"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview - Right Section */}
        <div className="xl:col-span-3">
          <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl sticky top-8 border-8 border-slate-800">
            {/* Browser Header Decor */}
            <div className="px-8 py-4 bg-slate-800 flex items-center justify-between border-b border-slate-700/50">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="bg-slate-900/50 px-4 py-1.5 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-widest border border-slate-700/50">
                Vista Previa en Vivo
              </div>
              <div className="w-12 h-3" /> {/* Spacer */}
            </div>

            <div className="relative aspect-video xl:aspect-auto xl:h-[700px] flex items-center overflow-hidden">
              {/* Carrusel en preview */}
              {heroData.bg_images.length > 0 ? (
                heroData.bg_images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
                    style={{
                      opacity: i === previewIndex ? 1 : 0,
                      transform: `scale(${i === previewIndex ? 1 : 1.1})`
                    }}
                  />
                ))
              ) : (
                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                  <Image size={64} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">Sin imágenes de fondo</p>
                </div>
              )}

              {heroData.bg_images.length > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              )}

              <div className="relative z-10 px-12 md:px-20 py-20 w-full text-center">
                <div className="max-w-4xl mx-auto">
                  <h1 className={`text-5xl md:text-7xl font-serif mb-6 leading-tight transition-all duration-500 ${heroData.bg_images.length > 0 ? 'text-white' : 'text-slate-800'}`}>
                    {heroData.title || 'Título Principal de Ejemplo'}
                  </h1>
                  <p className={`text-lg md:text-xl mb-10 font-light max-w-2xl mx-auto transition-all duration-500 leading-relaxed ${heroData.bg_images.length > 0 ? 'text-white/80' : 'text-slate-500'}`}>
                    {heroData.subtitle || 'Esta es una vista previa de cómo se verá tu mensaje en la página principal.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <div className="px-8 py-4 bg-primary-600 text-white rounded-2xl text-sm font-bold shadow-xl border border-primary-500">
                      {heroData.cta_text || 'Botón Principal'}
                    </div>
                    <div className={`px-8 py-4 rounded-2xl text-sm font-bold backdrop-blur-md border ${heroData.bg_images.length > 0 ? 'bg-white/10 border-white/30 text-white' : 'border-slate-200 text-slate-800'
                      }`}>
                      {heroData.cta2_text || 'Botón Secundario'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicator dots for Preview */}
              {heroData.bg_images.length > 1 && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3 z-20">
                  {heroData.bg_images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${i === previewIndex ? 'w-10 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;
