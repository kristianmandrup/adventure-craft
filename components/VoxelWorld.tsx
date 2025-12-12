import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Cloud, PointerLockControls, Sky, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem, DroppedItem, Equipment } from '../types';
import { TextureData } from '../utils/textures';
import { createBlockMap } from '../utils/physics';

import { Cube } from './Cube';
import { ProjectileMesh } from './ProjectileMesh';
import { ItemDrop } from './ItemDrop';
import { AnimatedCharacter } from './AnimatedCharacter';
import { WorldController } from './WorldController';
import { RainSystem } from './effects/RainSystem';
import { useAtmosphere } from '../hooks/useAtmosphere';
import { useRainAudio } from '../hooks/useRainAudio';
import { HitParticleSystem, HitParticleSystemRef } from './HitParticles';
import { PortalEffects } from './PortalEffects';

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
  onNotification: (message: string, type?: import('../types').NotificationType, subMessage?: string) => void;
  equipment: Equipment;
  portalPosition?: [number, number, number] | null;
  portalColor?: string;
  onEnterPortal?: () => void;
  isUnderworld: boolean;
}

export const VoxelWorld: React.FC<VoxelWorldProps> = ({ 
  blocks, setBlocks, characters, setCharacters, projectiles, setProjectiles, onDayChange, isDay, isRaining,
  setInventory, inventory, activeSlot, setPlayerHunger, setPlayerHp, respawnTrigger, viewMode, setViewMode,
  targetPosRef, resetViewTrigger, playerPosRef, onQuestUpdate, playerStats, onXpGain, onGoldGain, onDebugUpdate,
  droppedItems, setDroppedItems, onNotification, playerHp, playerHunger, onCharacterInteract, equipment,
  portalPosition, onEnterPortal, portalColor, isUnderworld
}) => {
  const positionRef = React.useRef<THREE.Vector3>(new THREE.Vector3(0, 10, 0));
  const rainGroupRef = React.useRef<THREE.Group>(null);
  const controlsRef = React.useRef<any>(null);
  const particleRef = React.useRef<HitParticleSystemRef>(null);
  const [isLocked, setIsLocked] = React.useState(false);

  // Use the extracted audio hook
  useRainAudio(isRaining);

  const { fogColor, fogDensity, lightningFlash } = useAtmosphere(isDay, isRaining, isUnderworld);

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
       <fog attach="fog" args={[fogColor, 10, isUnderworld ? 40 : (isDay ? 120 : 60)]} />
       
       {/* ... Sky/Light/Star code ... */}
       {!isUnderworld && <Sky sunPosition={isDay ? [100, 20, 100] : [100, -20, 100]} />}
       
       <ambientLight intensity={(isDay ? (isRaining ? 0.3 : 0.5) : 0.1) + lightningFlash} />
       <pointLight position={[10, 50, 10]} intensity={0.8} castShadow />
       
       <Stars radius={100} depth={50} count={3000} factor={2} saturation={0} fade speed={1} />
       <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={0.8} />
       <Stars radius={100} depth={50} count={500} factor={6} saturation={0} fade speed={0.5} />
       
       {!isDay && (
         <group position={[-60, 45, -60]}>
           <mesh><sphereGeometry args={[8, 32, 32]} /><meshBasicMaterial color="#fffde7" transparent opacity={0.15} /></mesh>
           <mesh><sphereGeometry args={[5, 32, 32]} /><meshBasicMaterial color="#fffacd" /></mesh>
           <pointLight color="#e3f2fd" intensity={0.3} distance={200} />
         </group>
       )}

       {isRaining && <group ref={rainGroupRef}><RainSystem /></group>}

       {viewMode === 'FP' || viewMode === 'TP' ? (
           <PointerLockControls ref={controlsRef} minPolarAngle={Math.PI / 4} maxPolarAngle={3 * Math.PI / 4} />
       ) : (
           <OrbitControls makeDefault target={[0, 0, 0]} />
       )}
       
       <HitParticleSystem ref={particleRef} />
        {portalPosition && <PortalEffects position={portalPosition} color={portalColor} />}

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
         droppedItems={droppedItems}
         setDroppedItems={setDroppedItems}
         onNotification={onNotification}
         playerHp={playerHp}
         playerHunger={playerHunger}
         onSpawnParticles={(pos, color) => particleRef.current?.spawn(pos, color)}
         equipment={equipment}
         portalPosition={portalPosition || null}
         onEnterPortal={onEnterPortal || (() => {})}
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