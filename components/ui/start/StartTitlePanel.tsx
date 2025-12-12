import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface StartTitlePanelProps {
  onStart: (mode: 'CREATIVE' | 'ADVENTURE') => void;
  onContinue?: () => void;
  hasSave?: boolean;
}

export const StartTitlePanel: React.FC<StartTitlePanelProps> = ({ onStart, onContinue, hasSave }) => {
  return (
    <div className="flex flex-col gap-6">
       <div>
         <h1 className="text-8xl font-black bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent mb-4 leading-tight flex flex-col">
           <span>Adventure</span>
           <span>Craft</span>
         </h1>
         <div className="h-2 w-32 bg-gradient-to-r from-blue-400 to-green-500 rounded-full"></div>
       </div>
       
       <p className="text-xl text-gray-300 leading-relaxed">
         Welcome to an infinite voxel world powered by Artificial Intelligence. 
         Command the AI to build massive structures, populate the world with creatures, 
         interact with NPCs, and craft your own adventure.
       </p>
       
       <div className="mt-4 flex gap-4">
           {hasSave && onContinue && (
               <button 
                 onClick={onContinue}
                 className="group relative px-8 py-5 bg-white text-black font-bold text-xl rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] flex-1"
               >
                 <span className="relative z-10 flex items-center justify-center gap-3">
                   CONTINUE <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"/>
                 </span>
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-green-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
               </button>
           )}

           <button 
             onClick={() => onStart('ADVENTURE')}
             className={`group relative px-6 py-5 ${hasSave ? 'bg-black/50 border border-white/20 text-white hover:bg-white/10' : 'bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]'} font-bold text-xl rounded-xl overflow-hidden transition-all active:scale-95 flex-1`}
           >
             <span className="relative z-10 flex items-center justify-center gap-2">
               ADVENTURE
             </span>
           </button>

           <button 
             onClick={() => onStart('CREATIVE')}
             className={`group relative px-6 py-5 bg-black/50 border border-white/20 text-white hover:bg-white/10 font-bold text-xl rounded-xl overflow-hidden transition-all active:scale-95 flex-1`}
           >
             <span className="relative z-10 flex items-center justify-center gap-2">
               CREATIVE
             </span>
           </button>
       </div>
       <p className="mt-4 text-sm text-gray-500 font-mono pl-1">
         {hasSave ? 'Press ENTER to continue' : 'Press SPACE or ENTER to start'}
       </p>
    </div>
  );
};