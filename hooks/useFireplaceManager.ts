import { useState, useEffect, useCallback, useRef } from 'react';
import { Block } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getHeight } from '../utils/procedural';

interface UseFireplaceManagerProps {
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  worldSize?: number;
}

export const useFireplaceManager = ({ setBlocks, worldSize = 40 }: UseFireplaceManagerProps) => {
  const [tempFireplacePos, setTempFireplacePos] = useState<[number, number, number] | null>(null);
  const tempFireplaceIds = useRef<string[]>([]);
  const RESPAWN_INTERVAL = 60000; // 60 seconds

  const spawnTempFireplace = useCallback(() => {
    // Remove old fireplace blocks
    if (tempFireplaceIds.current.length > 0) {
      setBlocks(prev => prev.filter(b => !tempFireplaceIds.current.includes(b.id)));
      tempFireplaceIds.current = [];
    }

    // Pick random position
    const x = -worldSize/2 + Math.floor(Math.random() * worldSize);
    const z = -worldSize/2 + Math.floor(Math.random() * worldSize);
    const y = getHeight(x, z);
    
    if (y < 0) {
      // In water, try again next tick
      setTimeout(spawnTempFireplace, 1000);
      return;
    }

    const newBlocks: Block[] = [];
    
    // Stone base
    for (let fx = -1; fx <= 1; fx++) {
      for (let fz = -1; fz <= 1; fz++) {
        const id = uuidv4();
        tempFireplaceIds.current.push(id);
        newBlocks.push({ id, x: x + fx, y: y + 1, z: z + fz, color: '#525252', type: 'stone' });
      }
    }
    
    // Fire blocks
    const fireId1 = uuidv4();
    const fireId2 = uuidv4();
    tempFireplaceIds.current.push(fireId1, fireId2);
    newBlocks.push({ id: fireId1, x, y: y + 2, z, color: '#f97316', type: 'fire' });
    newBlocks.push({ id: fireId2, x, y: y + 3, z, color: '#ef4444', type: 'fire' });
    
    // Side stones
    const sideIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    tempFireplaceIds.current.push(...sideIds);
    newBlocks.push({ id: sideIds[0], x: x - 1, y: y + 2, z, color: '#404040', type: 'stone' });
    newBlocks.push({ id: sideIds[1], x: x + 1, y: y + 2, z, color: '#404040', type: 'stone' });
    newBlocks.push({ id: sideIds[2], x, y: y + 2, z: z - 1, color: '#404040', type: 'stone' });
    newBlocks.push({ id: sideIds[3], x, y: y + 2, z: z + 1, color: '#404040', type: 'stone' });

    setBlocks(prev => [...prev, ...newBlocks]);
    setTempFireplacePos([x, y, z]);
  }, [setBlocks, worldSize]);

  // Initial spawn and respawn interval
  useEffect(() => {
    // Spawn first temp fireplace after a short delay
    const initialDelay = setTimeout(spawnTempFireplace, 5000);
    
    // Respawn every 60 seconds
    const interval = setInterval(spawnTempFireplace, RESPAWN_INTERVAL);
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [spawnTempFireplace]);

  return {
    tempFireplacePos,
    spawnTempFireplace
  };
};
