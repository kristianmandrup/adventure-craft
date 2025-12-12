import React from 'react';

export const Axe = () => {
  return (
    <group rotation={[Math.PI/4, 0, 0]}>
      {/* Handle */}
      <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6]} />
          <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.25, 0.05]}>
          <boxGeometry args={[0.2, 0.15, 0.05]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
      </mesh>
    </group>
  );
};
