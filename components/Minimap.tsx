import React, { useState } from 'react';
import { Character, Block, SpawnMarker } from '../types';
import { useMinimap, FilterType } from '../hooks/useMinimap';

interface MinimapProps {
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  characters: Character[];
  blocks: Block[];
  spawnMarkers?: SpawnMarker[];
}

export const Minimap: React.FC<MinimapProps> = ({ playerPosRef, characters, blocks, spawnMarkers = [] }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const { canvasRef, identifiedEntity, handleCanvasClick } = useMinimap({ 
      playerPosRef, characters, blocks, filter, spawnMarkers
  });

  const stopProp = (e: React.PointerEvent | React.MouseEvent) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
  };

  const filters: FilterType[] = ['ALL', 'FOES', 'ANIMALS', 'BUILDINGS', 'TREES'];

  return (
    <div 
      className="absolute bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-auto"
      onPointerDown={stopProp} 
      onClick={stopProp}
    >
       {identifiedEntity && (
           <div className="bg-black/80 text-white px-2 py-1 rounded text-xs animate-fade-in border border-white/20">
               {identifiedEntity}
           </div>
       )}
       
       <div className="bg-black/80 p-1 rounded-lg border border-white/20 flex flex-col gap-1 shadow-2xl">
          <canvas 
            ref={canvasRef} 
            width={150} 
            height={150} 
            className="rounded cursor-crosshair"
            onClick={handleCanvasClick}
          />
          <div className="flex gap-1 justify-center flex-wrap max-w-[150px]">
             {filters.map(f => (
                 <button 
                    key={f}
                    onClick={() => setFilter(f)} 
                    className={`text-[8px] px-1 py-0.5 rounded m-0.5 min-w-[30px] ${filter === f ? 'bg-white text-black font-bold' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                 >
                    {f === 'BUILDINGS' ? 'BLDGS' : f}
                 </button>
             ))}
          </div>
       </div>
    </div>
  );
};