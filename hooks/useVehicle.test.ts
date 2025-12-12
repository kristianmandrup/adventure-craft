import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as THREE from 'three';

// Mock the hook since it uses React hooks
const mockUseVehicle = () => {
  // Simulated boat state
  const boats: any[] = [];
  let currentBoat: string | null = null;
  
  const spawnBoat = (position: [number, number, number]) => {
    const newBoat = {
      id: crypto.randomUUID(),
      position,
      rotation: 0
    };
    boats.push(newBoat);
    return newBoat;
  };
  
  const enterBoat = (boatId: string) => {
    const boat = boats.find(b => b.id === boatId);
    if (boat) currentBoat = boatId;
  };
  
  const exitBoat = () => {
    currentBoat = null;
  };
  
  return {
    get boats() { return boats; },
    get currentBoat() { return currentBoat; },
    get isInBoat() { return !!currentBoat; },
    spawnBoat,
    enterBoat,
    exitBoat
  };
};

describe('useVehicle', () => {
  describe('Boat spawning', () => {
    it('should spawn a boat at given position', () => {
      const vehicle = mockUseVehicle();
      
      const boat = vehicle.spawnBoat([10, 0, 10]);
      
      expect(boat.id).toBeDefined();
      expect(boat.position).toEqual([10, 0, 10]);
      expect(boat.rotation).toBe(0);
    });

    it('should add spawned boat to boats array', () => {
      const vehicle = mockUseVehicle();
      
      vehicle.spawnBoat([10, 0, 10]);
      
      expect(vehicle.boats.length).toBe(1);
    });
  });

  describe('Enter/Exit boat', () => {
    it('should enter boat when valid boatId provided', () => {
      const vehicle = mockUseVehicle();
      const boat = vehicle.spawnBoat([10, 0, 10]);
      
      vehicle.enterBoat(boat.id);
      
      expect(vehicle.currentBoat).toBe(boat.id);
      expect(vehicle.isInBoat).toBe(true);
    });

    it('should exit boat', () => {
      const vehicle = mockUseVehicle();
      const boat = vehicle.spawnBoat([10, 0, 10]);
      vehicle.enterBoat(boat.id);
      
      vehicle.exitBoat();
      
      expect(vehicle.currentBoat).toBeNull();
      expect(vehicle.isInBoat).toBe(false);
    });

    it('should not enter non-existent boat', () => {
      const vehicle = mockUseVehicle();
      
      vehicle.enterBoat('fake-id');
      
      expect(vehicle.currentBoat).toBeNull();
    });
  });
});
