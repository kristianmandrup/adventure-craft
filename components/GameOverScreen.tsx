import React from 'react';

interface GameOverScreenProps {
  onRestart: () => void;
  reason?: string;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, reason = "You have perished." }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-1000">
      <h1 className="text-6xl md:text-8xl font-black text-red-600 tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" style={{ fontFamily: 'Cinzel, serif' }}>
        GAME OVER
      </h1>
      <p className="text-xl md:text-2xl text-gray-400 mb-12 tracking-wider font-light">{reason}</p>
      
      <button 
        onClick={onRestart}
        className="group relative px-8 py-4 bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all duration-300 rounded-lg overflow-hidden"
      >
        <div className="absolute inset-0 w-0 bg-red-800 transition-all duration-[250ms] ease-out group-hover:w-full opacity-20"></div>
        <span className="relative text-white font-bold tracking-[0.2em] text-lg">RESTART LEGEND</span>
      </button>
      
      <div className="mt-8 text-white/20 text-xs tracking-widest uppercase">
          Press any key to restart
      </div>
    </div>
  );
};
