import React, { useEffect, useState } from 'react';
import { Scroll, CheckCircle2 } from 'lucide-react';
import { Quest } from '../../types';

interface QuestDisplayProps {
  quest: Quest | null;
  questMessage: string | null;
}

export const QuestDisplay: React.FC<QuestDisplayProps> = ({ quest, questMessage }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (questMessage) setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 3000);
    return () => clearTimeout(t);
  }, [questMessage]);

  if (questMessage) {
      return (
          <div className={`fixed top-1/4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${animate ? 'scale-110 opacity-100' : 'scale-90 opacity-0'}`}>
             <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-8 py-4 rounded-xl shadow-2xl border-4 border-yellow-300 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 mb-2 text-yellow-100" />
                <h2 className="text-3xl font-black uppercase tracking-wider drop-shadow-md">Quest Complete!</h2>
             </div>
          </div>
      );
  }

  if (!quest) return null;

  return (
    <div className="absolute top-32 right-6 w-64 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-xl pointer-events-none transition-all hover:bg-black/80">
      <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
         <Scroll className="w-5 h-5 text-yellow-400" />
         <h3 className="font-bold text-yellow-400 tracking-wide uppercase text-sm">Current Quest</h3>
      </div>
      
      <h4 className="font-bold text-lg leading-tight mb-3">{quest.title}</h4>
      
      <div className="space-y-2">
        {Object.entries(quest.requirements).map(([reqKey, reqAmount]) => {
            const current = quest.progress[reqKey] || 0;
            const isDone = current >= reqAmount;
            return (
                <div key={reqKey} className="flex justify-between items-center text-sm">
                    <span className={`capitalize ${isDone ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                        {reqKey.replace(/_/g, ' ')}
                    </span>
                    <span className={`font-mono font-bold ${isDone ? 'text-green-400' : 'text-white'}`}>
                        {Math.min(current, reqAmount)}/{reqAmount}
                    </span>
                </div>
            );
        })}
      </div>
    </div>
  );
};