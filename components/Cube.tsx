import React from 'react';
import * as THREE from 'three';
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

  return (
    <mesh position={position} castShadow receiveShadow={!transparent} onClick={onClick}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial 
        color={color} 
        map={texture}
        roughness={0.8} 
        transparent={transparent} 
        opacity={transparent ? 0.6 : 1} 
      />
    </mesh>
  );
});