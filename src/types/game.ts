/**
 * Game Types
 */

export enum GameState {
  IDLE = 'IDLE',
  ERROR = 'ERROR',
}

export type GameMode = 'NORMAL' | 'DARK_UNDERWORLD';

export type GenerationMode = 'STRUCTURE' | 'CHARACTER' | 'ITEM';

export interface Job {
  id: string;
  type: GenerationMode;
  prompt: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  message?: string;
  isEnemy?: boolean;
  isGiant?: boolean;
  isFriendly?: boolean;
  isAquatic?: boolean;
}

export type NotificationType = 'BOSS' | 'MERCHANT' | 'INFO' | 'COMBAT_HIT' | 'COMBAT_MISS' | 'COMBAT_BLOCK' | 'COMBAT_DAMAGE' | 'WARNING';
