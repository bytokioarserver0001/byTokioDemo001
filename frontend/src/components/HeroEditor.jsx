import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Image, Type, AlignLeft, MousePointerClick, Upload, CheckCircle, Loader, Trash2, ChevronLeft, ChevronRight, Star, ChevronDown, Rocket } from 'lucide-react';

const FontPicker = ({ value, onChange, label, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = () => setIsOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <span className="text-xs font-bold text-slate-400 mb-2 block">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all text-slate-900 shadow-sm cursor-pointer min-h-[60px]"
        style={{ fontFamily: value }}
      >
        <span className="text-lg">{value}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="max-h-64 overflow-y-auto custom-scrollbar py-2 text-sm">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between ${value === opt.value ? 'bg-slate-50 text-black font-bold' : 'text-slate-600'}`}
                style={{ fontFamily: opt.style || opt.value }}
              >
                <span className="text-base">{opt.label}</span>
                {value === opt.value && <CheckCircle size={14} className="text-slate-900" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const HeroEditor = () => {
  const [heroData, setHeroData] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta2_text: '',
    bg_images: []
  });
  const [generalData, setGeneralData] = useState({
    logo_type: 'text',
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

  const fetchData = async () => {
    try {
      const { data: hero } = await supabase.from('site_settings').select('content').eq('section', 'hero').single();
      const { data: gen } = await supabase.from('site_settings').select('content').eq('section', 'general').single();

      if (hero?.content) {
        setHeroData({
          title: hero.content.title || '',
          subtitle: hero.content.subtitle || '',
          cta_text: hero.content.cta_text || '',
          cta2_text: hero.content.cta2_text || '',
          bg_images: hero.content.bg_images || []
        });
      }
      if (gen?.content) {
        setGeneralData({
          logo_type: gen.content.logo_type || 'text',
          logo_text: gen.content.logo_text || '',
          logo_url: gen.content.logo_url || '',
          title_font: gen.content.title_font || 'Playfair Display',
          body_font: gen.content.body_font || 'Outfit'
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (heroData.bg_images.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % heroData.bg_images.length);
    }, 4000);
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
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `hero/${fileName}`;
        const { error } = await supabase.storage.from('product-images').upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        newUrls.push(publicUrl);
      }
      setHeroData(prev => ({ ...prev, bg_images: [...prev.bg_images, ...newUrls] }));
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `brand/${fileName}`;
      const { error } = await supabase.storage.from('product-images').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setGeneralData(prev => ({ ...prev, logo_url: publicUrl, logo_type: 'image' }));
    } catch (err) { alert(err.message); } finally { setUploadingLogo(false); }
  };

  const moveImage = (from, to) => {
    if (to < 0 || to >= heroData.bg_images.length) return;
    const imgs = [...heroData.bg_images];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    setHeroData(prev => ({ ...prev, bg_images: imgs }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await supabase.from('site_settings').upsert({ section: 'hero', content: heroData }, { onConflict: 'section' });
      await supabase.from('site_settings').upsert({ section: 'general', content: generalData }, { onConflict: 'section' });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="animate-in fade-in duration-700 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div><h2 className="text-3xl font-serif text-slate-900 leading-tight">Configuración de Portada</h2><p className="text-slate-400 mt-1 italic">Personaliza la primera impresión de tu sitio wellness</p></div>
        <button onClick={handleSave} disabled={saving} className={`px-8 py-5 rounded-[2rem] font-bold flex items-center space-x-3 shadow-2xl transition-all active:scale-95 ${saved ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-slate-800'}`}>
          {saving ? <Loader size={20} className="animate-spin" /> : saved ? <CheckCircle size={20} /> : <Rocket size={20} />}
          <span className="text-sm uppercase tracking-widest">{saved ? '¡Publicado!' : saving ? 'Publicando...' : 'Publicar Cambios'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl">
             <label className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8"><Star size={14} className="text-amber-400" /><span>Identidad de Marca</span></label>
             <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                <button onClick={() => setGeneralData(prev => ({ ...prev, logo_type: 'text' }))} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${generalData.logo_type === 'text' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}>Texto</button>
                <button onClick={() => setGeneralData(prev => ({ ...prev, logo_type: 'image' }))} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${generalData.logo_type === 'image' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}>Logo</button>
             </div>
             {generalData.logo_type === 'text' ? (
                <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Nombre de la Marca</label><input type="text" value={generalData.logo_text} onChange={(e) => setGeneralData(prev => ({ ...prev, logo_text: e.target.value }))} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-serif italic text-2xl text-slate-900" /></div>
             ) : (
                <div className="flex items-center space-x-6">
                   {generalData.logo_url && <div className="w-20 h-20 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100"><img src={generalData.logo_url} className="w-full h-full object-contain" /></div>}
                   <label className="flex-1 cursor-pointer"><div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">{uploadingLogo ? <Loader size={20} className="animate-spin" /> : <Upload size={20} className="text-slate-400" />}<span className="text-[9px] font-black text-slate-400 mt-2">SUBIR IMAGEN</span><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></div></label>
                </div>
             )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl">
             <label className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8"><Type size={14} className="text-primary-500" /><span>Tipografía del Sitio</span></label>
             <div className="space-y-6">
                <FontPicker label="Fuente Primaria (Títulos)" value={generalData.title_font} onChange={v => setGeneralData(p => ({ ...p, title_font: v }))} options={[{ value: 'Outfit', label: 'Outfit' }, { value: 'Playfair Display', label: 'Playfair Display' }, { value: 'Montserrat', label: 'Montserrat' }, { value: 'Merriweather', label: 'Merriweather' }, { value: 'Bebas Neue', label: 'Bebas Neue' }]} />
                <FontPicker label="Fuente Secundaria (Cuerpo)" value={generalData.body_font} onChange={v => setGeneralData(p => ({ ...p, body_font: v }))} options={[{ value: 'Outfit', label: 'Outfit' }, { value: 'Inter', label: 'Inter' }, { value: 'Poppins', label: 'Poppins' }, { value: 'Lora', label: 'Lora' }]} />
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl">
             <label className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8"><AlignLeft size={14} className="text-primary-500" /><span>Textos de Portada</span></label>
             <div className="space-y-6">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-2 block">Título de Bienvenida</label><input type="text" value={heroData.title} onChange={(e) => setHeroData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-black/5 font-serif text-xl" /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-2 block">Descripción Detallada</label><textarea value={heroData.subtitle} onChange={(e) => setHeroData(prev => ({ ...prev, subtitle: e.target.value }))} rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-black/5 text-slate-700 resize-none" /></div>
             </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-8">
           <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl">
              <label className="flex items-center justify-between mb-8 px-4">
                 <span className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Image size={14} className="text-primary-500" /><span>Galería del Carrusel</span></span>
                 <span className="text-[9px] font-black text-slate-400 px-4 py-2 bg-slate-50 rounded-full">{heroData.bg_images.length} ARCHIVOS</span>
              </label>
              <label className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[3rem] transition-all cursor-pointer mb-8 ${uploading ? 'bg-slate-50 animate-pulse' : 'hover:bg-slate-50 hover:border-slate-400'}`}>
                 <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">{uploading ? <Loader className="animate-spin" /> : <Upload className="text-slate-400" />}</div>
                 <span className="text-xs font-black uppercase text-slate-900 tracking-widest">{uploading ? 'Subiendo...' : 'Añadir imágenes a la galería'}</span>
                 <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {heroData.bg_images.map((url, i) => (
                    <div key={i} className={`relative aspect-video rounded-[2rem] overflow-hidden group border-4 transition-all ${i === previewIndex ? 'border-black shadow-xl ring-8 ring-black/5' : 'border-transparent shadow-sm'}`}>
                       <img src={url} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-2">
                          <button onClick={() => moveImage(i, i - 1)} disabled={i === 0} className="p-3 bg-white/20 hover:bg-white rounded-2xl text-white hover:text-black transition-all"><ChevronLeft size={16} /></button>
                          <button onClick={() => setHeroData(prev => ({ ...prev, bg_images: prev.bg_images.filter((_, idx) => idx !== i) }))} className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all"><Trash2 size={16} /></button>
                          <button onClick={() => moveImage(i, i + 1)} disabled={i === heroData.bg_images.length - 1} className="p-3 bg-white/20 hover:bg-white rounded-2xl text-white hover:text-black transition-all"><ChevronRight size={16}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-slate-800">
              <div className="h-4 bg-slate-800" />
              <div className="relative aspect-video flex items-center justify-center overflow-hidden">
                 {heroData.bg_images.length > 0 ? <img src={heroData.bg_images[previewIndex]} className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" /> : <div className="absolute inset-0 bg-slate-800" />}
                 <div className="relative z-10 p-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">{heroData.title || 'Título de Portada'}</h1>
                    <p className="text-lg text-white/70 max-w-xl mx-auto font-light leading-relaxed">{heroData.subtitle || 'Descripción breve...'}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;
