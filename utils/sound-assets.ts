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
  ATTACK_AXE: [
    'sfx/battle-axe-swoosh.mp3',
    'sfx/battle-axe-swoosh-2.mp3',
  ],
  ATTACK_KNIGHT: [
    'sfx/knight-sword-swoosh.mp3',
  ],
  PUNCH: [
    'sfx/punch-1.mp3',
    'sfx/punch-2.mp3',
    'sfx/punch-3.mp3',
  ],
  PUNCH_HIT: [
    'sfx/punch-hit.mp3',
  ],
  EAT: [
    'sfx/eat-apple-1.mp3',
    'sfx/eat-apple-2.mp3',
  ],
  EAT_MEAT: [
    'sfx/eating-meat.mp3',
    'sfx/eating-meat-2.mp3',
  ],
  EAT_FISH: [
    'sfx/eating-fish.mp3',
    'sfx/eating-fish-2.mp3',
  ],
  DRINK: [
    'sfx/drink-1.mp3',
    'sfx/drink-aah.mp3',
  ],
  CREATE: ['sfx/shield-block.mp3'], // Placeholder click/thud
  MINE: ['sfx/shield-block.mp3'], // Placeholder thud for stone
  CHOP_WOOD: [
    'sfx/axe-chopping-wood-1.mp3',
    'sfx/axe-chopping-wood-2.mp3',
    'sfx/axe-chopping-wood-3.mp3',
  ],
  DRAW_SWORD: ['sfx/draw-sword.mp3'],
  POWER_SWOOSH: ['sfx/power-swoosh.mp3'],
  SHOOT: ['sfx/power-swoosh.mp3'], // Placeholder
  BLOCK: ['sfx/shield-block.mp3'],
  SHIELD_BLOCK: ['sfx/shield-block.mp3'], // Alias
  CHEST_OPEN: ['sfx/draw-sword.mp3'], // Placeholder
  
  // Magic
  SPELL_CAST: ['sfx/cast-spell.mp3'],
  SPELL_FIREBALL: ['sfx/cast-spell-fireball.mp3', 'sfx/fireball.mp3'],
  SPELL_LIGHTNING: ['sfx/lightning-spell.mp3'],
  SPELL_HEAL: ['sfx/healing-spell.mp3'],
  SUMMON: ['sfx/summon-entity.mp3'],
  PORTAL: [
    'sfx/portal-activated.mp3',
    'sfx/portal-absorbing.mp3',
    'sfx/portal-mystical.mp3',
    'sfx/portal-opening.mp3',
  ],
  PORTAL_OPENING: ['sfx/portal-opening.mp3'],
  PORTAL_ACTIVATED: ['sfx/portal-activated.mp3'],

  // Environment
  THUNDER: ['sfx/thunder-lightning.mp3'],
  RAIN: ['sfx/heavy-rain.mp3'],
  LAKE: ['sfx/calm-lake.mp3', 'sfx/calm-lake-2.mp3'],
  SPLASH: ['sfx/lake-fish-1.mp3', 'sfx/lake-fish-2.mp3'],
  CREEPY: ['sfx/creepy-1.mp3'],
  OMINOUS: ['sfx/ominous-1.mp3', 'sfx/ominous-2.mp3'],
  
  // Creatures/Enemies
  ZOMBIE_GROAN: ['sfx/zombie-groan.mp3'],
  ZOMBIE_ATTACK: ['sfx/zombie-attack.mp3'],
  ZOMBIE_DEATH: ['sfx/zombie-death.mp3'],
  ZOMBIE_HIT: ['sfx/zombie-hit.mp3'],
  ZOMBIE_WALK: ['sfx/zombie-walking.mp3'],
  
  GIANT_WALK: ['sfx/giant-walking.mp3'],
  GIANT_ATTACK: ['sfx/giant-club-hitting.mp3'],
  GIANT_DEATH: ['sfx/giant-spider-death.mp3'], 
  
  OGRE_ROAR: [
    'sfx/ogre-roar-1.mp3',
    'sfx/ogre-roar-2.mp3',
    'sfx/ogre-roar-3.mp3',
  ],
  
  FIGHTER_ROAR: ['sfx/fighter-roar.mp3'],
  GENERIC_GROWL: ['sfx/growl.mp3'],
  ZOMBIE_BOSS_GROWL: ['sfx/zombie-boss-growl.mp3'],
  
  SORCERER_LAUGH: ['sfx/sorcerer-evil-laugh.mp3'],
  SORCERER_CHANT: ['sfx/sorcerer-incantation.mp3'],
  SORCERER_SPELL: ['sfx/sorcerer-spell.mp3'],
  SORCERER_DEATH: ['sfx/sorcerer-death-1.mp3', 'sfx/sorcerer-death-2.mp3'],
  
  GENERIC_DEATH: [
    'sfx/death-1.mp3',
    'sfx/death-2.mp3',
    'sfx/death-2.mp3',
    'sfx/death-3.mp3',
  ],
  PLAYER_HIT: ['sfx/punch-hit.mp3'],
};

export type SoundCategory = keyof typeof SOUND_ASSETS;
