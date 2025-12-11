import { useState, useEffect, useRef } from 'react';

interface UseUIStateProps {
  onReset: () => void;
  onRespawn: () => void;
  onExpand: () => void;
  onResetView: () => void;
  setActiveSlot: (slot: number) => void;
}

export const useUIState = ({ onReset, onRespawn, onExpand, onResetView, setActiveSlot }: UseUIStateProps) => {
  const [showCrafting, setShowCrafting] = useState(false);
  const [tooltip, setTooltip] = useState<{text: string, x: number, y: number} | null>(null);
  const [generationCount, setGenerationCount] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const showTooltip = (e: React.MouseEvent, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };
  
  const hideTooltip = () => setTooltip(null);
  
  const stopProp = (e: React.PointerEvent | React.MouseEvent) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
  };

  const toggleCrafting = () => setShowCrafting(prev => !prev);

  // Global Key Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement === inputRef.current;
      if (e.key === 'Enter') {
        if (!isInputFocused) {
           if (document.pointerLockElement) document.exitPointerLock();
           setTimeout(() => inputRef.current?.focus(), 10);
           e.preventDefault();
        }
        return;
      }
      if (isInputFocused) return;
      if (['1','2','3','4','5','6','7','8'].includes(e.key)) setActiveSlot(parseInt(e.key) - 1);
      switch(e.key.toLowerCase()) {
        case 'n': onReset(); break;
        case 'r': onRespawn(); break;
        case 'm': onExpand(); break;
        case 'h': onResetView(); break;
        case 'c': setShowCrafting(prev => !prev); break;
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onReset, onRespawn, onExpand, onResetView, setActiveSlot]);

  return {
    showCrafting,
    setShowCrafting,
    toggleCrafting,
    tooltip,
    showTooltip,
    hideTooltip,
    generationCount,
    setGenerationCount,
    inputRef,
    stopProp
  };
};
