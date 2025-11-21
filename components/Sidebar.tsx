import React, { useEffect, useRef, useState } from 'react';
import { Hall } from '../types';

interface SidebarProps {
  hall: Hall | null;
  highlightedBrandId?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ hall, highlightedBrandId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(true);
  // Track which brands are expanded to show details
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  
  // Reset states when hall changes
  useEffect(() => {
    setImgError(false);
    setIsImageModalOpen(false);
    setIsMapExpanded(true);
    setExpandedBrands({}); // Collapse all when switching halls
    if (containerRef.current) {
        containerRef.current.scrollTop = 0;
    }
  }, [hall]);

  // Handle scrolling to highlighted brand and auto-expanding it
  useEffect(() => {
    if (highlightedBrandId && hall) {
        // Auto-expand the highlighted brand
        setExpandedBrands(prev => ({ ...prev, [highlightedBrandId]: true }));

        // Use a timeout to ensure the DOM is fully updated and sidebar transition is active/done
        const timer = setTimeout(() => {
            const el = document.getElementById(`brand-${highlightedBrandId}`);
            const container = containerRef.current;
            
            if (el && container) {
                const elTop = el.offsetTop;
                const elHeight = el.offsetHeight;
                const containerHeight = container.offsetHeight;
                
                container.scrollTo({
                    top: elTop - (containerHeight / 2) + (elHeight / 2),
                    behavior: 'smooth'
                });

                el.classList.add('ring-2', 'ring-amber-500', 'bg-slate-800');
                
                setTimeout(() => {
                   if (el) el.classList.remove('ring-2', 'ring-amber-500');
                }, 2000);
            }
        }, 300);

        return () => clearTimeout(timer);
    }
  }, [highlightedBrandId, hall]);

  const toggleBrand = (e: React.MouseEvent, brandId: string) => {
    e.stopPropagation();
    setExpandedBrands(prev => ({
        ...prev,
        [brandId]: !prev[brandId]
    }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    // Collapse map when scrolling down, expand when at top
    if (scrollTop > 10 && isMapExpanded) {
        setIsMapExpanded(false);
    } else if (scrollTop < 5 && !isMapExpanded) {
        setIsMapExpanded(true);
    }
  };

  const getTagStyle = (tag: string) => {
      if (tag.includes('新车')) return 'bg-red-900/60 text-red-200 border border-red-700';
      if (tag.includes('首发')) return 'bg-purple-900/60 text-purple-200 border border-purple-700';
      if (tag.includes('换代')) return 'bg-blue-900/60 text-blue-200 border border-blue-700';
      return 'bg-slate-700 text-slate-200 border border-slate-600';
  };

  if (!hall) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center select-none bg-slate-900 border-l border-slate-800">
        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-300">请选择展馆</h3>
        <p className="text-sm mt-2 text-slate-500 max-w-[200px]">点击地图上的展馆区块 (例如 17.2) 查看详细展位列表</p>
      </div>
    );
  }

  const sortedBrands = [...hall.brands].sort((a, b) => a.booth.localeCompare(b.booth));
  const mapImageUrl = `/hall-maps/${hall.code}.png`;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800 overflow-x-hidden font-sans relative z-20">
      {/* Header */}
      <div className="px-5 pt-5 pb-2 bg-slate-900 shadow-md shrink-0 z-10">
        <div className="flex justify-between items-start mb-2">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold text-white">{hall.code}</h2>
                    <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">{hall.floor}楼</span>
                    <button 
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                        title={isMapExpanded ? "收起地图" : "展开地图"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isMapExpanded ? 'rotate-0' : '-rotate-90'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>
                <p className="text-emerald-500 text-base font-medium">{hall.type}</p>
            </div>
        </div>

        {/* Collapsible Map Section */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isMapExpanded ? 'max-h-40 opacity-100 mb-3' : 'max-h-0 opacity-0 mb-0'}`}>
            <div 
                className="w-full h-28 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden shadow-inner group cursor-pointer"
                onClick={() => !imgError && setIsImageModalOpen(true)}
            >
                {!imgError ? (
                    <>
                        <img 
                            key={mapImageUrl}
                            src={mapImageUrl} 
                            alt={`${hall.code} Layout`}
                            className="w-full h-full object-contain p-1 hover:scale-105 transition-transform duration-300"
                            onError={() => setImgError(true)}
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                            </svg>
                            点击放大
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-4 text-center border-2 border-dashed border-slate-800">
                        <span className="text-[10px] font-medium">暂无地图</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsImageModalOpen(false)}
        >
            <div className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col items-center justify-center">
                <button 
                    className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                    onClick={() => setIsImageModalOpen(false)}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <img 
                    src={mapImageUrl} 
                    alt={`${hall.code} Layout Full`}
                    className="max-w-full max-h-full object-contain rounded shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />
                 <div className="absolute bottom-8 bg-black/70 px-4 py-2 rounded-full text-white text-sm font-bold border border-white/10">
                    {hall.code} 展馆分布图
                </div>
            </div>
        </div>
      )}

      {/* Brand List */}
      <div 
        ref={containerRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 custom-scrollbar relative"
      >
        {sortedBrands.length === 0 ? (
             <div className="text-center text-slate-500 py-10 text-lg">暂无展位数据</div>
        ) : (
            sortedBrands.map((brand) => {
                const isHighlighted = brand.id === highlightedBrandId;
                const isExpanded = expandedBrands[brand.id] || false;

                return (
                    <div 
                        key={brand.id} 
                        id={`brand-${brand.id}`}
                        onClick={(e) => toggleBrand(e, brand.id)}
                        className={`
                            rounded-xl border p-4 transition-all duration-200 w-full relative cursor-pointer select-none
                            ${isHighlighted 
                                ? 'bg-slate-800 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                            }
                        `}
                    >
                        {/* Header: Booth & Name */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col gap-1 overflow-hidden flex-1 mr-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-amber-500 font-mono font-bold text-base shrink-0">{brand.booth}</span>
                                    <h4 className={`font-bold text-xl truncate ${isHighlighted ? 'text-amber-100' : 'text-white'}`}>
                                        {brand.name}
                                    </h4>
                                </div>
                                {/* Brand Description (Hidden when collapsed) */}
                                {isExpanded && brand.description && (
                                    <div className="mt-2 mb-1 p-2 bg-blue-950/30 border border-blue-900/30 rounded text-sm text-blue-200 leading-relaxed animate-in fade-in">
                                        {brand.description}
                                    </div>
                                )}
                            </div>
                            {/* Chevron Icon */}
                             <div className={`text-slate-400 transition-transform duration-300 mt-1.5 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Section 1: Highlights (Badges) */}
                        {brand.models.length > 0 && (
                            <div className="mt-3">
                                <div className="text-[10px] font-bold text-amber-500/80 mb-2 uppercase tracking-wider flex items-center gap-1">
                                     <span className="w-1 h-1 rounded-full bg-amber-500 inline-block"></span>
                                     重点新车 (HIGHLIGHTS)
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {brand.models.map((model, idx) => (
                                        <div key={idx} className="flex flex-col bg-slate-900/60 rounded-lg border border-slate-700/40 overflow-hidden">
                                            {/* Main Row: Name & Tag */}
                                            <div className="flex items-center justify-between px-3 py-2.5">
                                                <span className="text-slate-100 font-bold text-lg truncate mr-2">{model.name}</span>
                                                {model.highlight && (
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-sm ${getTagStyle(model.highlight)}`}>
                                                        {model.highlight}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Note (Displayed only when expanded, with distinct styling) */}
                                            {isExpanded && model.note && (
                                                <div className="px-3 pb-3 pt-0 animate-in fade-in slide-in-from-top-1">
                                                    <div className="bg-slate-950/60 rounded p-2.5 text-sm text-slate-200 border border-slate-800 shadow-inner leading-relaxed relative">
                                                        {/* Decorative corner */}
                                                        <div className="absolute top-0 left-0 w-full h-full border-l-2 border-slate-600/50 rounded-l opacity-50 pointer-events-none"></div>
                                                        {model.note}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 2: Full List (Structured List) */}
                        {brand.fullModelList && brand.fullModelList.length > 0 && (
                             <div className="mt-4">
                                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                                     <span className="w-1 h-1 rounded-full bg-slate-600 inline-block"></span>
                                     全系参展 (ALL MODELS)
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2">
                                    {brand.fullModelList.map((model, idx) => (
                                        <div key={idx} className="flex flex-col rounded border border-slate-800 bg-slate-900/30 transition-colors hover:bg-slate-900/50">
                                            <div className="flex items-center justify-between px-3 py-2">
                                                <span className="text-slate-300 text-base font-medium truncate mr-2">{model.name}</span>
                                                {model.highlight && (
                                                     <span className={`text-[10px] px-2 py-0.5 rounded whitespace-nowrap ${getTagStyle(model.highlight)}`}>
                                                        {model.highlight}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Note (Displayed only when expanded) */}
                                            {isExpanded && model.note && (
                                                <div className="px-3 pb-2 pt-0 animate-in fade-in slide-in-from-top-1">
                                                    <div className="bg-slate-950/40 rounded p-2 text-sm text-slate-400 border-t border-slate-800/50 leading-tight">
                                                        {model.note}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })
        )}
        <div className="h-16"></div>
      </div>
    </div>
  );
};

export default Sidebar;
