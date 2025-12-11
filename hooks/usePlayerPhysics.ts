import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block } from '../types';
import { resolveCollision, JUMP_FORCE, SPEED, MAX_SPRINT_SPEED, ACCELERATION, DECELERATION } from '../utils/physics';

const FIXED_TIME_STEP = 1 / 60;
const MAX_FRAME_TIME = 0.1;

interface UsePlayerPhysicsProps {
  controlsRef: React.RefObject<any>;
  blockMap: Map<string, Block>;
  positionRef: React.MutableRefObject<THREE.Vector3>;
  rainGroupRef: React.RefObject<THREE.Group>;
  viewMode: 'FP' | 'OVERHEAD';
  setIsLocked: (locked: boolean) => void;
  respawnTrigger: number;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  resetViewTrigger: number;
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
}

export const usePlayerPhysics = ({
  controlsRef, blockMap, positionRef, rainGroupRef, viewMode, setIsLocked, respawnTrigger, targetPosRef, resetViewTrigger, playerPosRef
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
  const accumulator = useRef(0);
  const lastKey = useRef<string>('');
  const physicsMode = useRef<'ACCELERATION' | 'DIRECT'>('ACCELERATION');
  const [camAngle, setCamAngle] = useState({ pitch: 0, yaw: 0 });
  const [debugInfo, setDebugInfo] = useState({ speed: 0, moving: false, locked: false, keys: '', mode: 'ACCELERATION' });

  // Input Listeners
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === 'INPUT') return;
      
      // Track last key
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.code)) {
         lastKey.current = event.code.replace('Key', '').replace('Arrow', '');
      }

      switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward.current = true; break;
        case 'ArrowLeft': case 'KeyA': moveLeft.current = true; break;
        case 'ArrowDown': case 'KeyS': moveBackward.current = true; break;
        case 'ArrowRight': case 'KeyD': moveRight.current = true; break;
        case 'KeyH': 
          if (controlsRef.current) {
               // Reset pitch to 0 (Level View)
               const cameraObj = controlsRef.current.getObject();
               if (cameraObj) cameraObj.rotation.x = 0;
          }
          break;
        case 'KeyP':
          physicsMode.current = physicsMode.current === 'ACCELERATION' ? 'DIRECT' : 'ACCELERATION';
          break;
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
       
       // Find a random non-water spawn location
       let spawnX = 0, spawnZ = 0;
       
       // Collect all valid surface blocks (not water)
       const surfaceBlocks: { x: number; z: number; y: number }[] = [];
       const processedPositions = new Set<string>();
       
       for (const b of blockMap.values()) {
         const key = `${Math.round(b.x)},${Math.round(b.z)}`;
         if (!processedPositions.has(key) && b.type !== 'water') {
           // Find the highest non-water block at this x,z
           let maxY = b.y;
           for (const b2 of blockMap.values()) {
             if (Math.round(b2.x) === Math.round(b.x) && 
                 Math.round(b2.z) === Math.round(b.z) && 
                 b2.type !== 'water' && 
                 b2.y > maxY) {
               maxY = b2.y;
             }
           }
           surfaceBlocks.push({ x: b.x, z: b.z, y: maxY });
           processedPositions.add(key);
         }
       }
       
       // Pick a random valid surface block
       if (surfaceBlocks.length > 0) {
         const randomBlock = surfaceBlocks[Math.floor(Math.random() * surfaceBlocks.length)];
         spawnX = randomBlock.x;
         spawnZ = randomBlock.z;
         velocity.current.set(0, 0, 0);
         // Update Ref directly
         positionRef.current.copy(new THREE.Vector3(spawnX, randomBlock.y + 3, spawnZ));
       } else {
         // Fallback to origin if no valid blocks
         velocity.current.set(0, 0, 0);
         positionRef.current.copy(new THREE.Vector3(0, 30, 0));
       }
    }
  }, [respawnTrigger, positionRef, blockMap, viewMode, targetPosRef]);

  useEffect(() => {
    if (resetViewTrigger > 0 && viewMode === 'FP') camera.rotation.x = 0;
  }, [resetViewTrigger, viewMode, camera]);

  useEffect(() => {
    if (viewMode === 'OVERHEAD') camera.position.set(0, 30, 30);
  }, [viewMode, camera]);

  // Physics Loop (Fixed Time Step)
  useFrame((state, delta) => {
    // 1. Accumulate frame time
    let frameTime = delta;
    if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME; // Prevent spiral of death
    accumulator.current += frameTime;

    // 2. Camera Angle Updates (Per Frame)
    if (viewMode === 'FP') {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const pitch = Math.asin(dir.y);
      const yaw = Math.atan2(dir.x, dir.z);
      setCamAngle({ pitch: Math.round(THREE.MathUtils.radToDeg(pitch)), yaw: Math.round(THREE.MathUtils.radToDeg(yaw)) });
    }

    // 3. Fixed Step Physics
    while (accumulator.current >= FIXED_TIME_STEP) {
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

              if (moveDir.lengthSq() > 0) runTimer.current += FIXED_TIME_STEP;
              else runTimer.current = 0;
              
              // Switch logic based on mode
              if (physicsMode.current === 'DIRECT') {
                 // DIRECT MODE: Instant Velocity
                 const speed = runTimer.current > 0.2 ? MAX_SPRINT_SPEED : SPEED;
                 if (moveDir.lengthSq() > 0) {
                    velocity.current.x = moveDir.x * speed;
                    velocity.current.z = moveDir.z * speed;
                 } else {
                    velocity.current.x = 0;
                    velocity.current.z = 0;
                 }
              } else {
                 // ACCELERATION MODE: Momentum-based
                  const targetSpeed = moveDir.lengthSq() > 0 
                      ? (runTimer.current > 0.2 ? MAX_SPRINT_SPEED : SPEED) 
                      : 0;
                  const currentPlanarSpeed = Math.sqrt(velocity.current.x**2 + velocity.current.z**2);
                  const accel = moveDir.lengthSq() > 0 ? ACCELERATION : DECELERATION;
                  
                  let newSpeed = currentPlanarSpeed;
                  const diff = targetSpeed - newSpeed;
                  const step = accel * FIXED_TIME_STEP;
                  
                  if (Math.abs(diff) <= step) newSpeed = targetSpeed;
                  else newSpeed += Math.sign(diff) * step;
                  
                  if (moveDir.lengthSq() > 0) {
                    velocity.current.x = moveDir.x * newSpeed;
                    velocity.current.z = moveDir.z * newSpeed;
                  } else {
                    const drag = DECELERATION * FIXED_TIME_STEP;
                    if (currentPlanarSpeed < drag) {
                        velocity.current.x = 0;
                        velocity.current.z = 0;
                    } else {
                        const ratio = (currentPlanarSpeed - drag) / currentPlanarSpeed;
                        velocity.current.x *= ratio;
                        velocity.current.z *= ratio;
                    }
                  }
              }

              const result = resolveCollision(positionRef.current, velocity.current, FIXED_TIME_STEP, blockMap);
              positionRef.current.copy(result.position);
              velocity.current = result.velocity;
              canJump.current = result.onGround;
            }
        } else {
            if (isLocked.current) {
                document.exitPointerLock();
                isLocked.current = false;
                setIsLocked(false);
            }
        }
        accumulator.current -= FIXED_TIME_STEP;
    }

    // 4. Update Visuals (Per Frame)
    // Update camera position to follow player (Interpolation could be added here later)
    if (viewMode === 'FP') {
         camera.position.copy(positionRef.current).add(new THREE.Vector3(0, 0.6, 0));
    }
    
    // Update Rain Group
    if (rainGroupRef.current) {
        rainGroupRef.current.position.copy(positionRef.current);
    }

    // Debug Info Update
    const keys = [
      moveForward.current ? 'W' : '',
      moveLeft.current ? 'A' : '',
      moveBackward.current ? 'S' : '',
      moveRight.current ? 'D' : '',
    ].filter(Boolean).join('');
    
    if (viewMode === 'FP' && isLocked.current) {
          const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.z ** 2);
          let bearing = 0;
          let directionStr = "N";
          if (speed > 0.1) {
             bearing = Math.atan2(velocity.current.x, velocity.current.z) * (180 / Math.PI);
             if (bearing < 0) bearing += 360;
             const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
             directionStr = dirs[Math.round(bearing / 45)];
          }

          setDebugInfo({
            speed: Math.round(speed * 10) / 10,
            moving: speed > 0.1,
            locked: isLocked.current,
            keys,
            // @ts-ignore
            direction: directionStr,
            heading: Math.round(bearing),
            lastKey: lastKey.current || 'NONE',
            keyDuration: runTimer.current > 0 ? (runTimer.current).toFixed(2) + 's' : '0.00s',
            mode: physicsMode.current
          });
    } else {
       setDebugInfo(prev => ({ ...prev, locked: isLocked.current, keys }));
    }
  });

  return { isLocked, camAngle, debugInfo };
};