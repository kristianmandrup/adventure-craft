import React, { createContext, useContext } from 'react';
import { Job, Quest, NotificationType, Character } from '../types';

interface UIContextValue {
  jobs: Job[];
  currentQuest: Quest | null;
  questMessage: string | null;
  onQuestUpdate: (type: string, amount: number) => void;
  notification: { message: string; type: NotificationType; subMessage?: string; duration?: number } | null;
  setNotification: (n: any) => void;
  showNotification: (message: string, type?: NotificationType, subMessage?: string) => void;
  activeDialogNpcId: string | null;
  setActiveDialogNpcId: (id: string | null) => void;
  chatHistory: Record<string, any[]>;
  shopOpen: boolean;
  setShopOpen: (open: boolean) => void;
  activeMerchant: Character | null;
  setActiveMerchant: (char: Character | null) => void;
  hasApiKey: boolean;
  gameMode: 'CREATIVE' | 'ADVENTURE';
}

const UIContext = createContext<UIContextValue | null>(null);

export const UIProvider: React.FC<{ value: UIContextValue; children: React.ReactNode }> = ({ value, children }) => {
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};
