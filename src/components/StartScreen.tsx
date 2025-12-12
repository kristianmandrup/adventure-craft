import React, { useEffect, useState } from 'react';
import { StartTitlePanel } from './ui/start/StartTitlePanel';
import { StartControlsPanel } from './ui/start/StartControlsPanel';
import { loadGame } from '../utils/storage';
import { getCloudSaveInfo, CloudSaveMetadata } from '../utils/cloudSaves';

import { GameMode } from '../types';

interface StartScreenProps {
  onStart: (mode: 'CREATIVE' | 'ADVENTURE', gameMode: GameMode) => void;
  onContinue: () => void;
  userId: string | null;
  isAuthLoading: boolean;
  isLoadingContinue: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onStart, 
  onContinue, 
  userId, 
  isAuthLoading,
  isLoadingContinue 
}) => {
  const [hasSave, setHasSave] = useState(false);
  const [cloudSaveInfo, setCloudSaveInfo] = useState<CloudSaveMetadata | null>(null);
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);

  // Check local save
  useEffect(() => {
      const save = loadGame();
      if (save) setHasSave(true);
  }, []);

  // Check cloud save when authenticated
  useEffect(() => {
      if (!userId) return;
      
      setIsCheckingCloud(true);
      getCloudSaveInfo(userId).then(info => {
          setCloudSaveInfo(info);
          if (info.exists) setHasSave(true);
          setIsCheckingCloud(false);
      });
  }, [userId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && !isLoadingContinue) {
         if (hasSave) onContinue();
          else onStart('CREATIVE', 'NORMAL');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart, onContinue, hasSave, isLoadingContinue]);

  const formatLastPlayed = (date?: Date) => {
      if (!date) return '';
      const diff = Date.now() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return 'Just now';
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm text-white">
      <div className="max-w-6xl w-full p-8 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center">
        <div>
          <StartTitlePanel onStart={onStart} onContinue={onContinue} hasSave={hasSave} />
          
          {/* Cloud Status Indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            {isAuthLoading || isCheckingCloud ? (
              <span className="text-gray-500 animate-pulse">☁️ Connecting to cloud...</span>
            ) : userId ? (
              <span className="text-green-400">☁️ Cloud connected</span>
            ) : (
              <span className="text-gray-500">☁️ Offline mode</span>
            )}
            
            {cloudSaveInfo?.exists && (
              <span className="text-gray-400 ml-2">
                • Lv.{cloudSaveInfo.playerLevel} {cloudSaveInfo.gameMode}
                {cloudSaveInfo.lastPlayed && ` • ${formatLastPlayed(cloudSaveInfo.lastPlayed)}`}
              </span>
            )}
          </div>
          
          {isLoadingContinue && (
            <div className="mt-2 text-yellow-400 animate-pulse">
              Loading save...
            </div>
          )}
        </div>
        <StartControlsPanel />
      </div>
    </div>
  );
};