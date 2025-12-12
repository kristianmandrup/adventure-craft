import { Block } from '../../types';

export interface CaveSpawn {
  x: number;
  y: number;
  z: number;
  type: 'treasure' | 'boss' | 'merchant';
}

export interface TerrainResult {
  blocks: Block[];
  caveSpawns: CaveSpawn[];
}
