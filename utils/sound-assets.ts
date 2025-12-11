export const SOUND_ASSETS = {
  // Player Actions
  ATTACK_SWORD: [
    'sfx/sword-swing-1.mp3',
    'sfx/sword-swing-2.mp3',
    'sfx/sword-swing-3.mp3',
    'sfx/sword-swing-4.mp3',
    'sfx/sword-swing-5.mp3',
  ],
  ATTACK_HEAVY: [
    'sfx/powerful-sword-swing-1.mp3',
  ],
  EAT: ['sfx/lake-fish-1.mp3'], // Placeholder using splash or if I find an eating sound. I don't see one in list. Re-using generic or maybe I missed one? 
  // checking file list again: lake-fish, calm-lake, cast-spell, death, draw-sword, fighter-roar, fireball, giant-*, healing, heavy-rain, lightning, portal, power-swoosh, powerful-sword, shield-block, sorcerer-*, summon, sword-swing, thunder, zombie-*
  // No eat sound. I will use 'sfx/lake-fish-1.mp3' as a placeholder or remove the call. 
  // Actually, better to define it even if placeholder.
  CREATE: ['sfx/shield-block.mp3'], // Placeholder click/thud
  MINE: ['sfx/shield-block.mp3'], // Placeholder thud
  DRAW_SWORD: ['sfx/draw-sword.mp3'],
  POWER_SWOOSH: ['sfx/power-swoosh.mp3'],
  SHOOT: ['sfx/power-swoosh.mp3'], // Placeholder or reuse swoosh for now if no specific bow sound
  BLOCK: ['sfx/shield-block.mp3'],
  SHIELD_BLOCK: ['sfx/shield-block.mp3'], // Alias
  CHEST_OPEN: ['sfx/draw-sword.mp3'], // Placeholder
  
  // Magic
  SPELL_CAST: ['sfx/cast-spell.mp3'],
  SPELL_FIREBALL: ['sfx/cast-spell-fireball.mp3', 'sfx/fireball.mp3'],
  SPELL_LIGHTNING: ['sfx/lightning-spell.mp3'],
  SPELL_HEAL: ['sfx/healing-spell.mp3'],
  SUMMON: ['sfx/summon-entity.mp3'],
  PORTAL: ['sfx/portal-activated.mp3'],

  // Environment
  THUNDER: ['sfx/thunder-lightning.mp3'],
  RAIN: ['sfx/heavy-rain.mp3'],
  LAKE: ['sfx/calm-lake.mp3', 'sfx/calm-lake-2.mp3'],
  SPLASH: ['sfx/lake-fish-1.mp3', 'sfx/lake-fish-2.mp3'],
  
  // Creatures/Enemies
  ZOMBIE_GROAN: ['sfx/zombie-groan.mp3'],
  ZOMBIE_ATTACK: ['sfx/zombie-attack.mp3'],
  ZOMBIE_DEATH: ['sfx/zombie-death.mp3'],
  ZOMBIE_HIT: ['sfx/zombie-hit.mp3'],
  ZOMBIE_WALK: ['sfx/zombie-walking.mp3'],
  
  GIANT_WALK: ['sfx/giant-walking.mp3'],
  GIANT_DEATH: ['sfx/giant-spider-death.mp3'], // Reusing or finding better mapping
  FIGHTER_ROAR: ['sfx/fighter-roar.mp3'],
  ZOMBIE_BOSS_GROWL: ['sfx/zombie-boss-growl.mp3'],
  
  SORCERER_LAUGH: ['sfx/sorcerer-evil-laugh.mp3'],
  SORCERER_CHANT: ['sfx/sorcerer-incantation.mp3'],
  SORCERER_SPELL: ['sfx/sorcerer-spell.mp3'],
  SORCERER_DEATH: ['sfx/sorcerer-death-1.mp3', 'sfx/sorcerer-death-2.mp3'],
  
  GENERIC_DEATH: [
    'sfx/death-1.mp3',
    'sfx/death-2.mp3',
    'sfx/death-3.mp3',
  ],
};

export type SoundCategory = keyof typeof SOUND_ASSETS;
