import { useState, useCallback, useEffect } from 'react';
import { Character, Projectile, SpawnMarker } from '../types';
import * as THREE from 'three';
import { getItemColor } from '../colors';
import { ENTITIES } from '../constants';

export const useEntityState = (gameStarted: boolean, isUnderworld: boolean) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [spawnMarkers, setSpawnMarkers] = useState<SpawnMarker[]>([]);
  const [droppedItems, setDroppedItems] = useState<import('../types').DroppedItem[]>([]);

  const ENTITY_CAPS = ENTITIES.CAPS;

  const getEntityCounts = useCallback(() => {
    const enemies = characters.filter(c => c.isEnemy).length;
    const animals = characters.filter(c => !c.isEnemy && !c.isFriendly).length;
    const friendlyNpcs = characters.filter(c => c.isFriendly).length;
    return { enemies, animals, friendlyNpcs };
  }, [characters]);

  // Clean Spawn Markers & Cooked Items
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        setSpawnMarkers(prev => prev.filter(m => now - m.timestamp < 30000));
        
        // Despawn cooked items after 10s
        setDroppedItems(prev => {
           const hasOldCooked = prev.some(item => item.type.includes('cooked') && now - (item.createdAt || 0) > 10000);
           if (!hasOldCooked) return prev;
           return prev.filter(item => !(item.type.includes('cooked') && now - (item.createdAt || 0) > 10000));
        });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const spawnDroppedItem = useCallback((item: string, count: number, position: [number, number, number]) => {
     const velocity = { x: (Math.random() - 0.5), y: 1, z: (Math.random() - 0.5) }; 
     
     const color = getItemColor(item);

     // We need uuidv4. Assuming it's imported or we pass id? Wrapper hook usually handles imports.
     // If uuidv4 not imported in this hook, we need to add it.
     
     setDroppedItems(prev => [...prev, {
        id: crypto.randomUUID(), 
        type: item,
        count,
        position: new THREE.Vector3(position[0], position[1], position[2]),
        velocity: new THREE.Vector3(velocity.x, velocity.y, velocity.z),
        color,
        createdAt: Date.now()
     }]);
  }, []);

  return {
    characters, setCharacters,
    projectiles, setProjectiles,
    spawnMarkers, setSpawnMarkers,
    droppedItems, setDroppedItems,
    getEntityCounts, ENTITY_CAPS,
    spawnDroppedItem
  };
};
