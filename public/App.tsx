import React, { useState, useEffect } from 'react';
import MapCanvas from './components/MapCanvas';
import Sidebar from './components/Sidebar';
import BrandSearch from './components/BrandSearch';
import { exhibitionHalls as initialHalls } from './data/exhibitionData';
import { parseBrandsCSV } from './utils/csvLoader';
import { Hall } from './types';

const App: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>(initialHalls);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [highlightedBrandId, setHighlightedBrandId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Load CSV Data on Mount
  useEffect(() => {
    const loadData = async () => {
      // Ensure the path matches where you place the file in public/
      const updatedHalls = await parseBrandsCSV('/brands.csv', initialHalls);
      setHalls(updatedHalls);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleHallSelect = (hall: Hall) => {
    setSelectedHallId(hall.id);
    setHighlightedBrandId(null);
  };

  const handleBrandSelect = (hallId: string, brandId: string) => {
    setSelectedHallId(hallId);
    setHighlightedBrandId(brandId);
    setIsSearchOpen(false);
  };

  const selectedHall = halls.find(h => h.id === selectedHallId) || null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden font-sans overscroll-none">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-3 sm:px-4 justify-between shrink-0 z-30 shadow-lg relative">
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg shadow-lg text-white shrink-0">
                G
            </div>
            <div>
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-white leading-tight">广州车展 <span className="text-blue-400 font-normal text-xs block sm:inline sm:text-sm sm:font-bold">投资人地图</span></h1>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <span className="hidden sm:inline">搜品牌</span>
                <span className="sm:hidden">搜</span>
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Map Area */}
        <div className="flex-1 relative bg-slate-950 z-0">
            <MapCanvas 
                halls={halls} 
                selectedHallId={selectedHallId} 
                onHallSelect={handleHallSelect}
            />
            
            {/* CSV Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-50 backdrop-blur-sm">
                    <div className="bg-slate-800 px-6 py-4 rounded-lg shadow-2xl border border-slate-700 flex items-center gap-3">
                         <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <span className="text-sm font-medium text-slate-200">正在加载展位数据 (Loading Data)...</span>
                    </div>
                </div>
            )}
        </div>

        {/* Brand Search Overlay */}
        {isSearchOpen && (
            <BrandSearch 
                halls={halls} 
                onClose={() => setIsSearchOpen(false)} 
                onSelectBrand={handleBrandSelect}
            />
        )}

        {/* Right Sidebar (Details) */}
        <aside 
            className={`
                absolute right-0 top-0 bottom-0 bg-slate-900 shadow-2xl z-40
                border-l border-slate-800 transition-transform duration-300 ease-out
                w-full sm:w-80 md:w-96
                ${selectedHallId ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            <div className="h-full w-full relative">
                <button 
                    onClick={() => setSelectedHallId(null)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full transition z-50 backdrop-blur-sm border border-slate-700"
                    aria-label="Close sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                 <Sidebar hall={selectedHall} highlightedBrandId={highlightedBrandId} />
            </div>
        </aside>
      </main>
    </div>
  );
};

export default App;