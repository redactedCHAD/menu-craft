import React from 'react';
import { AppState, ThemeType } from '../types';
import { DIETARY_TAGS } from '../constants';

interface MenuPreviewProps {
  data: AppState;
}

const MenuPreview: React.FC<MenuPreviewProps> = ({ data }) => {
  const { info, sections, theme } = data;

  // Compute styles based on theme
  const containerStyle: React.CSSProperties = {
    color: theme.textColor,
    backgroundColor: theme.backgroundColor,
    backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  // Overlay for readability if using background image
  const overlayClass = theme.backgroundImage 
    ? "bg-white/90 backdrop-blur-md p-8 md:p-12 shadow-2xl mx-auto my-8 max-w-2xl rounded-sm"
    : "p-8 md:p-12 mx-auto max-w-2xl h-full";

  const isModern = [ThemeType.MODERN, ThemeType.MIDNIGHT, ThemeType.OCEAN].includes(theme.type);
  const isRustic = theme.type === ThemeType.RUSTIC;

  const getTagLabel = (id: string) => DIETARY_TAGS.find(t => t.id === id)?.label || id;

  return (
    <div className="w-full h-full min-h-[800px] overflow-auto bg-slate-200 p-4 md:p-8 flex items-center justify-center print-hide">
      <div 
        id="menu-print-area"
        className={`w-[210mm] min-h-[297mm] shadow-lg relative transition-all duration-300 print-only`}
        style={containerStyle}
      >
        <div className={`h-full w-full ${theme.backgroundImage ? 'p-6 flex items-center justify-center' : ''}`}>
          
          <div className={`${overlayClass} flex flex-col h-full`}>
            {/* Header */}
            <div className={`text-center mb-10 border-b-2 pb-6 ${isModern ? 'border-primary' : 'border-current opacity-80'}`}>
              <h1 className={`text-5xl md:text-6xl font-bold mb-2 ${theme.headingFont} tracking-tight`}>
                {info.name}
              </h1>
              <p className={`text-xl uppercase tracking-widest ${theme.bodyFont} opacity-75`}>
                {info.tagline}
              </p>
            </div>

            {/* Sections */}
            <div className="flex-grow space-y-8">
              {sections.map((section) => (
                <div key={section.id} className="mb-6">
                  <h2 className={`text-2xl md:text-3xl font-bold mb-4 text-center uppercase tracking-wider ${theme.headingFont} ${isRustic ? 'border-y py-2 border-current inline-block w-full' : 'text-primary'}`}>
                    {section.title}
                  </h2>
                  <div className="space-y-5">
                    {section.items.map((dish) => (
                      <div key={dish.id} className="flex gap-4 group">
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className={`text-lg font-bold ${theme.bodyFont} ${dish.highlight ? 'text-primary' : ''}`}>
                                {dish.name}
                              </h3>
                              {isModern && <div className="flex-1 border-b border-dotted border-current mx-3 opacity-40 relative -top-1"></div>}
                              <span className={`text-lg font-bold ${theme.bodyFont} whitespace-nowrap`}>
                                {dish.price}
                              </span>
                            </div>
                            
                            <div className="pr-2">
                                <p className={`text-sm opacity-90 ${theme.bodyFont} leading-relaxed`}>
                                    {dish.description}
                                </p>
                                
                                {/* Tags & Note Row */}
                                {(dish.dietaryTags?.length || dish.dietaryNote) ? (
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        {dish.dietaryTags?.map(tagId => (
                                            <span key={tagId} className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                                                isModern 
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'bg-transparent border-current opacity-70'
                                            }`}>
                                                {getTagLabel(tagId)}
                                            </span>
                                        ))}
                                        {dish.dietaryNote && (
                                            <span className="text-xs italic opacity-70">
                                                * {dish.dietaryNote}
                                            </span>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {dish.image && (
                            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-md overflow-hidden bg-black/5 self-start shadow-sm">
                                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 text-center text-sm opacity-60 border-t border-current flex flex-col items-center gap-2">
              <p>{info.contact}</p>
              {info.websiteUrl && (
                  <p className="text-xs">{info.websiteUrl.replace('https://', '')}</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MenuPreview;