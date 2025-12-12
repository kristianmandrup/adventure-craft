import React, { useEffect, useState } from 'react';
import { StartTitlePanel } from './ui/start/StartTitlePanel';
import { StartControlsPanel } from './ui/start/StartControlsPanel';
import { loadGame } from '../utils/storage';

interface StartScreenProps {
  onStart: (mode: 'CREATIVE' | 'ADVENTURE') => void;
  onContinue: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onContinue }) => {
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
      const save = loadGame();
      if (save) setHasSave(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
         if (hasSave) onContinue();
         else onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart, onContinue, hasSave]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm text-white">
      <div className="max-w-6xl w-full p-8 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center">
        <StartTitlePanel onStart={onStart} onContinue={onContinue} hasSave={hasSave} />
        <StartControlsPanel />
      </div>
    </div>
  );
};