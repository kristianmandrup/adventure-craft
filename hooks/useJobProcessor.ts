import { useState, useCallback } from 'react';
import { Job, Block } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateStructure, generateCharacter, generateItem } from '../services/geminiService';

interface UseJobProcessorProps {
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  BASE_SIZE: number;
  expansionLevel: number;
  EXPANSION_STEP: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setCharacters: React.Dispatch<React.SetStateAction<import('../types').Character[]>>;
  setInventory: React.Dispatch<React.SetStateAction<import('../types').InventoryItem[]>>;
  setSpawnMarkers: React.Dispatch<React.SetStateAction<import('../types').SpawnMarker[]>>;
}

export const useJobProcessor = ({
  setJobs, targetPosRef, BASE_SIZE, expansionLevel, EXPANSION_STEP,
  blocks, setBlocks, setCharacters, setInventory, setSpawnMarkers
}: UseJobProcessorProps) => {

  const updateJobStatus = useCallback((id: string, status: Job['status'], message?: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status, message } : j));
    setTimeout(() => setJobs(prev => prev.filter(j => j.id !== id)), 5000);
  }, [setJobs]);

  const processJob = useCallback(async (job: Job, count: number) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'generating' } : j));
    try {
      let centerX = 0, centerY = 1, centerZ = 0;
      let useTarget = false;

      if (targetPosRef.current) {
        [centerX, centerY, centerZ] = targetPosRef.current;
        useTarget = true;
      } else {
        const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
        centerX = (Math.random() * range * 2) - range;
        centerZ = (Math.random() * range * 2) - range;
      }

      if (job.type === 'ITEM') {
          const cleanPrompt = job.prompt.replace(/^\d+x\s/, '');
          const response = await generateItem(cleanPrompt);
          
          setInventory(prev => {
              const existing = prev.find(i => i.type === response.name);
              if (existing) {
                  return prev.map(i => i.type === response.name ? { ...i, count: i.count + count } : i);
              }
              return [...prev, { type: response.name, count: count, color: response.color }];
          });
          updateJobStatus(job.id, 'success', `Created ${response.name}`);
          
      } else if (job.type === 'STRUCTURE') {
        const response = await generateStructure(job.prompt, blocks.length);
        const newBlocks: Block[] = [];
        const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);

        for (let i = 0; i < count; i++) {
          let spawnX = centerX;
          let spawnZ = centerZ;
          let spawnY = centerY;
          
          if (!useTarget) {
              spawnX = (Math.random() * range * 2) - range;
              spawnZ = (Math.random() * range * 2) - range;
              spawnY = 1; 
          } else if (count > 1) {
             spawnX += (Math.random() * 10 - 5);
             spawnZ += (Math.random() * 10 - 5);
          }

          setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawnX, z: spawnZ, timestamp: Date.now() }]);

          response.blocks.forEach(b => {
             newBlocks.push({
               ...b,
               id: uuidv4(),
               x: b.x + Math.round(spawnX),
               y: b.y + Math.round(spawnY), 
               z: b.z + Math.round(spawnZ),
             });
          });
        }

        setBlocks(prev => {
           const keys = new Set(prev.map(b => `${b.x},${b.y},${b.z}`));
           return [...prev, ...newBlocks.filter(b => !keys.has(`${b.x},${b.y},${b.z}`))];
        });
        updateJobStatus(job.id, 'success', `Built ${response.description}`);
      
      } else {
        const response = await generateCharacter(job.prompt);
        const newChars: any[] = [];
        
        for (let i = 0; i < count; i++) {
            let spawnX = centerX;
            let spawnZ = centerZ;
            let spawnY = centerY;

            if (!useTarget) {
                 spawnX = (Math.random() * (BASE_SIZE + expansionLevel * EXPANSION_STEP) * 2) - BASE_SIZE;
                 spawnZ = (Math.random() * (BASE_SIZE + expansionLevel * EXPANSION_STEP) * 2) - BASE_SIZE;
                 spawnY = 5;
            } else if (count > 1) {
                 spawnX += (Math.random() * 8 - 4);
                 spawnZ += (Math.random() * 8 - 4);
            }

            setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawnX, z: spawnZ, timestamp: Date.now() }]);

            const maxHp = job.isGiant ? 100 : 20;

            newChars.push({
              id: uuidv4(),
              name: response.description,
              position: [spawnX, spawnY, spawnZ],
              rotation: 0,
              parts: response.parts,
              maxHp: maxHp,
              hp: maxHp,
              isEnemy: !!job.isEnemy,
              isGiant: !!job.isGiant,
              isFriendly: !!job.isFriendly,
              isAquatic: !!job.isAquatic
            });
        }
        setCharacters(prev => [...prev, ...newChars]);
        updateJobStatus(job.id, 'success');
      }
    } catch (error) {
      console.error(error);
      updateJobStatus(job.id, 'error', 'Failed');
    }
  }, [setJobs, targetPosRef, BASE_SIZE, expansionLevel, EXPANSION_STEP, blocks, setBlocks, setCharacters, setInventory, setSpawnMarkers, updateJobStatus]);

  const addJob = useCallback((type: import('../types').GenerationMode, prompt: string, count: number, isEnemy?: boolean, isGiant?: boolean, isFriendly?: boolean, isAquatic?: boolean) => {
    const newJob: Job = { id: uuidv4(), type, prompt: `${count}x ${prompt}`, status: 'pending', isEnemy, isGiant, isFriendly, isAquatic };
    setJobs(prev => [newJob, ...prev]);
    processJob(newJob, count);
  }, [setJobs, processJob]);

  return { addJob };
};
