import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DroppedItem } from '../types';

interface ItemDropProps {
  item: DroppedItem;
}

export const ItemDrop: React.FC<ItemDropProps> = ({ item }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Bobbing
      meshRef.current.position.y = item.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.2;
      // Spinning
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[item.position.x, item.position.y, item.position.z]} castShadow>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.5} />
    </mesh>
  );
};
