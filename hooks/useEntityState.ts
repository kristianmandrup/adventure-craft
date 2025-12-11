import { useState, useCallback, useEffect } from 'react';
import { Character, Projectile, SpawnMarker } from '../types';
import * as THREE from 'three';

export const useEntityState = (gameStarted: boolean, isUnderworld: boolean) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [spawnMarkers, setSpawnMarkers] = useState<SpawnMarker[]>([]);
  const [droppedItems, setDroppedItems] = useState<import('../types').DroppedItem[]>([]);

  const ENTITY_CAPS = {
    enemies: 20,
    friendlyNpcs: 10,
    animals: 10,
    structures: 10
  };

  const getEntityCounts = useCallback(() => {
    const enemies = characters.filter(c => c.isEnemy).length;
    const animals = characters.filter(c => !c.isEnemy && !c.isFriendly).length;
    const friendlyNpcs = characters.filter(c => c.isFriendly).length;
    return { enemies, animals, friendlyNpcs };
  }, [characters]);

  // Clean Spawn Markers
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        setSpawnMarkers(prev => prev.filter(m => now - m.timestamp < 30000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const spawnDroppedItem = useCallback((item: string, count: number, position: [number, number, number]) => {
     const velocity = { x: (Math.random() - 0.5), y: 1, z: (Math.random() - 0.5) }; // Simplified Vector3 to plain obj if needed, or stick to THREE if available. 
     // Let's assume passed position is array
     
     let color = '#ffffff';
     if (item === 'weapon') color = '#06b6d4';
     else if (item === 'apple') color = '#ef4444';
     else if (item === 'shield') color = '#94a3b8';
     else if (item === 'bow') color = '#8b4513';
     else if (item === 'pickaxe') color = '#fbbf24';
     else if (item === 'axe') color = '#78716c';
     else if (item === 'arrows') color = '#d6d3d1';
     else if (item === 'torch') color = '#f59e0b';
     else if (item === 'meat') color = '#ef4444';

     // We need uuidv4. Assuming it's imported or we pass id? Wrapper hook usually handles imports.
     // If uuidv4 not imported in this hook, we need to add it.
     
     setDroppedItems(prev => [...prev, {
        id: crypto.randomUUID(), // Use native if uuid not available? Or assume uuid imported. 
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
