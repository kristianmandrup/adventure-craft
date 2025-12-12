import { useState, useEffect, useCallback, useRef } from 'react';
import { Block } from '../types';
import { generateInitialTerrain, generateExpansion, CaveSpawn } from '../utils/procedural';
import { v4 as uuidv4 } from 'uuid';
import { structurePrefabs } from '../utils/prefabs/structures';

export const useWorldState = (gameStarted: boolean) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isDay, setIsDay] = useState(true);
  const [isRaining, setIsRaining] = useState(false);
  const [expansionLevel, setExpansionLevel] = useState(0);
  
  // Portal State
  const [portalActive, setPortalActive] = useState(false);
  const [portalPosition, setPortalPosition] = useState<[number, number, number] | null>(null);
  const [portalColor, setPortalColor] = useState<string>('#a855f7'); // Default purple
  const [isUnderworld, setIsUnderworld] = useState(false);
  const [worldLevel, setWorldLevel] = useState(1);

  const BASE_SIZE = 40;
  const EXPANSION_STEP = 20;

  // Portal Variants
  const PORTAL_VARIANTS = [
      { color: '#a855f7', name: 'Purple' },
      { color: '#f97316', name: 'Orange' },
      { color: '#3b82f6', name: 'Blue' },
      { color: '#7f1d1d', name: 'Dark Red' },
      { color: '#ec4899', name: 'Pink' },
      { color: '#22c55e', name: 'Green' },
      { color: '#e2e8f0', name: 'Silver' },
      { color: '#000000', name: 'Void' }, // Black with white sparkles
  ];

  // Rain Cycle
  useEffect(() => {
      if (!gameStarted) return;
      const interval = setInterval(() => {
          if (Math.random() < 0.2) {
              setIsRaining(true);
              setTimeout(() => setIsRaining(false), 30000);
          }
      }, 60000); 
      return () => clearInterval(interval);
  }, [gameStarted]);

  // Portal Timer
  useEffect(() => {
    if (!gameStarted || portalActive) return;
    const delay = 60000 + Math.random() * 60000;
    const timeout = setTimeout(() => {
      const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
      const px = Math.floor(Math.random() * range * 2) - range;
      const pz = Math.floor(Math.random() * range * 2) - range;
      
      // Select Random Variant
      const variant = PORTAL_VARIANTS[Math.floor(Math.random() * PORTAL_VARIANTS.length)];
      setPortalColor(variant.color);

      setPortalPosition([px, 5, pz]);
      setPortalActive(true);
      
      // Blocks for portal
       const portalBlocks = structurePrefabs.portal.blocks.map(b => ({
        id: uuidv4(),
        x: b.x + px,
        y: b.y + 1,
        z: b.z + pz,
        color: b.type === 'portal' ? variant.color : b.color, // Apply variant color only to inner portal blocks
        type: b.type
      }));
      setBlocks(prev => [...prev, ...portalBlocks]);
    }, delay);
    return () => clearTimeout(timeout);
  }, [gameStarted, portalActive, expansionLevel]);

  const handleExpand = useCallback(() => {
    if (expansionLevel >= 3) return;
    const currentSize = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
    const newBlocks = generateExpansion(currentSize, EXPANSION_STEP);
    setBlocks(prev => [...prev, ...newBlocks]);
    setExpansionLevel(prev => prev + 1);
  }, [expansionLevel]);

  const handleShrink = useCallback(() => {
    if (expansionLevel <= 0) return;
    const newLevel = expansionLevel - 1;
    const newSize = BASE_SIZE + (newLevel * EXPANSION_STEP);
    setBlocks(prev => prev.filter(b => Math.abs(b.x) <= newSize && Math.abs(b.z) <= newSize));
    setExpansionLevel(newLevel);
  }, [expansionLevel]);

  const enterUnderworld = useCallback(() => {
     setIsUnderworld(true);
     setWorldLevel(2);
     setPortalActive(false); 
     setPortalPosition(null);

     import('../utils/procedural').then(({ generateUnderworldTerrain }) => {
         const { blocks: newBlocks } = generateUnderworldTerrain();
         setBlocks(newBlocks);
         setIsDay(false);
         setIsRaining(false);
     });
  }, []);

  return {
    blocks, setBlocks,
    isDay, setIsDay,
    isRaining, setIsRaining,
    expansionLevel, setExpansionLevel,
    portalActive, setPortalActive,
    portalPosition, setPortalPosition,
    portalColor, // Export color
    isUnderworld, setIsUnderworld,
    worldLevel, setWorldLevel,
    handleExpand, handleShrink,
    enterUnderworld,
    BASE_SIZE, EXPANSION_STEP
  };
};
