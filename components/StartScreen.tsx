import React, { useEffect } from 'react';
import { StartTitlePanel } from './ui/start/StartTitlePanel';
import { StartControlsPanel } from './ui/start/StartControlsPanel';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm text-white">
      <div className="max-w-6xl w-full p-8 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center">
        <StartTitlePanel onStart={onStart} />
        <StartControlsPanel />
      </div>
    </div>
  );
};