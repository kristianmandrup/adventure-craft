import React from 'react';
import { Projectile } from '../types';

export const ProjectileMesh: React.FC<{ projectile: Projectile }> = ({ projectile }) => {
  return (
    <mesh position={projectile.position}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshBasicMaterial color={projectile.color} />
      <pointLight intensity={2} distance={3} color={projectile.color} />
    </mesh>
  );
};