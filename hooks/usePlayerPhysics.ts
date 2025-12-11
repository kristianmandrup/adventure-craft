import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block } from '../types';
import { resolveCollision, JUMP_FORCE, SPEED, MAX_SPRINT_SPEED, ACCELERATION, DECELERATION } from '../utils/physics';

const FIXED_TIME_STEP = 1 / 60;
const MAX_FRAME_TIME = 0.1;
const THIRD_PERSON_OFFSET = new THREE.Vector3(0, 2, 4);

interface UsePlayerPhysicsProps {
  controlsRef: React.RefObject<any>;
  blockMap: Map<string, Block>;
  positionRef: React.MutableRefObject<THREE.Vector3>;
  rainGroupRef: React.RefObject<THREE.Group>;
  viewMode: 'FP' | 'OVERHEAD' | 'TP';
  setIsLocked: (locked: boolean) => void;
  respawnTrigger: number;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  resetViewTrigger: number;
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  hasMagicBoots: boolean; // New prop
}

export const usePlayerPhysics = ({
  controlsRef, blockMap, positionRef, rainGroupRef, viewMode, setIsLocked, respawnTrigger, targetPosRef, resetViewTrigger, playerPosRef, hasMagicBoots
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
  const isSprinting = useRef(false); // Track Shift key
  const runTimer = useRef(0);
  const accumulator = useRef(0);
  const lastKey = useRef<string>('');
  const physicsMode = useRef<'ACCELERATION' | 'DIRECT'>('ACCELERATION');
  
  // Magic Boots State
  const bootsActiveTime = useRef(0);
  const bootsCooldownEnd = useRef(0);
  
  const [camAngle, setCamAngle] = useState({ pitch: 0, yaw: 0 });
  const [debugInfo, setDebugInfo] = useState({ speed: 0, moving: false, locked: false, keys: '', mode: 'ACCELERATION', boost: 'READY' });

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
        case 'ShiftLeft': case 'ShiftRight': isSprinting.current = true; break;
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
          if (canJump.current) {
               const jumpMult = bootsActiveTime.current > 0 ? 1.5 : 1;
               velocity.current.y = JUMP_FORCE * jumpMult;
          }
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
        case 'ShiftLeft': case 'ShiftRight': isSprinting.current = false; break;
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
  // (SAME AS BEFORE - OMITTING FOR BREVITY IF NOT CHANGING, BUT TOOL REQUIRES FULL FILE OFTEN OR CHUNK)
  // Converting to chunks to be safe and efficient.
  useEffect(() => {
    if (respawnTrigger > 0) {
       isRespawning.current = true;
       let spawnX = 0, spawnZ = 0;
       const surfaceBlocks: { x: number; z: number; y: number }[] = [];
       const processedPositions = new Set<string>();
       for (const b of blockMap.values()) {
         const key = `${Math.round(b.x)},${Math.round(b.z)}`;
         if (!processedPositions.has(key) && b.type !== 'water') {
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
       if (surfaceBlocks.length > 0) {
         const randomBlock = surfaceBlocks[Math.floor(Math.random() * surfaceBlocks.length)];
         spawnX = randomBlock.x;
         spawnZ = randomBlock.z;
         velocity.current.set(0, 0, 0);
         positionRef.current.copy(new THREE.Vector3(spawnX, randomBlock.y + 3, spawnZ));
       } else {
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
    let frameTime = delta;
    if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME;
    accumulator.current += frameTime;

    const now = Date.now();
    
    // Magic Boots Activation
    if (isSprinting.current && hasMagicBoots && now > bootsCooldownEnd.current && bootsActiveTime.current <= 0) {
        bootsActiveTime.current = 2.0; // 2 Seconds Duration
        bootsCooldownEnd.current = now + 15000; // 15 Seconds Cooldown (starts after use?) User said "recharge for 15 secs before they can be used again". Usually cooldown starts after effect or activation. Let's make it start after activation for simplicity, effectively 15s cycle. Actually "Then must recharge", implies after use. 
        // Let's set cooldown to now + 2000 (duration) + 15000 (recharge).
        bootsCooldownEnd.current = now + 17000;
    }

    // Camera Angle Updates
    if (viewMode === 'FP' || viewMode === 'TP') {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const pitch = Math.asin(dir.y);
      const yaw = Math.atan2(dir.x, dir.z);
      setCamAngle({ pitch: Math.round(THREE.MathUtils.radToDeg(pitch)), yaw: Math.round(THREE.MathUtils.radToDeg(yaw)) });
    }

    while (accumulator.current >= FIXED_TIME_STEP) {
        // Boots Timer Step
        if (bootsActiveTime.current > 0) {
            bootsActiveTime.current -= FIXED_TIME_STEP;
        }

        if (viewMode === 'FP' || viewMode === 'TP') {
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
              
              // Speed Logic with Boost
              let currentMaxSpeed = MAX_SPRINT_SPEED;
              if (bootsActiveTime.current > 0) {
                  currentMaxSpeed *= 2; // Double Speed
              }
              const moveSpeed = runTimer.current > 0.2 ? currentMaxSpeed : SPEED;

              if (physicsMode.current === 'DIRECT') {
                 if (moveDir.lengthSq() > 0) {
                    velocity.current.x = moveDir.x * moveSpeed;
                    velocity.current.z = moveDir.z * moveSpeed;
                 } else {
                    velocity.current.x = 0;
                    velocity.current.z = 0;
                 }
              } else {
                  const targetSpeed = moveDir.lengthSq() > 0 ? moveSpeed : 0;
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
              
              // Sync playerPosRef for Minimap
              playerPosRef.current = [positionRef.current.x, positionRef.current.y, positionRef.current.z];
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

    // 4. Update Visuals
    if (viewMode === 'FP') {
         camera.position.copy(positionRef.current).add(new THREE.Vector3(0, 1.6, 0));
    } else if (viewMode === 'TP') {
         // Third Person Position
         const offset = THIRD_PERSON_OFFSET.clone();
         offset.applyEuler(new THREE.Euler(0, camAngle.yaw * (Math.PI / 180) + Math.PI, 0)); // Rotate offset to match player facing?
         // Actually, if we use PointerLockControls, the camera rotation is controlled by mouse.
         // In TP, we want the camera to be behind the player.
         // Let's attach relative to camera direction.
         const camDir = new THREE.Vector3();
         camera.getWorldDirection(camDir);
         camDir.y = 0;
         camDir.normalize();
         
         // -camDir is backward.
         const tpPos = positionRef.current.clone().add(new THREE.Vector3(0, 2, 0)).add(camDir.clone().multiplyScalar(-4));
         
         // Simple wall clip prevention could be added here, but for now just position.
         // Wait, if we set camera position every frame, PointerLockControls might fight it?
         // PointerLockControls updates the OBJECT attached to it.
         // Usually PLC controls the CAMERA.
         // If we move the camera manually, PLC might override or add to it.
         // Actually, typically in TP with PLC, the "Player" rotates, and camera follows.
         // Here, `camera` IS the thing being rotated by PLC.
         // So we can't move the camera away from its pivot easily without wrapping it.
         // BUT: standard PLC behavior rotates the camera in place.
         // If `viewMode` is TP, we might need a different control scheme or just offset the rendering?
         // No, simpler: In TP, we still want to look around.
         // Let's try: Position camera manually, but let PLC handle rotation? 
         // If we set camera.position, PLC doesn't reset it.
         // So: 
         camera.position.copy(tpPos);
    }
    
    if (rainGroupRef.current) {
        rainGroupRef.current.position.copy(positionRef.current);
    }

    // Debug Info
    const keys = [
      moveForward.current ? 'W' : '',
      moveLeft.current ? 'A' : '',
      moveBackward.current ? 'S' : '',
      moveRight.current ? 'D' : '',
    ].filter(Boolean).join('');
    
    // Boost Status
    let boostStatus = 'READY';
    if (bootsActiveTime.current > 0) boostStatus = 'ACTIVE!';
    else if (now < bootsCooldownEnd.current) boostStatus = `COOLDOWN ${(bootsCooldownEnd.current - now)/1000}`; // Rough format

    if ((viewMode === 'FP' || viewMode === 'TP') && isLocked.current) {
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
            mode: physicsMode.current,
            boost: boostStatus
          });
    } else {
       setDebugInfo(prev => ({ ...prev, locked: isLocked.current, keys }));
    }
  });

  // Knockback Helper
  const applyKnockback = (force: THREE.Vector3) => {
      velocity.current.add(force);
  };

  return { isLocked, camAngle, debugInfo, applyKnockback };
};