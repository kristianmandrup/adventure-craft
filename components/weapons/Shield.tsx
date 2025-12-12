import React from 'react';

export const Shield = () => {
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Shield Main Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Shield Border */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.42, 0.52, 0.04]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.1, 0, -0.05]}>
        <boxGeometry args={[0.05, 0.1, 0.05]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>
    </group>
  );
};
