import React from 'react';

export const Bow = () => {
  return (
    <group rotation={[0, 0, Math.PI / 4]} position={[-0.1, 0, 0]}>
       {/* Bow Body */}
       <mesh>
          <torusGeometry args={[0.3, 0.02, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#8b4513" />
       </mesh>
       {/* String */}
       <mesh position={[0, 0, 0]}>
           <boxGeometry args={[0.6, 0.005, 0.005]} />
           <meshStandardMaterial color="#cccccc" />
       </mesh>
    </group>
  );
};
