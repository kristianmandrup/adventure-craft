import React from 'react';
import { Keyboard, Mouse, Gamepad2, Map as MapIcon, Hammer, RefreshCw } from 'lucide-react';

export const StartControlsPanel: React.FC = () => {
  return (
    <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
       <div className="absolute top-0 right-0 p-4 opacity-10">
           <Gamepad2 size={120} />
       </div>
       
       <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
         <Gamepad2 className="text-green-400" /> Controls Guide
       </h2>
       
       <div className="space-y-5 text-sm relative z-10">
         <div className="flex items-center justify-between border-b border-white/5 pb-2 hover:bg-white/5 px-2 rounded transition-colors">
           <span className="text-gray-400 flex items-center gap-3"><Keyboard size={18} className="text-blue-400"/> Move Character</span>
           <span className="font-mono font-bold bg-white/10 px-3 py-1 rounded text-white border border-white/10">WASD or Arrows</span>
         </div>
         
         <div className="flex items-center justify-between border-b border-white/5 pb-2 hover:bg-white/5 px-2 rounded transition-colors">
           <span className="text-gray-400 flex items-center gap-3"><Mouse size={18} className="text-blue-400"/> Action / Interact</span>
           <div className="flex gap-2">
             <span className="font-mono font-bold bg-white/10 px-3 py-1 rounded text-white border border-white/10">Left Click (Mine/Attack)</span>
             <span className="font-mono font-bold bg-white/10 px-3 py-1 rounded text-white border border-white/10">Right Click (Use/Talk)</span>
           </div>
         </div>

         <div className="flex items-center justify-between border-b border-white/5 pb-2 hover:bg-white/5 px-2 rounded transition-colors">
           <span className="text-gray-400 flex items-center gap-3 ml-8">Look Around</span>
           <span className="font-mono font-bold bg-white/10 px-3 py-1 rounded text-white border border-white/10">Mouse Move</span>
         </div>

         <div className="flex items-center justify-between border-b border-white/5 pb-2 hover:bg-white/5 px-2 rounded transition-colors">
           <span className="text-gray-400 flex items-center gap-3"><RefreshCw size={18} className="text-green-400"/> Switch Perspective</span>
           <span className="font-mono font-bold bg-white/10 px-3 py-1 rounded text-white border border-white/10">V</span>
         </div>

         <div className="flex items-center justify-between border-b border-white/5 pb-2 hover:bg-white/5 px-2 rounded transition-colors">
           <span className="text-gray-400 flex items-center gap-3"><MapIcon size={18} className="text-green-400"/> Expand World</span>
           <span className="font-mono font-bold bg-white/10 px-3 py-1 rounded text-white border border-white/10">M</span>
         </div>

         <div className="flex items-center justify-between border-b border-white/5 pb-2 hover:bg-white/5 px-2 rounded transition-colors">
           <span className="text-gray-400 flex items-center gap-3"><Hammer size={18} className="text-orange-400"/> Crafting Menu</span>
           <span className="font-mono font-bold bg-white/10 px-3 py-1 rounded text-white border border-white/10">C</span>
         </div>
         
          <div className="flex items-center justify-between hover:bg-white/5 px-2 rounded transition-colors pt-2">
           <span className="text-gray-400 flex items-center gap-3"><RefreshCw size={18} className="text-red-400"/> Respawn / Reset</span>
           <div className="flex gap-2">
             <span className="font-mono font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded">R</span>
             <span className="font-mono font-bold bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded">N</span>
           </div>
         </div>
       </div>
    </div>
  );
};