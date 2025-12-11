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
  const [isUnderworld, setIsUnderworld] = useState(false);
  const [worldLevel, setWorldLevel] = useState(1);

  const BASE_SIZE = 40;
  const EXPANSION_STEP = 20;



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
      setPortalPosition([px, 5, pz]);
      setPortalActive(true);
      // Blocks for portal need to be added. We will expose a helper or let the effect handle it if we have setBlocks
       const portalBlocks = structurePrefabs.portal.blocks.map(b => ({
        id: uuidv4(),
        x: b.x + px,
        y: b.y + 1,
        z: b.z + pz,
        color: b.color,
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

  return {
    blocks, setBlocks,
    isDay, setIsDay,
    isRaining, setIsRaining,
    expansionLevel, setExpansionLevel,
    portalActive, setPortalActive,
    portalPosition, setPortalPosition,
    isUnderworld, setIsUnderworld,
    worldLevel, setWorldLevel,
    handleExpand, handleShrink,
    BASE_SIZE, EXPANSION_STEP
  };
};
