export interface Quest {
  id: string;
  title: string;
  requirements: Record<string, number>; // e.g. { 'wood': 10, 'zombie': 2 }
  progress: Record<string, number>;
  completed: boolean;
}
