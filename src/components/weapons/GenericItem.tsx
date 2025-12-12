import React from 'react';

interface GenericItemProps {
  color: string;
}

export const GenericItem: React.FC<GenericItemProps> = ({ color }) => {
  return (
    <mesh rotation={[0, Math.PI / 4, 0]}>
       <boxGeometry args={[0.2, 0.2, 0.2]} />
       <meshStandardMaterial color={color} />
    </mesh>
  );
};
