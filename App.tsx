import React, { useState, useEffect } from 'react';
import MenuEditor from './components/MenuEditor';
import MenuPreview from './components/MenuPreview';
import { AppState } from './types';
import { INITIAL_STATE } from './constants';
import { KeyIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [hasKey, setHasKey] = useState(false);

  // Check for API key presence on mount
  useEffect(() => {
    const checkKey = async () => {
       if (process.env.API_KEY) {
           setHasKey(true);
           return;
       }
       if (window.aistudio && window.aistudio.hasSelectedApiKey) {
           const selected = await window.aistudio.hasSelectedApiKey();
           setHasKey(selected);
       }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        setHasKey(true);
    } else {
        alert("API Key selection not supported in this environment or fallback env var missing.");
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <header className="bg-slate-900 text-white h-14 flex items-center justify-between px-6 shrink-0 print-hide z-20 shadow-md">
        <div className="flex items-center space-x-2">
            <span className="text-2xl">🧞‍♂️</span>
            <h1 className="font-bold text-lg tracking-wide">MENU CRAFT</h1>
        </div>
        <div className="flex items-center space-x-4">
             {!hasKey && (
                 <button 
                    onClick={handleConnectKey}
                    className="flex items-center px-3 py-1 bg-amber-600 hover:bg-amber-700 text-xs font-bold rounded text-white animate-pulse"
                 >
                    <KeyIcon className="w-3 h-3 mr-1" />
                    Connect API Key
                 </button>
             )}
             {hasKey && <span className="text-xs text-green-400 font-mono border border-green-900 bg-green-900/30 px-2 py-0.5 rounded">API CONNECTED</span>}
             <button 
                onClick={() => window.print()}
                className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition"
             >
                Export PDF
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Editor Panel (Left) */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 relative z-10 h-full print-hide">
          <MenuEditor state={state} setState={setState} />
        </div>

        {/* Preview Panel (Right) */}
        <div className="flex-1 bg-slate-100 relative h-full overflow-hidden">
           <MenuPreview data={state} />
        </div>
      </main>

      {/* Instructions Modal if no key */}
      {!hasKey && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 print-hide backdrop-blur-sm">
              <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-2xl">
                  <h2 className="text-2xl font-bold mb-4 text-slate-800">Welcome to Gourmet Genie</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                      To generate stunning AI menus with <strong>Nano Banana Pro</strong> visuals and descriptions, you need to connect your Google Gemini API key.
                  </p>
                  <p className="text-xs text-slate-400 mb-6">
                      Note: High-quality image generation requires a billed project. 
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-500 underline ml-1">Learn more</a>
                  </p>
                  <button 
                    onClick={handleConnectKey}
                    className="w-full bg-primary text-white py-3 rounded-md font-bold text-lg hover:bg-amber-700 transition transform hover:scale-105"
                  >
                    Select API Key
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;