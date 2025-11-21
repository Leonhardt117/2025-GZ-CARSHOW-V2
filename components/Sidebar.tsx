
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
  // Track which brands are expanded to show details
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  
  // Reset states when hall changes
  useEffect(() => {
    setImgError(false);
    setIsImageModalOpen(false);
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
                // Calculate position manually to avoid 'scrollIntoView' shifting the entire page on mobile
                const elTop = el.offsetTop;
                const elHeight = el.offsetHeight;
                const containerHeight = container.offsetHeight;
                
                // Center the element in the container
                container.scrollTo({
                    top: elTop - (containerHeight / 2) + (elHeight / 2),
                    behavior: 'smooth'
                });

                el.classList.add('ring-2', 'ring-amber-500', 'bg-slate-800');
                
                // Remove highlight ring after animation
                setTimeout(() => {
                   if (el) el.classList.remove('ring-2', 'ring-amber-500');
                }, 2000);
            }
        }, 300); // 300ms delay matches CSS transition duration

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

  const getTagStyle = (tag: string) => {
      if (tag.includes('新车')) return 'bg-red-900/40 text-red-300 border border-red-900/50';
      if (tag.includes('首发')) return 'bg-purple-900/40 text-purple-300 border border-purple-900/50';
      if (tag.includes('换代')) return 'bg-blue-900/40 text-blue-300 border border-blue-900/50';
      // Default fallback
      return 'bg-slate-800 text-slate-300 border border-slate-700';
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
      <div className="p-5 border-b border-slate-800 bg-slate-900 shadow-md shrink-0">
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white">{hall.code}</h2>
                <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">{hall.floor}楼</span>
            </div>
        </div>
        <p className="text-emerald-500 text-sm font-medium mb-4">{hall.type}</p>

        {/* Hall Layout Image Visualization - Height Reduced to h-32 */}
        <div 
            className="w-full h-32 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden mb-1 shadow-inner group cursor-pointer"
            onClick={() => !imgError && setIsImageModalOpen(true)}
        >
            {!imgError ? (
                <>
                    <img 
                        key={mapImageUrl}
                        src={mapImageUrl} 
                        alt={`${hall.code} Layout`}
                        className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                        onError={() => setImgError(true)}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                        </svg>
                        点击放大
                    </div>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-4 text-center border-2 border-dashed border-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-2 opacity-50">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="text-[10px] font-medium">暂无地图</span>
                </div>
            )}
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
      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 custom-scrollbar relative">
        {sortedBrands.length === 0 ? (
             <div className="text-center text-slate-500 py-10">暂无展位数据</div>
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
                            rounded-lg border p-3 transition-all duration-200 w-full relative cursor-pointer select-none
                            ${isHighlighted 
                                ? 'bg-slate-800 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                            }
                        `}
                    >
                        {/* Header: Booth & Name */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-500 font-mono font-bold text-sm shrink-0">{brand.booth}</span>
                                    <h4 className={`font-bold text-base truncate ${isHighlighted ? 'text-amber-100' : 'text-slate-200'}`}>
                                        {brand.name}
                                    </h4>
                                </div>
                                {/* Brand Description (Hidden when collapsed) */}
                                {isExpanded && brand.description && (
                                    <p className="text-xs text-slate-500 ml-0.5 animate-in fade-in slide-in-from-top-1 duration-200">{brand.description}</p>
                                )}
                            </div>
                            {/* Chevron Icon */}
                             <div className={`text-slate-500 transition-transform duration-300 mt-1 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Section 1: Highlights (Badges) */}
                        {brand.models.length > 0 && (
                            <div className={`${isExpanded ? 'mb-3' : ''}`}>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {brand.models.map((model, idx) => (
                                        <div key={idx} className="flex flex-col bg-slate-900/60 px-2 py-1.5 rounded border border-slate-700/40 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-300 truncate mr-2">{model.name}</span>
                                                {model.highlight && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${getTagStyle(model.highlight)}`}>
                                                        {model.highlight}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Note displayed only when expanded */}
                                            {isExpanded && model.note && (
                                                <div className="text-[10px] text-slate-500 mt-1 pl-1 border-l-2 border-slate-700/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {model.note}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 2: Full List (Structured List) */}
                        {brand.fullModelList && brand.fullModelList.length > 0 && (
                             <div className={`${!isExpanded && !brand.models.length ? '' : 'mt-2'}`}>
                                {/* Optional: Hide label when collapsed to save space? Keeping it for structure. */}
                                {isExpanded && <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider animate-in fade-in">全系参展 (All Models)</div>}
                                
                                <div className="grid grid-cols-1 gap-1.5">
                                    {brand.fullModelList.map((model, idx) => (
                                        <div key={idx} className="flex flex-col px-2 py-1 rounded border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-300 text-xs truncate mr-2">{model.name}</span>
                                                {model.highlight && (
                                                     <span className={`text-[10px] px-1.5 py-0 rounded whitespace-nowrap scale-90 origin-right ${getTagStyle(model.highlight)}`}>
                                                        {model.highlight}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Note displayed only when expanded */}
                                            {isExpanded && model.note && (
                                                <div className="text-[10px] text-slate-500 mt-0.5 pl-1 border-l-2 border-slate-700/30 leading-tight animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {model.note}
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
        <div className="h-12"></div>
      </div>
    </div>
  );
};

export default Sidebar;
