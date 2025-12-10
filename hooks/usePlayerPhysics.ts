import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block } from '../types';
import { resolveCollision, JUMP_FORCE, SPEED } from '../utils/physics';

interface UsePlayerPhysicsProps {
  controlsRef: React.RefObject<any>;
  blockMap: Map<string, Block>;
  position: THREE.Vector3;
  setPosition: (v: THREE.Vector3) => void;
  viewMode: 'FP' | 'OVERHEAD';
  setIsLocked: (locked: boolean) => void;
  respawnTrigger: number;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  resetViewTrigger: number;
}

export const usePlayerPhysics = ({
  controlsRef, blockMap, position, setPosition, viewMode, setIsLocked, respawnTrigger, targetPosRef, resetViewTrigger
}: UsePlayerPhysicsProps) => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isLocked = useRef(false);
  const isRespawning = useRef(false);
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const canJump = useRef(false);
  const runTimer = useRef(0);
  const [camAngle, setCamAngle] = useState({ pitch: 0, yaw: 0 });

  // Input Listeners
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === 'INPUT') return;
      switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward.current = true; break;
        case 'ArrowLeft': case 'KeyA': moveLeft.current = true; break;
        case 'ArrowDown': case 'KeyS': moveBackward.current = true; break;
        case 'ArrowRight': case 'KeyD': moveRight.current = true; break;
        case 'Space': 
          if (canJump.current) velocity.current.y = JUMP_FORCE; 
          canJump.current = false;
          break;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward.current = false; break;
        case 'ArrowLeft': case 'KeyA': moveLeft.current = false; break;
        case 'ArrowDown': case 'KeyS': moveBackward.current = false; break;
        case 'ArrowRight': case 'KeyD': moveRight.current = false; break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Respawn & Reset Handlers
  useEffect(() => {
    if (respawnTrigger > 0) {
       isRespawning.current = true;
       let spawnX = 0, spawnZ = 0;
       if (viewMode === 'OVERHEAD' && targetPosRef.current) {
          spawnX = targetPosRef.current[0];
          spawnZ = targetPosRef.current[2];
       }
       let safeY = 30;
       let maxY = -100;
       let found = false;
       for (const b of blockMap.values()) {
          if (Math.round(b.x) === Math.round(spawnX) && Math.round(b.z) === Math.round(spawnZ)) {
             if (b.y > maxY) { maxY = b.y; found = true; }
          }
       }
       if (found) safeY = maxY + 5;
       velocity.current.set(0,0,0);
       setPosition(new THREE.Vector3(spawnX, safeY, spawnZ));
    }
  }, [respawnTrigger, setPosition, blockMap, viewMode, targetPosRef]);

  useEffect(() => {
    if (resetViewTrigger > 0 && viewMode === 'FP') camera.rotation.x = 0;
  }, [resetViewTrigger, viewMode, camera]);

  useEffect(() => {
    if (viewMode === 'OVERHEAD') camera.position.set(0, 30, 30);
  }, [viewMode, camera]);

  // Physics Loop
  useFrame((state, delta) => {
    // Camera Angle
    if (viewMode === 'FP') {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const pitch = Math.asin(dir.y);
      const yaw = Math.atan2(dir.x, dir.z);
      setCamAngle({ pitch: Math.round(THREE.MathUtils.radToDeg(pitch)), yaw: Math.round(THREE.MathUtils.radToDeg(yaw)) });
    }

    if (viewMode === 'FP') {
        if (controlsRef.current && controlsRef.current.isLocked !== isLocked.current) {
          isLocked.current = controlsRef.current.isLocked;
          setIsLocked(isLocked.current);
        }

        if (isRespawning.current) {
          isRespawning.current = false;
        } else if (isLocked.current) {
          const moveDir = new THREE.Vector3();
          const forward = new THREE.Vector3();
          const right = new THREE.Vector3();

          camera.getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();
          right.crossVectors(forward, camera.up).normalize();

          if (moveForward.current) moveDir.add(forward);
          if (moveBackward.current) moveDir.sub(forward);
          if (moveRight.current) moveDir.add(right);
          if (moveLeft.current) moveDir.sub(right);
          moveDir.normalize();

          if (moveDir.lengthSq() > 0) runTimer.current += delta;
          else runTimer.current = 0;
          
          const currentSpeed = runTimer.current > 1.0 ? SPEED * 2 : SPEED;

          velocity.current.x = moveDir.x * currentSpeed;
          velocity.current.z = moveDir.z * currentSpeed;

          const result = resolveCollision(position, velocity.current, delta, blockMap);
          setPosition(result.position);
          velocity.current = result.velocity;
          canJump.current = result.onGround;

          camera.position.copy(position).add(new THREE.Vector3(0, 0.6, 0));
        }
    } else {
        if (isLocked.current) {
            document.exitPointerLock();
            isLocked.current = false;
            setIsLocked(false);
        }
    }
  });

  return { isLocked, camAngle };
};