import React, { useState } from 'react';
import { AppState, Dish, MenuSection, ThemeType } from '../types';
import { DIETARY_TAGS } from '../constants';
import { enhanceDishDescription, generateMenuSuggestions, generateFullTheme } from '../services/geminiService';
import { PlusIcon, TrashIcon, SparklesIcon, PhotoIcon, ArrowPathIcon, QrCodeIcon, ShareIcon } from '@heroicons/react/24/outline';

interface MenuEditorProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const MenuEditor: React.FC<MenuEditorProps> = ({ state, setState }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'design' | 'share'>('details');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [customColors, setCustomColors] = useState('');
  const [customFonts, setCustomFonts] = useState('');

  // Handlers for Info
  const handleInfoChange = (field: keyof AppState['info'], value: string) => {
    setState(prev => ({ ...prev, info: { ...prev.info, [field]: value } }));
  };

  // Handlers for Sections
  const addSection = () => {
    const newSection: MenuSection = {
      id: Date.now().toString(),
      title: 'New Section',
      items: []
    };
    setState(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const removeSection = (id: string) => {
    setState(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
  };

  const updateSectionTitle = (id: string, title: string) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, title } : s)
    }));
  };

  // Handlers for Dishes
  const addDish = (sectionId: string) => {
    const newDish: Dish = {
      id: Date.now().toString(),
      name: 'New Dish',
      description: 'Description...',
      price: '$0',
      ingredients: '',
      dietaryTags: [],
      dietaryNote: '',
      image: undefined
    };
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, items: [...s.items, newDish] } : s
      )
    }));
  };

  const updateDish = (sectionId: string, dishId: string, field: keyof Dish, value: any) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? {
          ...s,
          items: s.items.map(d => d.id === dishId ? { ...d, [field]: value } : d)
        } : s
      )
    }));
  };

  const handleImageUpload = (sectionId: string, dishId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        updateDish(sectionId, dishId, 'image', reader.result as string);
    };
    if (file) {
        reader.readAsDataURL(file);
    }
  };

  const toggleDishTag = (sectionId: string, dishId: string, tagId: string) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? {
          ...s,
          items: s.items.map(d => {
            if (d.id !== dishId) return d;
            const currentTags = d.dietaryTags || [];
            const newTags = currentTags.includes(tagId) 
              ? currentTags.filter(t => t !== tagId)
              : [...currentTags, tagId];
            return { ...d, dietaryTags: newTags };
          })
        } : s
      )
    }));
  };

  const removeDish = (sectionId: string, dishId: string) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, items: s.items.filter(d => d.id !== dishId) } : s
      )
    }));
  };

  // AI Actions
  const handleEnhanceDish = async (sectionId: string, dishId: string, name: string, currentDesc: string, ingredients?: string) => {
    setLoading(true);
    try {
      const newDesc = await enhanceDishDescription(name, currentDesc, ingredients);
      updateDish(sectionId, dishId, 'description', newDesc);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const result = await generateMenuSuggestions(state.info.name, state.info.tagline || 'General');
      if (result && result.sections) {
        // Map to our structure
        const newSections: MenuSection[] = result.sections.map((s: any, idx: number) => ({
          id: `gen-s-${idx}`,
          title: s.title,
          items: s.items.map((d: any, dIdx: number) => ({
            id: `gen-d-${idx}-${dIdx}`,
            name: d.name,
            description: d.description,
            price: d.price,
            highlight: false,
            ingredients: '',
            dietaryTags: [],
            dietaryNote: ''
          }))
        }));
        setState(prev => ({ ...prev, sections: newSections }));
      }
    } catch (e) {
      alert("Failed to generate menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTheme = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const themeData = await generateFullTheme(prompt, customColors, customFonts);
      setState(prev => ({
        ...prev,
        theme: {
          ...prev.theme,
          type: ThemeType.CUSTOM_AI,
          backgroundImage: themeData.backgroundImage,
          backgroundColor: themeData.backgroundColor,
          textColor: themeData.textColor,
          headingFont: themeData.headingFont,
          bodyFont: themeData.bodyFont,
          generatedPrompt: prompt
        }
      }));
    } catch (e) {
      alert("Failed to generate theme. Ensure you have selected a key.");
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (type: ThemeType) => {
    let newTheme = { ...state.theme, type, backgroundImage: undefined };
    switch (type) {
        case ThemeType.CLASSIC:
            newTheme = { ...newTheme, textColor: '#1e293b', backgroundColor: '#ffffff', headingFont: 'font-serif', bodyFont: 'font-sans' };
            break;
        case ThemeType.MODERN:
            newTheme = { ...newTheme, textColor: '#0f172a', backgroundColor: '#f8fafc', headingFont: 'font-sans', bodyFont: 'font-sans' };
            break;
        case ThemeType.RUSTIC:
            newTheme = { ...newTheme, textColor: '#422006', backgroundColor: '#fef3c7', headingFont: 'font-serif', bodyFont: 'font-serif' };
            break;
        case ThemeType.MIDNIGHT:
            newTheme = { ...newTheme, textColor: '#f1f5f9', backgroundColor: '#0f172a', headingFont: 'font-sans', bodyFont: 'font-sans' };
            break;
        case ThemeType.JAZZ:
            newTheme = { ...newTheme, textColor: '#fbbf24', backgroundColor: '#1c1917', headingFont: 'font-serif', bodyFont: 'font-serif' };
            break;
        case ThemeType.OCEAN:
            newTheme = { ...newTheme, textColor: '#164e63', backgroundColor: '#ecfeff', headingFont: 'font-sans', bodyFont: 'font-serif' };
            break;
        default:
            break;
    }
    setState(prev => ({ ...prev, theme: newTheme }));
  };

  const handleDownloadQr = async () => {
     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(state.info.websiteUrl || '')}`;
     try {
       const response = await fetch(qrUrl);
       const blob = await response.blob();
       const downloadUrl = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = downloadUrl;
       link.download = 'menu-qr.png';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     } catch (e) {
       alert("Could not download QR code");
     }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl border-r border-slate-200">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {['details', 'items', 'design', 'share'].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={`flex-1 py-4 text-xs sm:text-sm font-semibold capitalize ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
           >
             {tab}
           </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'details' && (
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700">Restaurant Name</label>
              <input 
                type="text" 
                value={state.info.name} 
                onChange={(e) => handleInfoChange('name', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tagline / Cuisine</label>
              <input 
                type="text" 
                value={state.info.tagline} 
                onChange={(e) => handleInfoChange('tagline', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Contact Info</label>
              <input 
                type="text" 
                value={state.info.contact} 
                onChange={(e) => handleInfoChange('contact', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
               <button
                 onClick={handleGenerateSuggestions}
                 disabled={loading}
                 className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-violet-700 hover:to-indigo-700 transition disabled:opacity-50"
               >
                 <SparklesIcon className="w-5 h-5" />
                 <span>{loading ? 'Thinking...' : 'Auto-Generate Menu'}</span>
               </button>
               <p className="text-xs text-slate-500 mt-2 text-center">Uses current name & tagline to suggest dishes.</p>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            {state.sections.map((section) => (
              <div key={section.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <input 
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    className="bg-transparent font-bold text-lg text-slate-800 focus:outline-none border-b border-transparent focus:border-primary"
                  />
                  <button onClick={() => removeSection(section.id)} className="text-red-400 hover:text-red-600">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {section.items.map((dish) => (
                    <div key={dish.id} className="bg-white p-3 rounded shadow-sm border border-slate-100">
                      <div className="flex justify-between mb-2 gap-2">
                         <input 
                            placeholder="Dish Name"
                            value={dish.name}
                            onChange={(e) => updateDish(section.id, dish.id, 'name', e.target.value)}
                            className="font-medium text-slate-800 w-full focus:outline-none focus:text-primary"
                          />
                          <input 
                            placeholder="Price"
                            value={dish.price}
                            onChange={(e) => updateDish(section.id, dish.id, 'price', e.target.value)}
                            className="text-right w-20 font-semibold text-slate-800 focus:outline-none"
                          />
                      </div>
                      
                      {/* Ingredients & Desc */}
                      <div className="space-y-2 mb-3">
                         <input 
                           placeholder="Ingredients (e.g., Tomato, Basil, Garlic)"
                           value={dish.ingredients || ''}
                           onChange={(e) => updateDish(section.id, dish.id, 'ingredients', e.target.value)}
                           className="w-full text-xs text-slate-500 border-b border-slate-100 pb-1 focus:outline-none focus:border-primary"
                         />
                         <div className="relative">
                            <textarea 
                              placeholder="Description"
                              value={dish.description}
                              onChange={(e) => updateDish(section.id, dish.id, 'description', e.target.value)}
                              rows={2}
                              className="w-full text-sm text-slate-600 border border-slate-200 rounded p-2 focus:border-primary focus:ring-0 pr-8"
                            />
                            <button 
                                title="Enhance description with AI (uses Ingredients)"
                                onClick={() => handleEnhanceDish(section.id, dish.id, dish.name, dish.description, dish.ingredients)}
                                className="absolute right-2 top-2 text-violet-500 hover:text-violet-700 disabled:opacity-30"
                                disabled={loading}
                            >
                                <SparklesIcon className="w-5 h-5" />
                            </button>
                         </div>
                      </div>

                      {/* Image Upload */}
                      <div className="flex items-center gap-3 mt-2 mb-2">
                        {dish.image ? (
                          <div className="relative group inline-block">
                             <img src={dish.image} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-slate-200" />
                             <button
                               onClick={() => updateDish(section.id, dish.id, 'image', undefined)}
                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition"
                               title="Remove Image"
                             >
                               <TrashIcon className="w-3 h-3" />
                             </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition bg-slate-50 border border-slate-200 rounded px-3 py-2 border-dashed hover:border-solid">
                             <PhotoIcon className="w-4 h-4" />
                             <span>Upload Photo</span>
                             <input
                               type="file"
                               accept="image/*"
                               className="hidden"
                               onChange={(e) => {
                                 if (e.target.files?.[0]) handleImageUpload(section.id, dish.id, e.target.files[0]);
                               }}
                             />
                          </label>
                        )}
                      </div>

                      {/* Dietary Tags */}
                      <div className="mb-2">
                         <label className="text-xs font-semibold text-slate-400 block mb-1">Dietary Tags</label>
                         <div className="flex flex-wrap gap-2">
                            {DIETARY_TAGS.map(tag => (
                               <button 
                                 key={tag.id}
                                 onClick={() => toggleDishTag(section.id, dish.id, tag.id)}
                                 className={`px-2 py-0.5 rounded text-[10px] border transition ${
                                    (dish.dietaryTags || []).includes(tag.id) 
                                    ? 'bg-slate-800 text-white border-slate-800' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                                 }`}
                               >
                                 {tag.label}
                               </button>
                            ))}
                         </div>
                      </div>
                      
                      {/* Dietary Note */}
                       <input 
                           placeholder="Dietary Note (e.g. Contains nuts)"
                           value={dish.dietaryNote || ''}
                           onChange={(e) => updateDish(section.id, dish.id, 'dietaryNote', e.target.value)}
                           className="w-full text-xs text-slate-400 italic bg-slate-50 p-1 rounded focus:outline-none focus:bg-white border border-transparent focus:border-slate-200"
                        />
                      
                      <div className="mt-2 flex justify-end">
                         <button 
                            title="Remove Dish"
                            onClick={() => removeDish(section.id, dish.id)}
                            className="text-slate-300 hover:text-red-500 text-xs flex items-center"
                         >
                            <TrashIcon className="w-3 h-3 mr-1" /> Delete Dish
                         </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => addDish(section.id)}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-md text-slate-500 hover:border-primary hover:text-primary transition flex items-center justify-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" /> Add Dish
                  </button>
                </div>
              </div>
            ))}
             <button 
              onClick={addSection}
              className="w-full py-3 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition font-medium shadow-md"
            >
              Add New Section
            </button>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Preset Themes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Classic */}
                <button 
                  onClick={() => applyTheme(ThemeType.CLASSIC)}
                  className={`p-3 border rounded-lg text-left hover:shadow-md transition relative overflow-hidden group ${state.theme.type === ThemeType.CLASSIC ? 'ring-2 ring-primary border-primary' : 'border-slate-200'}`}
                >
                   <div className="absolute inset-0 bg-white opacity-20 group-hover:opacity-10 transition"></div>
                   <div className="relative z-10">
                      <div className="font-serif text-slate-900 font-bold mb-1">Classic</div>
                      <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full border border-slate-200 bg-white"></div>
                          <div className="w-4 h-4 rounded-full bg-slate-800"></div>
                      </div>
                   </div>
                </button>

                {/* Modern */}
                <button 
                  onClick={() => applyTheme(ThemeType.MODERN)}
                  className={`p-3 border rounded-lg text-left hover:shadow-md transition relative overflow-hidden group ${state.theme.type === ThemeType.MODERN ? 'ring-2 ring-primary border-primary' : 'border-slate-200'}`}
                >
                   <div className="relative z-10">
                      <div className="font-sans text-slate-900 font-bold mb-1">Modern</div>
                       <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full border border-slate-200 bg-slate-50"></div>
                          <div className="w-4 h-4 rounded-full bg-slate-900"></div>
                      </div>
                   </div>
                </button>

                {/* Rustic */}
                <button 
                  onClick={() => applyTheme(ThemeType.RUSTIC)}
                  className={`p-3 border rounded-lg text-left hover:shadow-md transition relative overflow-hidden group ${state.theme.type === ThemeType.RUSTIC ? 'ring-2 ring-primary border-primary' : 'border-slate-200'}`}
                >
                    <div className="relative z-10">
                      <div className="font-serif text-amber-900 italic font-bold mb-1">Rustic</div>
                      <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-amber-100"></div>
                          <div className="w-4 h-4 rounded-full bg-amber-900"></div>
                      </div>
                   </div>
                </button>

                {/* Midnight */}
                <button 
                  onClick={() => applyTheme(ThemeType.MIDNIGHT)}
                  className={`p-3 border rounded-lg text-left hover:shadow-md transition relative overflow-hidden group bg-slate-900 ${state.theme.type === ThemeType.MIDNIGHT ? 'ring-2 ring-primary border-primary' : 'border-slate-800'}`}
                >
                    <div className="relative z-10">
                      <div className="font-sans text-white font-bold mb-1">Midnight</div>
                      <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700"></div>
                          <div className="w-4 h-4 rounded-full bg-slate-100"></div>
                      </div>
                   </div>
                </button>

                {/* Jazz */}
                <button 
                  onClick={() => applyTheme(ThemeType.JAZZ)}
                  className={`p-3 border rounded-lg text-left hover:shadow-md transition relative overflow-hidden group bg-stone-900 ${state.theme.type === ThemeType.JAZZ ? 'ring-2 ring-primary border-primary' : 'border-stone-800'}`}
                >
                    <div className="relative z-10">
                      <div className="font-serif text-amber-400 font-bold mb-1">Jazz</div>
                      <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-stone-900 border border-stone-700"></div>
                          <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                      </div>
                   </div>
                </button>

                {/* Ocean */}
                <button 
                  onClick={() => applyTheme(ThemeType.OCEAN)}
                  className={`p-3 border rounded-lg text-left hover:shadow-md transition relative overflow-hidden group bg-cyan-50 ${state.theme.type === ThemeType.OCEAN ? 'ring-2 ring-primary border-primary' : 'border-cyan-100'}`}
                >
                    <div className="relative z-10">
                      <div className="font-serif text-cyan-900 font-bold mb-1">Ocean</div>
                      <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-cyan-50 border border-cyan-200"></div>
                          <div className="w-4 h-4 rounded-full bg-cyan-900"></div>
                      </div>
                   </div>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center">
                <SparklesIcon className="w-4 h-4 mr-1 text-violet-600" />
                AI Custom Theme
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Powered by Gemini. Describe your restaurant's mood, and optionally specify colors and fonts.
              </p>
              
              <div className="space-y-3">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your theme (e.g., 'Dark moody jazz bar with soft lighting')..."
                  className="w-full border border-slate-300 rounded-md p-3 text-sm focus:border-violet-500 focus:ring-violet-500"
                  rows={3}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <input 
                      type="text"
                      value={customColors}
                      onChange={(e) => setCustomColors(e.target.value)}
                      placeholder="Preferred Colors (e.g. Gold & Black)"
                      className="border border-slate-300 rounded-md p-2 text-sm focus:border-violet-500 focus:ring-violet-500"
                   />
                   <input 
                      type="text"
                      value={customFonts}
                      onChange={(e) => setCustomFonts(e.target.value)}
                      placeholder="Font Style (e.g. Elegant Serif)"
                      className="border border-slate-300 rounded-md p-2 text-sm focus:border-violet-500 focus:ring-violet-500"
                   />
                </div>
              </div>
              
              <button 
                onClick={handleGenerateTheme}
                disabled={loading || !prompt}
                className="w-full mt-4 bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : <SparklesIcon className="w-4 h-4 mr-2" />}
                Generate Full Theme
              </button>
            </div>

             {/* Simple Color Toggles for Readability on AI Backgrounds */}
            {state.theme.backgroundImage && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                     <h4 className="text-xs font-semibold mb-2">Manual Text Color Adjustment</h4>
                     <div className="flex gap-2">
                         <button 
                             onClick={() => setState(p => ({...p, theme: {...p.theme, textColor: '#ffffff'}}))}
                             className="w-8 h-8 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center hover:scale-110 transition"
                             title="White Text"
                         >
                           <span className="text-[8px] text-black">Aa</span>
                         </button>
                         <button 
                             onClick={() => setState(p => ({...p, theme: {...p.theme, textColor: '#000000'}}))}
                             className="w-8 h-8 rounded-full bg-black shadow-sm flex items-center justify-center hover:scale-110 transition"
                             title="Black Text"
                         >
                           <span className="text-[8px] text-white">Aa</span>
                         </button>
                         <input 
                            type="color"
                            value={state.theme.textColor}
                            onChange={(e) => setState(p => ({...p, theme: {...p.theme, textColor: e.target.value}}))}
                            className="w-8 h-8 rounded-full p-0 border-none cursor-pointer"
                            title="Custom Color"
                         />
                     </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'share' && (
           <div className="space-y-6">
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col items-center text-center">
                 <div className="bg-white p-2 rounded shadow mb-4">
                     <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(state.info.websiteUrl || '')}`} 
                        alt="QR Code" 
                        className="w-32 h-32"
                     />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-2">Share Your Menu</h3>
                 <p className="text-sm text-slate-500 mb-4">
                    Enter the URL where your menu will be hosted to generate a QR code for tables.
                 </p>
                 <input 
                    type="url"
                    value={state.info.websiteUrl || ''}
                    onChange={(e) => handleInfoChange('websiteUrl', e.target.value)}
                    placeholder="https://your-restaurant.com/menu"
                    className="w-full border border-slate-300 rounded p-2 text-sm mb-4 focus:border-primary focus:ring-primary"
                 />
                 <button 
                   onClick={handleDownloadQr}
                   className="flex items-center justify-center w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition"
                 >
                   <QrCodeIcon className="w-4 h-4 mr-2" />
                   Download QR Code
                 </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MenuEditor;