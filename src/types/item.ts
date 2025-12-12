import * as THREE from 'three';

export interface InventoryItem {
  type: string;
  count: number;
  color: string;
}

export type EquipmentSlot = 'head' | 'chest' | 'feet' | 'mainHand' | 'offHand';

export interface Equipment {
  head: InventoryItem | null;
  chest: InventoryItem | null;
  feet: InventoryItem | null;
  mainHand: InventoryItem | null;
  offHand: InventoryItem | null;
}

export interface ItemGenerationResponse {
  name: string;
  color: string;
  description: string;
}

export interface DroppedItem {
  id: string;
  type: string;
  position: THREE.Vector3;
  count: number;
  color: string;
  velocity: THREE.Vector3; // For bouncing animation
  createdAt: number;
}
