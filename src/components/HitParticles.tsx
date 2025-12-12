import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface HitParticleSystemRef {
  spawn: (position: THREE.Vector3, color: string, count?: number) => void;
}

export const HitParticleSystem = forwardRef<HitParticleSystemRef, {}>((_, ref) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Particle State: [x, y, z, vx, vy, vz, age, maxAge, r, g, b]
  // We'll manage state in a Float32Array for performance
  const maxParticles = 1000;
  const particleData = useMemo(() => {
      const data = new Float32Array(maxParticles * 11);
      // Initialize age to infinity (inactive)
      for(let i=0; i<maxParticles; i++) data[i*11 + 6] = 10000; 
      return data;
  }, []);
  
  const activeCount = useRef(0);

  useImperativeHandle(ref, () => ({
    spawn: (position: THREE.Vector3, colorString: string, count = 10) => {
      const color = new THREE.Color(colorString);
      
      let spawned = 0;
      for (let i = 0; i < maxParticles; i++) {
        if (spawned >= count) break;
        
        // Find inactive particle
        if (particleData[i * 11 + 6] > 5) { // Age > 5 means inactive/dead
           const idx = i * 11;
           // Pos
           particleData[idx] = position.x + (Math.random() - 0.5) * 0.5;
           particleData[idx + 1] = position.y + (Math.random() - 0.5) * 0.5;
           particleData[idx + 2] = position.z + (Math.random() - 0.5) * 0.5;
           // Vel (Explosive)
           particleData[idx + 3] = (Math.random() - 0.5) * 5;
           particleData[idx + 4] = (Math.random() - 0.5) * 5;
           particleData[idx + 5] = (Math.random() - 0.5) * 5;
           // Age
           particleData[idx + 6] = 0;
           particleData[idx + 7] = 0.5 + Math.random() * 0.5; // Max Age
           // Color
           particleData[idx + 8] = color.r;
           particleData[idx + 9] = color.g;
           particleData[idx + 10] = color.b;
           
           spawned++;
        }
      }
    }
  }));

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    let active = 0;
    for (let i = 0; i < maxParticles; i++) {
        const idx = i * 11;
        if (particleData[idx + 6] < particleData[idx + 7]) { // If alive
            // Update Age
            particleData[idx + 6] += delta;
            
            // Update Pos (Gravity)
            particleData[idx + 4] -= 9.8 * delta * 0.5; // Gravity
            particleData[idx] += particleData[idx + 3] * delta;
            particleData[idx + 1] += particleData[idx + 4] * delta;
            particleData[idx + 2] += particleData[idx + 5] * delta;
            
            // Render
            dummy.position.set(particleData[idx], particleData[idx + 1], particleData[idx + 2]);
            const scale = 1 - (particleData[idx + 6] / particleData[idx + 7]);
            dummy.scale.setScalar(Math.max(0, scale * 0.15));
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, new THREE.Color(particleData[idx + 8], particleData[idx + 9], particleData[idx + 10]));
            
            active++;
        } else {
             // Hide
             dummy.scale.set(0,0,0);
             dummy.updateMatrix();
             meshRef.current.setMatrixAt(i, dummy.matrix);
        }
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0.8} />
    </instancedMesh>
  );
});
