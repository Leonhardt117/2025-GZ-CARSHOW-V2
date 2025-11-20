
import React, { useState, useMemo } from 'react';
import { Hall } from '../types';

interface BrandSearchProps {
  halls: Hall[];
  onClose: () => void;
  onSelectBrand: (hallId: string, brandId: string) => void;
}

const BrandSearch: React.FC<BrandSearchProps> = ({ halls, onClose, onSelectBrand }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all brands into a single searchable list
  const allBrands = useMemo(() => {
    const list: Array<{ hallId: string, hallCode: string, brandId: string, brandName: string, booth: string, models: string }> = [];
    halls.forEach(hall => {
      hall.brands.forEach(brand => {
        list.push({
          hallId: hall.id,
          hallCode: hall.code,
          brandId: brand.id,
          brandName: brand.name,
          booth: brand.booth,
          models: brand.models.map(m => m.name).join(' ')
        });
      });
    });
    // Sort by name (Chinese compliant)
    return list.sort((a, b) => a.brandName.localeCompare(b.brandName, 'zh-CN'));
  }, [halls]);

  // Filter logic
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return allBrands;
    const lowerQuery = searchQuery.toLowerCase();
    return allBrands.filter(item => 
      item.brandName.toLowerCase().includes(lowerQuery) || 
      item.hallCode.includes(lowerQuery) ||
      item.models.toLowerCase().includes(lowerQuery)
    );
  }, [allBrands, searchQuery]);

  return (
    <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-800 bg-slate-900 shrink-0 gap-3">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
           </svg>
        </button>
        <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input 
                type="text"
                placeholder="搜索品牌、车型..."
                className="w-full bg-slate-800 text-white text-sm rounded-full py-1.5 pl-8 pr-4 border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
            />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {filteredBrands.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">未找到相关品牌</div>
        ) : (
            <div className="space-y-1">
                {filteredBrands.map(item => (
                    <button 
                        key={`${item.hallId}-${item.brandId}`}
                        onClick={() => onSelectBrand(item.hallId, item.brandId)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors text-left group"
                    >
                        <div>
                            <h4 className="text-slate-200 font-bold text-base">{item.brandName}</h4>
                            {item.models && (
                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{item.models}</p>
                            )}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-amber-500 font-mono font-bold text-sm">{item.booth}</span>
                            <span className="text-xs text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mt-1 group-hover:border-slate-600 group-hover:text-slate-500">
                                {item.hallCode}馆
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default BrandSearch;
