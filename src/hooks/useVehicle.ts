import { useState, useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface Boat {
  id: string;
  position: [number, number, number];
  rotation: number;
}

interface UseVehicleProps {
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  positionRef: React.MutableRefObject<THREE.Vector3>;
  isLocked: React.MutableRefObject<boolean>;
  setVelocity?: (v: THREE.Vector3) => void;
}

export const useVehicle = ({
  playerPosRef, positionRef, isLocked
}: UseVehicleProps) => {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [currentBoat, setCurrentBoat] = useState<string | null>(null);
  const boatVelocity = useRef(new THREE.Vector3());
  
  // Boat movement keys
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const turnLeft = useRef(false);
  const turnRight = useRef(false);
  
  // Input handlers for boat controls
  useEffect(() => {
    if (!currentBoat) return;
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentBoat) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveForward.current = true; break;
        case 'KeyS': case 'ArrowDown': moveBackward.current = true; break;
        case 'KeyA': case 'ArrowLeft': turnLeft.current = true; break;
        case 'KeyD': case 'ArrowRight': turnRight.current = true; break;
        case 'KeyX': // Exit boat
          exitBoat();
          break;
      }
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveForward.current = false; break;
        case 'KeyS': case 'ArrowDown': moveBackward.current = false; break;
        case 'KeyA': case 'ArrowLeft': turnLeft.current = false; break;
        case 'KeyD': case 'ArrowRight': turnRight.current = false; break;
      }
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [currentBoat]);
  
  const enterBoat = useCallback((boatId: string) => {
    const boat = boats.find(b => b.id === boatId);
    if (boat) {
      setCurrentBoat(boatId);
      // Snap player to boat position
      positionRef.current.set(...boat.position);
    }
  }, [boats, positionRef]);
  
  const exitBoat = useCallback(() => {
    if (currentBoat) {
      const boat = boats.find(b => b.id === currentBoat);
      if (boat) {
        // Move player slightly to the side
        positionRef.current.x += 1.5;
        positionRef.current.y += 0.5;
      }
      setCurrentBoat(null);
      boatVelocity.current.set(0, 0, 0);
    }
  }, [currentBoat, boats, positionRef]);
  
  const spawnBoat = useCallback((position: [number, number, number]) => {
    const newBoat: Boat = {
      id: crypto.randomUUID(),
      position,
      rotation: 0
    };
    setBoats(prev => [...prev, newBoat]);
    return newBoat;
  }, []);
  
  // Update boat position based on movement
  const updateBoat = useCallback((delta: number) => {
    if (!currentBoat) return null;
    
    const boat = boats.find(b => b.id === currentBoat);
    if (!boat) return null;
    
    const BOAT_SPEED = 5;
    const TURN_SPEED = 2;
    
    let newRotation = boat.rotation;
    if (turnLeft.current) newRotation += TURN_SPEED * delta;
    if (turnRight.current) newRotation -= TURN_SPEED * delta;
    
    const forward = new THREE.Vector3(
      -Math.sin(newRotation),
      0,
      -Math.cos(newRotation)
    );
    
    if (moveForward.current) {
      boatVelocity.current.addScaledVector(forward, BOAT_SPEED * delta);
    }
    if (moveBackward.current) {
      boatVelocity.current.addScaledVector(forward, -BOAT_SPEED * 0.5 * delta);
    }
    
    // Apply friction
    boatVelocity.current.multiplyScalar(0.98);
    
    const newPos: [number, number, number] = [
      boat.position[0] + boatVelocity.current.x * delta,
      boat.position[1],
      boat.position[2] + boatVelocity.current.z * delta
    ];
    
    // Update boat and player position
    setBoats(prev => prev.map(b => 
      b.id === currentBoat ? { ...b, position: newPos, rotation: newRotation } : b
    ));
    positionRef.current.set(...newPos);
    if (playerPosRef.current) {
      playerPosRef.current = newPos;
    }
    
    return { position: newPos, rotation: newRotation };
  }, [currentBoat, boats, positionRef, playerPosRef]);
  
  // Check for nearby boat to enter
  const findNearbyBoat = useCallback((): Boat | null => {
    if (!playerPosRef.current) return null;
    const [px, py, pz] = playerPosRef.current;
    
    for (const boat of boats) {
      const dist = Math.sqrt(
        (boat.position[0] - px) ** 2 + 
        (boat.position[2] - pz) ** 2
      );
      if (dist < 2) return boat;
    }
    return null;
  }, [boats, playerPosRef]);
  
  return {
    boats,
    currentBoat,
    isInBoat: !!currentBoat,
    enterBoat,
    exitBoat,
    spawnBoat,
    updateBoat,
    findNearbyBoat,
    setBoats
  };
};
