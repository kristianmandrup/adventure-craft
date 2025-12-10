import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Cloud, PointerLockControls, Sky, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem } from '../types';
import { TextureData } from '../utils/textures';
import { createBlockMap } from '../utils/physics';

import { Cube } from './Cube';
import { ProjectileMesh } from './ProjectileMesh';
import { AnimatedCharacter } from './AnimatedCharacter';
import { WorldController } from './WorldController';
import { RainSystem } from './environment/RainSystem';
import { useRainAudio } from '../hooks/useRainAudio';

interface VoxelWorldProps {
  blocks: Block[];
  characters: Character[];
  projectiles: Projectile[];
  onDayChange: (isDay: boolean) => void;
  isDay: boolean;
  isRaining: boolean;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  playerHp: number;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  playerHunger: number;
  setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  activeSlot: number;
  respawnTrigger: number;
  viewMode: 'FP' | 'OVERHEAD';
  setViewMode: (mode: 'FP' | 'OVERHEAD') => void;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  resetViewTrigger: number;
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  onCharacterInteract: (char: Character) => void;
  onQuestUpdate: (type: string, amount: number) => void;
}

export const VoxelWorld: React.FC<VoxelWorldProps> = ({
  blocks, characters, onDayChange, isDay, isRaining, setBlocks, setCharacters,
  projectiles, setProjectiles,
  playerHp, setPlayerHp, playerHunger, setPlayerHunger,
  inventory, setInventory, activeSlot, respawnTrigger,
  viewMode, setViewMode, targetPosRef, resetViewTrigger, playerPosRef, onCharacterInteract, onQuestUpdate
}) => {
  const [position, setPosition] = React.useState<THREE.Vector3>(new THREE.Vector3(0, 10, 0));
  const controlsRef = React.useRef<any>(null);
  const [isLocked, setIsLocked] = React.useState(false);

  // Use the extracted audio hook
  useRainAudio(isRaining);

  const textureMap = useMemo(() => {
    const map: Record<string, THREE.Texture> = {};
    const loader = new THREE.TextureLoader();
    Object.entries(TextureData).forEach(([key, dataUrl]) => {
      map[key] = loader.load(dataUrl);
      map[key].magFilter = THREE.NearestFilter;
      map[key].minFilter = THREE.NearestFilter;
    });
    return map;
  }, []);

  const blockMap = useMemo(() => createBlockMap(blocks), [blocks]);

  return (
    <Canvas shadows camera={{ fov: 75 }}>
       <Sky sunPosition={isDay ? [100, 20, 100] : [100, -20, 100]} />
       <ambientLight intensity={isDay ? (isRaining ? 0.3 : 0.5) : 0.1} />
       <pointLight position={[10, 50, 10]} intensity={0.8} castShadow />
       
       <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
       <Cloud opacity={isRaining ? 0.8 : 0.5} speed={0.04} bounds={[10, 2, 10]} segments={20} position={[0, 25, 0]} color={isRaining ? '#555555' : 'white'}/>

       {isRaining && <group position={position}><RainSystem /></group>}

       {viewMode === 'FP' ? (
           <PointerLockControls ref={controlsRef} />
       ) : (
           <OrbitControls makeDefault target={[0, 0, 0]} />
       )}
       
       <WorldController 
         blockMap={blockMap}
         position={position}
         setPosition={setPosition}
         setBlocks={setBlocks}
         inventory={inventory}
         setInventory={setInventory}
         activeSlot={activeSlot}
         characters={characters}
         setCharacters={setCharacters}
         projectiles={projectiles}
         setProjectiles={setProjectiles}
         controlsRef={controlsRef}
         setIsLocked={setIsLocked}
         setPlayerHunger={setPlayerHunger}
         setPlayerHp={setPlayerHp}
         respawnTrigger={respawnTrigger}
         viewMode={viewMode}
         setViewMode={setViewMode}
         targetPosRef={targetPosRef}
         resetViewTrigger={resetViewTrigger}
         playerPosRef={playerPosRef}
         onQuestUpdate={onQuestUpdate}
       />

       {blocks.map(block => (
         <Cube 
           key={block.id}
           position={[block.x, block.y, block.z]}
           color={block.color}
           type={block.type}
           textureMap={textureMap}
           transparent={block.type === 'water' || block.type === 'leaf'}
         />
       ))}

       {projectiles.map(p => (
         <ProjectileMesh key={p.id} projectile={p} />
       ))}

       {characters.map(char => (
         <AnimatedCharacter key={char.id} character={char} onInteract={onCharacterInteract} />
       ))}
    </Canvas>
  );
};