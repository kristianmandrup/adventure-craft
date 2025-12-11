import React from 'react';

export const Pickaxe = () => {
  return (
    <group rotation={[Math.PI/4, 0, 0]}>
       {/* Handle */}
       <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6]} />
          <meshStandardMaterial color="#8b4513" />
       </mesh>
       {/* Head */}
       <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.3, 0.05, 0.05]} />
          <meshStandardMaterial color="#475569" metalness={0.6} />
       </mesh>
    </group>
  );
};
