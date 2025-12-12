
export interface ItemStats {
  attack: number;
  defense: number;
  speed: number;
  special?: string;
  description?: string;
}

export const getItemStats = (type: string): ItemStats => {
  const t = type.toLowerCase();
  
  // Weapons
  if (t === 'weapon' || t.includes('sword') || t.includes('blade')) {
      if (t.includes('fire') || t.includes('flame')) {
          return { attack: 30, defense: 0, speed: 0, special: 'Flame Effect', description: 'Sets enemies on fire' };
      }
      if (t.includes('ice') || t.includes('frost')) {
         return { attack: 25, defense: 0, speed: 0, special: 'Freeze', description: 'Slows enemies' };
      }
      if (t.includes('magic')) {
          return { attack: 25, defense: 0, speed: 0, special: 'Magic Aura' };
      }
      return { attack: 20, defense: 0, speed: 0, description: 'Standard blade' };
  }
  
  if (t === 'bow' || t.includes('bow')) {
      if (t.includes('magic')) return { attack: 20, defense: 0, speed: 0, special: 'Homing Arrows' };
      return { attack: 15, defense: 0, speed: 0, description: 'Ranged weapon' };
  }

  // Tools
  if (t.includes('axe')) return { attack: 12, defense: 0, speed: 0 };
  if (t.includes('pickaxe') || t.includes('pick')) return { attack: 8, defense: 0, speed: 0 };
  
  // Armor - Helmets
  if (t.includes('helmet') || t.includes('hat') || t.includes('cap')) {
      if (t.includes('iron') || t.includes('metal')) return { attack: 0, defense: 8, speed: 0 };
      if (t.includes('gold')) return { attack: 0, defense: 6, speed: 0, special: 'Bling' };
      return { attack: 0, defense: 4, speed: 0 };
  }
  
  // Armor - Chest
  if (t.includes('chest') || t.includes('armor') || t.includes('tunic') || t.includes('plate')) {
      if (t.includes('iron') || t.includes('metal')) return { attack: 0, defense: 20, speed: -5, description: 'Heavy Protection' };
      if (t.includes('leather')) return { attack: 0, defense: 10, speed: 0 };
      return { attack: 0, defense: 15, speed: -2 };
  }
  
  // Armor - Feet
  if (t.includes('boots') || t.includes('shoes')) {
      if (t === 'magic_boots') return { attack: 0, defense: 2, speed: 50, special: 'Super Speed' };
      if (t === 'swimming_boots' || t.includes('swim')) return { attack: 0, defense: 2, speed: 5, special: 'water_walk', description: 'Walk on water' };
      if (t.includes('iron')) return { attack: 0, defense: 6, speed: -2 };
      return { attack: 0, defense: 3, speed: 2 };
  }

  // Offhand - Shields
  if (t.includes('shield')) {
      if (t.includes('magic')) return { attack: 0, defense: 25, speed: -2, special: 'Magic Block' };
      if (t.includes('iron')) return { attack: 0, defense: 20, speed: -5 };
      return { attack: 0, defense: 15, speed: -2, description: 'Blocks attacks' };
  }

  return { attack: 0, defense: 0, speed: 0 };
};
