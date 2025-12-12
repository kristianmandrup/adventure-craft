import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Character } from '../types';

export const useCharacterAnimation = (
  character: Character, 
  groupRef: React.RefObject<THREE.Group>,
  refs: {
    leftLeg: React.RefObject<THREE.Group>;
    rightLeg: React.RefObject<THREE.Group>;
    leftArm: React.RefObject<THREE.Group>; 
    rightArm: React.RefObject<THREE.Group>;
  }
) => {
  const isSpider = character.name.toLowerCase().includes('spider');
  const isSorcerer = character.name.toLowerCase().includes('sorcerer');

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smooth position interpolation
    groupRef.current.position.lerp(new THREE.Vector3(...character.playerPos!), 0.1);
    
    // Smooth rotation
    let currentRot = groupRef.current.rotation.y;
    let targetRot = character.rotation;
    
    while (targetRot - currentRot > Math.PI) targetRot -= Math.PI * 2;
    while (targetRot - currentRot < -Math.PI) targetRot += Math.PI * 2;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, targetRot, 0.1);

    // Animation Logic
    if (character.isMoving) {
      if (isSpider) {
          const time = state.clock.elapsedTime * 25; 
          const angle = Math.sin(time) * 0.3;

          if (refs.leftLeg.current) refs.leftLeg.current.rotation.x = angle;
          if (refs.rightLeg.current) refs.rightLeg.current.rotation.x = -angle;
          if (refs.leftArm.current) refs.leftArm.current.rotation.x = -angle;
          if (refs.rightArm.current) refs.rightArm.current.rotation.x = angle;
      } else {
          const time = state.clock.elapsedTime * (character.isGiant ? 5 : 10);
          const angle = Math.sin(time) * 0.5;

          if (refs.leftLeg.current) refs.leftLeg.current.rotation.x = angle;
          if (refs.rightLeg.current) refs.rightLeg.current.rotation.x = -angle;
          
          if (refs.leftArm.current) refs.leftArm.current.rotation.x = -angle;
          if (refs.rightArm.current) refs.rightArm.current.rotation.x = angle;
      }
    } else {
      const lerpFactor = 0.1;
      let armTarget = 0;
      if (isSorcerer) {
         const now = Date.now();
         const timeSince = now - (character.lastAttackTime || 0);
         const cooldown = 5000;
         if (timeSince > cooldown - 1500) armTarget = -1.5;
      }

      if (refs.leftLeg.current) refs.leftLeg.current.rotation.x = THREE.MathUtils.lerp(refs.leftLeg.current.rotation.x, 0, lerpFactor);
      if (refs.rightLeg.current) refs.rightLeg.current.rotation.x = THREE.MathUtils.lerp(refs.rightLeg.current.rotation.x, 0, lerpFactor);
      if (refs.leftArm.current) refs.leftArm.current.rotation.x = THREE.MathUtils.lerp(refs.leftArm.current.rotation.x, armTarget, lerpFactor);
      if (refs.rightArm.current) refs.rightArm.current.rotation.x = THREE.MathUtils.lerp(refs.rightArm.current.rotation.x, armTarget, lerpFactor);
    }
  });
};
