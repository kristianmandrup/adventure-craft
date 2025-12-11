import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Cloud, PointerLockControls, Sky, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem, DroppedItem } from '../types';
import { TextureData } from '../utils/textures';
import { createBlockMap } from '../utils/physics';

import { Cube } from './Cube';
import { ProjectileMesh } from './ProjectileMesh';
import { ItemDrop } from './ItemDrop';
import { AnimatedCharacter } from './AnimatedCharacter';
import { WorldController } from './WorldController';
import { useRainAudio } from '../hooks/useRainAudio';

// Rain System Component
const RainSystem = () => {
  const rainCount = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
        pos[i*3] = (Math.random() - 0.5) * 50;
        pos[i*3+1] = Math.random() * 40;
        pos[i*3+2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);
  
  return (
    <points>
        <bufferGeometry>
            <bufferAttribute 
                attach="attributes-position" 
                count={rainCount} 
                itemSize={3} 
                array={positions} 
            />
        </bufferGeometry>
        <pointsMaterial color="#aaaaaa" size={0.1} transparent opacity={0.6} />
    </points>
  );
};

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
  viewMode: 'FP' | 'OVERHEAD' | 'TP';
  setViewMode: (mode: 'FP' | 'OVERHEAD' | 'TP') => void;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  resetViewTrigger: number;
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  onCharacterInteract: (char: Character) => void;
  onQuestUpdate: (type: string, amount: number) => void;
  playerStats: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
  onXpGain: (amount: number) => void;
  onGoldGain: (amount: number) => void;
  onDebugUpdate?: (info: any) => void;
  droppedItems: DroppedItem[];
  setDroppedItems: React.Dispatch<React.SetStateAction<DroppedItem[]>>;
  onNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error', subMessage?: string) => void;
}

export const VoxelWorld: React.FC<VoxelWorldProps> = ({ 
  blocks, setBlocks, characters, setCharacters, projectiles, setProjectiles, onDayChange, isDay, isRaining,
  setInventory, inventory, activeSlot, setPlayerHunger, setPlayerHp, respawnTrigger, viewMode, setViewMode,
  targetPosRef, resetViewTrigger, playerPosRef, onQuestUpdate, playerStats, onXpGain, onGoldGain, onDebugUpdate,
  droppedItems, setDroppedItems, onNotification, playerHp, playerHunger, onCharacterInteract
}) => {
  const positionRef = React.useRef<THREE.Vector3>(new THREE.Vector3(0, 10, 0));
  const rainGroupRef = React.useRef<THREE.Group>(null);
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
       
       {/* Stars with varying sizes */}
       <Stars radius={100} depth={50} count={3000} factor={2} saturation={0} fade speed={1} />
       <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={0.8} />
       <Stars radius={100} depth={50} count={500} factor={6} saturation={0} fade speed={0.5} />
       
       {/* Moon at night */}
       {!isDay && (
         <group position={[-60, 45, -60]}>
           {/* Moon glow */}
           <mesh>
             <sphereGeometry args={[8, 32, 32]} />
             <meshBasicMaterial color="#fffde7" transparent opacity={0.15} />
           </mesh>
           {/* Moon body */}
           <mesh>
             <sphereGeometry args={[5, 32, 32]} />
             <meshBasicMaterial color="#fffacd" />
           </mesh>
           {/* Subtle moonlight */}
           <pointLight color="#e3f2fd" intensity={0.3} distance={200} />
         </group>
       )}
       


       {isRaining && <group ref={rainGroupRef}><RainSystem /></group>}

       {viewMode === 'FP' || viewMode === 'TP' ? (
           <PointerLockControls 
              ref={controlsRef} 
              minPolarAngle={Math.PI / 4} 
              maxPolarAngle={3 * Math.PI / 4}
           />
       ) : (
           <OrbitControls makeDefault target={[0, 0, 0]} />
       )}
       
       <WorldController 
         blockMap={blockMap}
         positionRef={positionRef}
         rainGroupRef={rainGroupRef}
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
         playerStats={playerStats}
         onXpGain={onXpGain}
         onGoldGain={onGoldGain}
         onDebugUpdate={onDebugUpdate}
         droppedItems={droppedItems}
         setDroppedItems={setDroppedItems}
         onNotification={onNotification}
         playerHp={playerHp}
         playerHunger={playerHunger}
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
        
       {droppedItems.map(item => (
         <ItemDrop key={item.id} item={item} />
       ))}

       {characters.map(char => (
         <AnimatedCharacter key={char.id} character={char} onInteract={onCharacterInteract} />
       ))}
    </Canvas>
  );
};