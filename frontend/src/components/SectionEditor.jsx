import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader, CheckCircle } from 'lucide-react';

const SectionEditor = ({ sectionName, defaultTitle, defaultSubtitle }) => {
  const [data, setData] = useState({
    title: defaultTitle || '',
    subtitle: defaultSubtitle || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await supabase
          .from('site_settings')
          .select('content')
          .eq('section', sectionName)
          .single();
        
        if (res?.content) {
          setData({
            title: res.content.title || defaultTitle || '',
            subtitle: res.content.subtitle || defaultSubtitle || ''
          });
        }
      } catch (err) {
        // Ignorar error si no existe aún
      }
    };
    fetchData();
  }, [sectionName, defaultTitle, defaultSubtitle]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          section: sectionName,
          content: data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section' });

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error guardando: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200 p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-6 items-end">
      <div className="flex-1 w-full relative">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
          Título en la Web
        </label>
        <input 
          type="text" 
          value={data.title}
          onChange={e => setData(prev => ({...prev, title: e.target.value}))}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-400 font-serif text-lg text-slate-800"
          placeholder={defaultTitle}
        />
      </div>
      <div className="flex-1 w-full relative">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
          Subtítulo en la Web
        </label>
        <input 
          type="text" 
          value={data.subtitle}
          onChange={e => setData(prev => ({...prev, subtitle: e.target.value}))}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-400 text-sm text-slate-600"
          placeholder={defaultSubtitle}
        />
      </div>
      <button 
        onClick={handleSave}
        disabled={saving}
        className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
          saved ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
        }`}
      >
        {saving ? <Loader size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
        <span>{saved ? 'Guardado' : 'Guardar Textos'}</span>
      </button>
    </div>
  );
};

export default SectionEditor;
