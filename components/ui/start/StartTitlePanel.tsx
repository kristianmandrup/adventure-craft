import React from 'react';

interface StartTitlePanelProps {
  onStart: () => void;
}

export const StartTitlePanel: React.FC<StartTitlePanelProps> = ({ onStart }) => {
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
       
       <div className="mt-4">
           <button 
             onClick={onStart}
             className="group relative px-8 py-5 bg-white text-black font-bold text-xl rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
           >
             <span className="relative z-10 flex items-center gap-3">
               START ADVENTURE <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"/>
             </span>
             <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-green-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
           </button>
           <p className="mt-4 text-sm text-gray-500 font-mono pl-1">
             Press SPACE or ENTER to start
           </p>
       </div>
    </div>
  );
};