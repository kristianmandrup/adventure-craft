import React from 'react';
import { Wand2, Heart, Beef, Compass, Eye, Map as MapIcon, RotateCcw, Trash2, Hammer } from 'lucide-react';

interface TopBarProps {
  playerHp: number;
  playerHunger: number;
  viewMode: 'FP' | 'OVERHEAD';
  expansionLevel: number;
  onResetView: () => void;
  onExpand: () => void;
  onRespawn: () => void;
  onReset: () => void;
  onToggleCrafting: () => void;
  stopProp: (e: any) => void;
  showTooltip: (e: any, text: string) => void;
  hideTooltip: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  playerHp, playerHunger, viewMode, expansionLevel, onResetView, onExpand, onRespawn, onReset, onToggleCrafting, stopProp, showTooltip, hideTooltip 
}) => {
  return (
    <div className="flex justify-between items-start pointer-events-auto" onPointerDown={stopProp} onClick={stopProp}>
      <div className="flex flex-col gap-2">
         <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 max-w-md">
           <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
             <Wand2 className="w-6 h-6 text-green-600" />
             Adventure<span className="text-blue-600">Craft</span>
           </h1>
           <div className="text-[10px] text-gray-500 mt-1 font-mono flex items-center gap-2">
             <span>Press <strong>ENTER</strong> to type</span>
             <span className="w-1 h-1 rounded-full bg-gray-400"></span>
             <span><strong>V</strong> to switch view ({viewMode})</span>
           </div>
         </div>
         
         <div className="bg-black/60 p-2 rounded-lg backdrop-blur-md flex items-center gap-2 w-64 border border-white/10" 
              onMouseEnter={(e) => showTooltip(e, "Health Points")} onMouseLeave={hideTooltip}>
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <div className="flex-1 h-3 bg-red-900 rounded-full overflow-hidden">
              <div 
                 className="h-full bg-red-500 transition-all duration-300"
                 style={{ width: `${Math.max(0, Math.min(100, playerHp))}%` }}
              />
            </div>
            <span className="text-white font-mono text-sm">{Math.round(playerHp)}</span>
         </div>

         <div className="bg-black/60 p-2 rounded-lg backdrop-blur-md flex items-center gap-2 w-64 border border-white/10"
              onMouseEnter={(e) => showTooltip(e, "Hunger Level")} onMouseLeave={hideTooltip}>
            <Beef className="w-5 h-5 text-orange-500 fill-orange-500" />
            <div className="flex-1 h-3 bg-orange-900 rounded-full overflow-hidden">
              <div 
                 className="h-full bg-orange-500 transition-all duration-300"
                 style={{ width: `${Math.max(0, Math.min(100, playerHunger))}%` }}
              />
            </div>
            <span className="text-white font-mono text-sm">{Math.round(playerHunger)}</span>
         </div>
      </div>
      
      <div className="flex gap-2">
           <button 
            onClick={onResetView}
            className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg shadow-lg flex items-center justify-center border border-white/10"
            onMouseEnter={(e) => showTooltip(e, "Level View [H]")}
            onMouseLeave={hideTooltip}
          >
            <Compass className="w-5 h-5 text-cyan-400" />
          </button>
           <div className="bg-black/50 p-3 rounded-lg flex items-center gap-2 text-white border border-white/10" title="Current View Mode">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold">{viewMode} [V]</span>
           </div>
           <button 
            onClick={onExpand}
            disabled={expansionLevel >= 5}
            className={`text-white p-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all ${expansionLevel >= 5 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-700'}`}
            onMouseEnter={(e) => showTooltip(e, `Expand World Size [M] (${expansionLevel}/5)`)}
            onMouseLeave={hideTooltip}
          >
            <MapIcon className="w-5 h-5" />
            {expansionLevel >= 5 ? 'Max' : `Map [M]`}
          </button>
          <button 
            onClick={onToggleCrafting}
            className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-2"
            onMouseEnter={(e) => showTooltip(e, "Crafting Menu [C]")}
            onMouseLeave={hideTooltip}
          >
            <Hammer className="w-5 h-5" />
            <span className="text-[10px] font-bold">[C]</span>
          </button>
          <button 
            onClick={onRespawn}
            className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg shadow-lg flex items-center gap-1"
            onMouseEnter={(e) => showTooltip(e, "Respawn / Unstuck [R]")}
            onMouseLeave={hideTooltip}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[10px] font-bold">[R]</span>
          </button>
          <button 
            onClick={onReset}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-1"
            onMouseEnter={(e) => showTooltip(e, "Reset World [N]")}
            onMouseLeave={hideTooltip}
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-[10px] font-bold">[N]</span>
          </button>
      </div>
    </div>
  );
};