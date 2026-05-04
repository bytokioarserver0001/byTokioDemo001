import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Image, Type, AlignLeft, MousePointerClick, Upload, CheckCircle, Loader, Trash2, ChevronLeft, ChevronRight, Star, ChevronDown, Rocket } from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'Outfit', label: 'Outfit', type: 'Sans-Serif' },
  { value: 'Montserrat', label: 'Montserrat', type: 'Sans-Serif' },
  { value: 'Inter', label: 'Inter', type: 'Sans-Serif' },
  { value: 'Poppins', label: 'Poppins', type: 'Sans-Serif' },
  { value: 'Playfair Display', label: 'Playfair Display', type: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', type: 'Serif' },
  { value: 'Lora', label: 'Lora', type: 'Serif' },
  { value: 'Bebas Neue', label: 'Bebas Neue', type: 'Ornamental' },
  { value: 'Abril Fatface', label: 'Abril Fatface', type: 'Ornamental' },
  { value: 'Pacifico', label: 'Pacifico', type: 'Ornamental' }
];

const FontPicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = () => setIsOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <span className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest ml-1">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-slate-900 shadow-sm cursor-pointer min-h-[60px]"
        style={{ fontFamily: value }}
      >
        <span className="text-lg">{value}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="max-h-80 overflow-y-auto custom-scrollbar py-2">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group ${value === opt.value ? 'bg-slate-50 text-black' : 'text-slate-600'}`}
              >
                <span className="text-lg" style={{ fontFamily: opt.value }}>{opt.label}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-colors ${
                    opt.type === 'Serif' ? 'bg-amber-50 text-amber-600' : 
                    opt.type === 'Sans-Serif' ? 'bg-blue-50 text-blue-600' : 
                    'bg-purple-50 text-purple-600'
                }`}>
                  {opt.type}
                </span>
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
        <div><h2 className="text-3xl font-serif text-slate-900 leading-tight">Configuración de Portada</h2><p className="text-slate-400 mt-1 italic font-medium">Gestiona el estilo y mensaje principal de tu sitio.</p></div>
        <button onClick={handleSave} disabled={saving} className={`px-10 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${saved ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-slate-800'}`}>
          {saving ? <Loader size={20} className="animate-spin" /> : saved ? <CheckCircle size={20} /> : <Rocket size={20} />}
          <span>{saved ? 'Cambios Publicados' : saving ? 'Publicando...' : 'Publicar Cambios'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl">
             <label className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8"><Star size={14} className="text-amber-400" /><span>Identidad Visual</span></label>
             <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                <button onClick={() => setGeneralData(prev => ({ ...prev, logo_type: 'text' }))} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${generalData.logo_type === 'text' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}>Nombre</button>
                <button onClick={() => setGeneralData(prev => ({ ...prev, logo_type: 'image' }))} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${generalData.logo_type === 'image' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}>Logo</button>
             </div>
             {generalData.logo_type === 'text' ? (
                <div className="space-y-3"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Logo por Texto</label><input type="text" value={generalData.logo_text} onChange={(e) => setGeneralData(prev => ({ ...prev, logo_text: e.target.value }))} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-serif italic text-2xl text-slate-900 shadow-inner" /></div>
             ) : (
                <div className="flex items-center space-x-6">
                   {generalData.logo_url && <div className="w-24 h-24 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100 shadow-inner"><img src={generalData.logo_url} className="w-full h-full object-contain" /></div>}
                   <label className="flex-1 cursor-pointer"><div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-3xl hover:bg-slate-50 transition-all">{uploadingLogo ? <Loader size={20} className="animate-spin" /> : <Upload size={20} className="text-slate-400" />}<span className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">Cambiar Logo</span><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></div></label>
                </div>
             )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl">
             <label className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8"><Type size={14} className="text-primary-500" /><span>Fuentes Disponibles (10)</span></label>
             <div className="space-y-8">
                <FontPicker label="Títulos y Encabezados" value={generalData.title_font} onChange={v => setGeneralData(p => ({ ...p, title_font: v }))} />
                <FontPicker label="Cuerpo y Descripciones" value={generalData.body_font} onChange={v => setGeneralData(p => ({ ...p, body_font: v }))} />
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl">
             <label className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8"><AlignLeft size={14} className="text-primary-500" /><span>Contenido del Hero</span></label>
             <div className="space-y-6">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block">Título de Portada</label><textarea value={heroData.title} onChange={(e) => setHeroData(prev => ({ ...prev, title: e.target.value }))} rows={2} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-black/5 font-serif text-xl resize-none shadow-inner" /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block">Descripción Detallada</label><textarea value={heroData.subtitle} onChange={(e) => setHeroData(prev => ({ ...prev, subtitle: e.target.value }))} rows={4} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-black/5 text-slate-700 resize-none shadow-inner text-sm leading-relaxed" /></div>
             </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl">
              <label className="flex items-center justify-between mb-10 px-2">
                 <span className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Image size={14} className="text-primary-500" /><span>Carrusel de Imágenes</span></span>
                 <span className="text-[9px] font-black text-slate-400 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">{heroData.bg_images.length} ARCHIVOS ACTIVOS</span>
              </label>
              <label className={`flex flex-col items-center justify-center p-14 border-2 border-dashed rounded-[3.5rem] transition-all cursor-pointer mb-10 ${uploading ? 'bg-slate-50 border-slate-400 animate-pulse' : 'bg-slate-50/30 border-slate-200 hover:bg-slate-100 hover:border-slate-400'}`}>
                 <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-5 shadow-sm">{uploading ? <Loader className="animate-spin text-black" /> : <Upload className="text-slate-400" size={32} />}</div>
                 <span className="text-[10px] font-black uppercase text-slate-900 tracking-[0.2em]">{uploading ? 'Subiendo contenido...' : 'Haz click para añadir imágenes'}</span>
                 <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                 {heroData.bg_images.map((url, i) => (
                    <div key={i} className={`relative aspect-video rounded-[2.5rem] overflow-hidden group border-4 transition-all duration-500 ${i === previewIndex ? 'border-black shadow-2xl ring-8 ring-black/5' : 'border-transparent shadow-md'}`}>
                       <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-3">
                          <button onClick={() => moveImage(i, i - 1)} disabled={i === 0} className="p-4 bg-white/20 hover:bg-white rounded-2xl text-white hover:text-black transition-all active:scale-90"><ChevronLeft size={20} /></button>
                          <button onClick={() => setHeroData(prev => ({ ...prev, bg_images: prev.bg_images.filter((_, idx) => idx !== i) }))} className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all active:scale-90"><Trash2 size={20} /></button>
                          <button onClick={() => moveImage(i, i + 1)} disabled={i === heroData.bg_images.length - 1} className="p-4 bg-white/20 hover:bg-white rounded-2xl text-white hover:text-black transition-all active:scale-90"><ChevronRight size={20}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-slate-900 rounded-[4.5rem] overflow-hidden shadow-2xl border-[16px] border-slate-800 relative">
              <div className="h-6 bg-slate-800 flex items-center px-8 space-x-2"><div className="w-2 h-2 rounded-full bg-red-500/50" /><div className="w-2 h-2 rounded-full bg-amber-500/50" /><div className="w-2 h-2 rounded-full bg-emerald-500/50" /></div>
              <div className="relative aspect-video flex items-center justify-center overflow-hidden bg-slate-800">
                 {heroData.bg_images.length > 0 ? (
                   <div className="absolute inset-0 transition-all duration-1000">
                      <img src={heroData.bg_images[previewIndex]} className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 blur-[2px]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />
                   </div>
                 ) : null}
                 <div className="relative z-10 p-16 text-center max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight drop-shadow-2xl">{heroData.title || 'Título de Portada'}</h1>
                    <p className="text-base text-white/60 font-light leading-relaxed drop-shadow-lg">{heroData.subtitle || 'Escribe aquí tu mensaje de bienvenida...'}</p>
                 </div>
                 {heroData.bg_images.length > 1 && (
                   <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                      {heroData.bg_images.map((_, dotIdx) => (
                        <div key={dotIdx} className={`h-1 rounded-full transition-all duration-500 ${dotIdx === previewIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
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
