import React, { useMemo } from 'react';

export const RainSystem = () => {
  const rainCount = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
        pos[i*3] = (Math.random() - 0.5) * 50;
        pos[i*3+1] = Math.random() * 40;
        pos[i*3+2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);
  
  return (
    <points>
        <bufferGeometry>
            <bufferAttribute 
                attach="attributes-position" 
                count={rainCount} 
                itemSize={3} 
                array={positions} 
            />
        </bufferGeometry>
        <pointsMaterial color="#aaaaaa" size={0.1} transparent opacity={0.6} />
    </points>
  );
};
