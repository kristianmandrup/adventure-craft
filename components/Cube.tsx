import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getTextureType } from '../utils/textures';

interface CubeProps {
  position: [number, number, number];
  color: string;
  type?: string;
  size?: number;
  transparent?: boolean;
  textureMap: Record<string, THREE.Texture>;
  onClick?: (e: THREE.Event) => void;
}

export const Cube: React.FC<CubeProps> = React.memo(({ position, color, type, size = 1, transparent = false, textureMap, onClick }) => {
  const texKey = getTextureType(type);
  const texture = textureMap[texKey] || textureMap['default'];
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const isPortal = type === 'portal';

  useFrame((state) => {
    if (isPortal && materialRef.current) {
        const t = state.clock.getElapsedTime();
        // Pulse emissive intensity
        materialRef.current.emissiveIntensity = 1 + Math.sin(t * 4) * 0.5;
        // Subtle color shift
        const hue = (Math.sin(t) + 1) * 0.1 + 0.75; // 0.75 is purple-ish
        materialRef.current.emissive.setHSL(hue, 1, 0.5);
    }
  });

  return (
    <mesh position={position} castShadow={!isPortal} receiveShadow={!transparent} onClick={onClick}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial 
        ref={materialRef}
        color={color} 
        map={texture}
        roughness={isPortal ? 0.2 : 0.8} 
        metalness={isPortal ? 0.8 : 0}
        transparent={transparent || isPortal} 
        opacity={transparent ? 0.6 : isPortal ? 0.9 : 1}
        emissive={isPortal ? color : undefined}
        emissiveIntensity={isPortal ? 1 : 0}
      />
      {isPortal && (
        <pointLight color="#a855f7" distance={3} intensity={0.5} />
      )}
    </mesh>
  );
});