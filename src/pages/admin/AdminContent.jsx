import React, { useState, useEffect } from 'react';
import { siteContentService, CONTENT_DEFAULTS } from '../../services/siteContentService';
import { Save, Image as ImageIcon, Type, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = [
  {
    label: 'Hero Section',
    icon: <Layout className="w-5 h-5" />,
    fields: [
      { key: 'hero.badge',        label: 'Badge Text',           type: 'text' },
      { key: 'hero.headline1',    label: 'Headline Line 1',      type: 'text' },
      { key: 'hero.headline2',    label: 'Headline Line 2',      type: 'text' },
      { key: 'hero.subtext',      label: 'Sub-text',             type: 'textarea' },
      { key: 'hero.image',        label: 'Hero Image URL',       type: 'image' },
      { key: 'hero.float_image1', label: 'Float Image 1 (Rose)', type: 'image' },
      { key: 'hero.float_image2', label: 'Float Image 2 (Charm)',type: 'image' },
    ],
  },
  {
    label: 'Category Cards',
    icon: <Image className="w-5 h-5" />,
    fields: [
      { key: 'category.bouquets.image',  label: 'Bouquets Card Image', type: 'image' },
      { key: 'category.bouquets.title',  label: 'Bouquets Title',      type: 'text' },
      { key: 'category.bouquets.desc',   label: 'Bouquets Description',type: 'textarea' },
      { key: 'category.keychains.image', label: 'Keychains Card Image',type: 'image' },
      { key: 'category.keychains.title', label: 'Keychains Title',     type: 'text' },
      { key: 'category.keychains.desc',  label: 'Keychains Description',type: 'textarea' },
    ],
  },
  {
    label: 'Newsletter Section',
    icon: <Mail className="w-5 h-5" />,
    fields: [
      { key: 'newsletter.headline', label: 'Headline', type: 'text' },
      { key: 'newsletter.subtext',  label: 'Sub-text', type: 'textarea' },
    ],
  },
  {
    label: 'Trust Bar',
    icon: <Shield className="w-5 h-5" />,
    fields: [
      { key: 'trust.1.emoji', label: 'Trust 1 Emoji', type: 'text' },
      { key: 'trust.1.text',  label: 'Trust 1 Text',  type: 'text' },
      { key: 'trust.2.emoji', label: 'Trust 2 Emoji', type: 'text' },
      { key: 'trust.2.text',  label: 'Trust 2 Text',  type: 'text' },
      { key: 'trust.3.emoji', label: 'Trust 3 Emoji', type: 'text' },
      { key: 'trust.3.text',  label: 'Trust 3 Text',  type: 'text' },
      { key: 'trust.4.emoji', label: 'Trust 4 Emoji', type: 'text' },
      { key: 'trust.4.text',  label: 'Trust 4 Text',  type: 'text' },
    ],
  },
  {
    label: 'About Page',
    icon: <FileText className="w-5 h-5" />,
    fields: [
      { key: 'about.hero.image',       label: 'About Hero Image',      type: 'image' },
      { key: 'about.philosophy.image', label: 'Philosophy Section Image',type: 'image' },
      { key: 'about.founder.photo',    label: 'Founder Photo URL',     type: 'image' },
      { key: 'about.founder.name',     label: 'Founder Name / Title',  type: 'text' },
      { key: 'about.founder.quote',    label: 'Founder Quote',         type: 'textarea' },
      { key: 'about.stat1.value',      label: 'Stat 1 Value',          type: 'text' },
      { key: 'about.stat1.label',      label: 'Stat 1 Label',          type: 'text' },
      { key: 'about.stat2.value',      label: 'Stat 2 Value',          type: 'text' },
      { key: 'about.stat2.label',      label: 'Stat 2 Label',          type: 'text' },
    ],
  },
];

import { Layout, Image, Mail, Shield } from 'lucide-react';

export default function AdminContent() {
  const [content, setContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    siteContentService.getAll().then(data => {
      setContent(data);
      setIsLoading(false);
    });
  }, []);

  const handleChange = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = async (section) => {
    setSaving(section.label);
    try {
      const updates = {};
      section.fields.forEach(f => { updates[f.key] = content[f.key] ?? CONTENT_DEFAULTS[f.key] ?? ''; });
      await siteContentService.setMany(updates);
      toast.success(`"${section.label}" saved!`);
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage-green"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-gray-800">Site Content Manager</h1>
        <p className="text-gray-500 mt-2">Edit every image and text displayed on your website. Changes are live instantly.</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map(section => (
          <div key={section.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-sage-green">
                  {section.icon}
                </div>
                <h2 className="text-lg font-bold text-gray-800">{section.label}</h2>
              </div>
              <button
                onClick={() => handleSaveSection(section)}
                disabled={saving === section.label}
                className="flex items-center gap-2 bg-sage-green text-white px-5 py-2.5 rounded-xl font-medium hover:bg-sage-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving === section.label ? 'Saving...' : 'Save Section'}
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields.map(field => (
                <div key={field.key} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2">
                      {field.type === 'image' ? <ImageIcon className="w-4 h-4 text-gray-400" /> : <Type className="w-4 h-4 text-gray-400" />}
                      {field.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">{field.key}</span>
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={content[field.key] ?? ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={CONTENT_DEFAULTS[field.key] ?? ''}
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-green/20 focus:border-sage-green transition-all resize-y"
                    />
                  ) : (
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={content[field.key] ?? ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={CONTENT_DEFAULTS[field.key] ?? ''}
                        className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-green/20 focus:border-sage-green transition-all"
                      />
                      {field.type === 'image' && content[field.key] && (
                        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-50">
                          <img 
                            src={content[field.key]} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                            onError={e => e.target.style.display='none'} 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
