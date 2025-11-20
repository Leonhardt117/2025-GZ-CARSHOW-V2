
import React, { useState, useRef, useEffect } from 'react';
import { Hall, ZoneType } from '../types';

interface MapCanvasProps {
  halls: Hall[];
  selectedHallId: string | null;
  onHallSelect: (hall: Hall) => void;
}

const MapCanvas: React.FC<MapCanvasProps> = ({ halls, selectedHallId, onHallSelect }) => {
  // Center position adjustment (Calculated to center the specific SVG content visually)
  // Content Center (Zones A & D) is approx (780, 520). SVG Center is (900, 600). 
  // Delta needed: X = +120, Y = +80.
  const initialX = 120;
  const initialY = 80;
  
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  
  // Calculate initial scale based on viewport width
  const [scale, setScale] = useState(() => {
      if (typeof window !== 'undefined') {
          // Mobile devices (< 768px) get a smaller initial scale
          // 0.34 is optimized to fit the ~1160px wide content area (Zone D to A) into ~390px screens
          return window.innerWidth < 768 ? 0.34 : 0.75;
      }
      return 0.75;
  });
  
  // Dragging state
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  
  // Zoom handlers
  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.3));
  const handleReset = () => {
      // Reset logic also respects device size
      const defaultScale = window.innerWidth < 768 ? 0.34 : 0.75;
      setScale(defaultScale);
      setPosition({ x: initialX, y: initialY });
  };

  const handleDragStart = (e: React.PointerEvent) => {
    isDragging.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    lastPos.current = { ...position };
    
    // Important: capturing pointer events helps with dragging consistency
    const target = e.target as Element;
    if (target.setPointerCapture && e.pointerId) {
        target.setPointerCapture(e.pointerId);
    }
    
    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handleDragEnd);
  };

  const handleDragMove = (e: PointerEvent) => {
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragging.current = true;
    }

    setPosition({
      x: lastPos.current.x + dx,
      y: lastPos.current.y + dy
    });
  };

  const handleDragEnd = (e: PointerEvent) => {
    window.removeEventListener('pointermove', handleDragMove);
    window.removeEventListener('pointerup', handleDragEnd);
    
    // Release pointer capture if applicable
    const target = e.target as Element;
    if (target.releasePointerCapture && e.pointerId) {
        target.releasePointerCapture(e.pointerId);
    }

    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  const handleHallClick = (e: React.MouseEvent, hall: Hall) => {
    e.stopPropagation();
    if (!isDragging.current && hall.brands.length > 0) {
        onHallSelect(hall);
    }
  };

  const getFillColor = (hall: Hall) => {
    const isSelected = hall.id === selectedHallId;
    if (isSelected) return '#f59e0b'; // Amber-500
    if (hall.id === 'h1.2') return '#1e293b'; // Grey placeholder

    switch (hall.type) {
      case ZoneType.NEV: return '#059669'; // Emerald-600
      case ZoneType.LUXURY: return '#7c3aed'; // Violet-600
      case ZoneType.PASSENGER: return '#2563eb'; // Blue-600
      case ZoneType.COMPONENTS: return '#475569'; // Slate-600
      default: return '#334155'; // Slate-700
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0f172a] touch-none">
      {/* Compass (Top Right) */}
      <div className="absolute top-6 right-6 z-10 pointer-events-none opacity-80">
         <div className="relative w-16 h-16 flex flex-col items-center justify-center bg-slate-900/50 rounded-full backdrop-blur border border-slate-700">
            <div className="text-red-500 text-xs font-black mb-0.5">N</div>
            <div className="w-1 h-6 bg-red-500 rounded-full shadow"></div>
            <div className="w-1 h-6 bg-white rounded-full shadow"></div>
         </div>
      </div>

      {/* Map Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-3 pointer-events-auto">
        <button onClick={handleZoomIn} className="w-10 h-10 bg-slate-800 text-white rounded-lg shadow-lg border border-slate-600 active:bg-slate-700 flex items-center justify-center hover:bg-slate-700 transition">
           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 bg-slate-800 text-white rounded-lg shadow-lg border border-slate-600 active:bg-slate-700 flex items-center justify-center hover:bg-slate-700 transition">
           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
         <button onClick={handleReset} className="w-10 h-10 bg-slate-800 text-white rounded-lg shadow-lg border border-slate-600 active:bg-slate-700 flex items-center justify-center hover:bg-slate-700 transition" title="Reset View">
           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {/* Draggable Canvas */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center bg-slate-950 touch-none"
        onPointerDown={handleDragStart}
      >
        <div 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging.current ? 'none' : 'transform 0.1s ease-out',
            transformOrigin: 'center' 
          }}
        >
          {/* SVG Map Container */}
          <svg width="1800" height="1200" viewBox="0 0 1800 1200" className="select-none">
            
            {/* --- BACKGROUND / ENVIRONMENT --- */}
            <g className="pointer-events-none select-none">
                {/* Pearl River */}
                <path d="M -500 -200 C 200 -50, 1000 -150, 2500 -200 L 2500 -600 L -500 -600 Z" fill="#1e293b" opacity="0.5" />
                <text x="900" y="-200" fill="#3b82f6" fontSize="50" fontWeight="bold" textAnchor="middle" opacity="0.4" letterSpacing="10">珠江 PEARL RIVER</text>

                {/* Yuejiang Middle Road */}
                <path d="M -200 50 L 2000 50 L 2000 180 L -200 180 Z" fill="#334155" />
                <path d="M -200 115 L 2000 115" stroke="#475569" strokeWidth="2" strokeDasharray="30 30" />
                <text x="900" y="130" fill="#94a3b8" fontSize="28" fontWeight="bold" textAnchor="middle" letterSpacing="2">阅江中路 Yuejiang Middle Rd</text>

                {/* Xingang East Road */}
                <path d="M -200 850 L 1300 850 L 1400 1000 L -100 1000 Z" fill="#334155" />
                <text x="700" y="940" fill="#94a3b8" fontSize="28" fontWeight="bold" textAnchor="middle" letterSpacing="2">新港东路 Xingang East Rd</text>

                {/* Fengpu Road */}
                <path d="M 1300 850 L 2200 850 L 2200 1000 L 1400 1000 Z" fill="#334155" />
                <text x="1800" y="940" fill="#94a3b8" fontSize="28" fontWeight="bold" textAnchor="middle" letterSpacing="2">凤浦中路 Fengpu Rd</text>

                {/* Zhanchang West Rd */}
                <path d="M 680 180 L 740 180 L 740 850 L 680 850 Z" fill="#334155" />
                 <text x="710" y="500" fill="#94a3b8" fontSize="20" fontWeight="bold" textAnchor="middle" style={{ writingMode: 'vertical-rl' }}>展场西路</text>
            </g>

            {/* Subway Station */}
            <g transform="translate(700, 800)">
               <rect x="-20" y="-20" width="240" height="40" rx="20" fill="#b91c1c" />
               <circle cx="0" cy="0" r="15" fill="white" />
               <text x="0" y="5" textAnchor="middle" fill="#b91c1c" fontWeight="bold" fontSize="14">M</text>
               <text x="25" y="5" fill="white" fontWeight="bold" fontSize="16">地铁新港东站 A出口</text>
            </g>

            {/* --- EXHIBITION ZONES --- */}
            
            {/* AREA D GROUP */}
            <g transform="translate(200, 300)">
               {/* Zone Label */}
               <circle cx="-60" cy="150" r="40" fill="#4338ca" opacity="0.9" />
               <text x="-60" y="165" fill="white" fontSize="40" fontWeight="900" textAnchor="middle">D</text>
               
               {/* D Container Border */}
               <rect x="-20" y="-20" width="500" height="460" rx="20" fill="none" stroke="#475569" strokeWidth="4" strokeDasharray="10 10" />

               {/* Hall Blocks */}
               {['17.2', '18.2', '19.2', '20.2'].map((code, i) => {
                const hall = halls.find(h => h.code === code);
                if (!hall) return null;
                return (
                  <g 
                    key={hall.id} 
                    data-hall-id={hall.id} 
                    transform={`translate(${i * 120}, 0)`} 
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={(e) => handleHallClick(e, hall)}
                  >
                    {/* Shadow */}
                    <rect x="10" y="10" width="110" height="140" rx="8" fill="rgba(0,0,0,0.5)" pointerEvents="none"/>
                    {/* Block */}
                    <rect width="110" height="140" rx="8" fill={getFillColor(hall)} stroke="white" strokeWidth={hall.id === selectedHallId ? 4 : 1} />
                    <text x="55" y="60" fill="white" fontSize="28" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }} pointerEvents="none">{code}</text>
                    <text x="55" y="90" fill="rgba(255,255,255,0.9)" fontSize="16" textAnchor="middle" pointerEvents="none">2F</text>
                  </g>
                );
              })}

               {/* Hall 20.1 */}
               {(() => {
                  const hall201 = halls.find(h => h.id === 'h20.1');
                  if (hall201) {
                      return (
                          <g 
                            key={hall201.id}
                            data-hall-id={hall201.id}
                            transform={`translate(360, 160)`} 
                            className="cursor-pointer hover:opacity-90"
                            onClick={(e) => handleHallClick(e, hall201)}
                          >
                             <rect x="10" y="10" width="110" height="140" rx="8" fill="rgba(0,0,0,0.5)" pointerEvents="none"/>
                             <rect width="110" height="140" rx="8" fill={getFillColor(hall201)} stroke="white" strokeWidth={hall201.id === selectedHallId ? 4 : 1} />
                             <text x="55" y="60" fill="white" fontSize="28" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }} pointerEvents="none">20.1</text>
                             <text x="55" y="90" fill="rgba(255,255,255,0.9)" fontSize="16" textAnchor="middle" pointerEvents="none">1F</text>
                          </g>
                      )
                  }
               })()}
            </g>

            {/* Pedestrian Bridge */}
            <g transform="translate(680, 370)">
                 <rect x="0" y="0" width="60" height="40" fill="#64748b" />
                 <line x1="0" y1="0" x2="60" y2="0" stroke="#94a3b8" strokeWidth="4" />
                 <line x1="0" y1="40" x2="60" y2="40" stroke="#94a3b8" strokeWidth="4" />
            </g>

             {/* AREA A GROUP */}
             <g transform="translate(740, 300)">
               {/* Zone Label */}
               <circle cx="620" cy="150" r="40" fill="#7c3aed" opacity="0.9" />
               <text x="620" y="165" fill="white" fontSize="40" fontWeight="900" textAnchor="middle">A</text>
               
               {/* A Container Border */}
               <rect x="-20" y="-20" width="620" height="460" rx="20" fill="none" stroke="#475569" strokeWidth="4" strokeDasharray="10 10" />

               {/* Floor 2 Row */}
               {['1.2', '2.2', '3.2', '4.2', '5.2'].map((code, i) => {
                 const hall = halls.find(h => h.code === code);
                 if (!hall) return null;
                 const hasBrands = hall.brands.length > 0;
                 return (
                  <g 
                    key={hall.id} 
                    data-hall-id={hall.id}
                    transform={`translate(${i * 120}, 0)`}
                    className={`${hasBrands ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-50'}`}
                    onClick={(e) => handleHallClick(e, hall)}
                  >
                    <rect x="10" y="10" width="110" height="140" rx="8" fill="rgba(0,0,0,0.5)" pointerEvents="none"/>
                    <rect width="110" height="140" rx="8" fill={getFillColor(hall)} stroke="white" strokeWidth={hall.id === selectedHallId ? 4 : 1} />
                    <text x="55" y="60" fill="white" fontSize="28" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }} pointerEvents="none">{code}</text>
                    <text x="55" y="90" fill="rgba(255,255,255,0.9)" fontSize="16" textAnchor="middle" pointerEvents="none">2F</text>
                  </g>
                 )
              })}

              {/* Floor 1 Row */}
              {['1.1', '2.1', '3.1', '4.1', '5.1'].map((code, i) => {
                 const hall = halls.find(h => h.code === code);
                 if (!hall) return null;
                 return (
                  <g 
                    key={hall.id} 
                    data-hall-id={hall.id}
                    transform={`translate(${i * 120}, 160)`}
                    className="cursor-pointer hover:opacity-90"
                    onClick={(e) => handleHallClick(e, hall)}
                  >
                    <rect x="10" y="10" width="110" height="140" rx="8" fill="rgba(0,0,0,0.5)" pointerEvents="none"/>
                    <rect width="110" height="140" rx="8" fill={getFillColor(hall)} stroke="white" strokeWidth={hall.id === selectedHallId ? 4 : 1} />
                    <text x="55" y="60" fill="white" fontSize="28" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }} pointerEvents="none">{code}</text>
                    <text x="55" y="90" fill="rgba(255,255,255,0.9)" fontSize="16" textAnchor="middle" pointerEvents="none">1F</text>
                  </g>
                 )
              })}
             </g>

          </svg>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-slate-500 text-xs pointer-events-none select-none bg-slate-900/80 px-2 py-1 rounded">
         Guangzhou Auto Show Investor Map
      </div>
    </div>
  );
};

export default MapCanvas;
