import React from 'react';

export const Sword = () => {
  return (
    <group rotation={[Math.PI/4, 0, 0]}>
      {/* Blade */}
      <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.05, 0.6, 0.05]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Guard */}
      <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2]} />
          <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
};
