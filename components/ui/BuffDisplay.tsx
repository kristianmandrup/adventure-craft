import React from 'react';
import { Zap, Swords, Waves } from 'lucide-react';

interface ActiveBuff {
  type: 'swimming' | 'strength' | 'speed';
  remainingTime: number;
  effectValue: number;
}

interface BuffDisplayProps {
  activeBuffs: ActiveBuff[];
}

const BUFF_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  swimming: { icon: <Waves size={16} />, label: 'Water Walk', color: 'bg-cyan-500' },
  strength: { icon: <Swords size={16} />, label: 'Strength 2x', color: 'bg-orange-500' },
  speed: { icon: <Zap size={16} />, label: 'Speed 2x', color: 'bg-blue-500' },
};

export const BuffDisplay: React.FC<BuffDisplayProps> = ({ activeBuffs }) => {
  if (activeBuffs.length === 0) return null;
  
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
      {activeBuffs.map((buff, idx) => {
        const config = BUFF_CONFIG[buff.type];
        const seconds = Math.ceil(buff.remainingTime);
        const progress = (buff.remainingTime / 10) * 100;
        
        return (
          <div key={idx} className="bg-black/70 backdrop-blur-md rounded-lg p-2 px-3 flex items-center gap-2 border border-white/10 min-w-[140px]">
            <span className={`${config.color} p-1 rounded text-white`}>{config.icon}</span>
            <div className="flex-1">
              <div className="text-xs text-white font-bold">{config.label}</div>
              <div className="w-full h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full ${config.color} transition-all duration-100`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-lg font-mono text-white font-bold">{seconds}s</span>
          </div>
        );
      })}
    </div>
  );
};
