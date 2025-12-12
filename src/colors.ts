/**
 * Color Palette
 * 
 * Centralized color definitions used throughout the game.
 * This prevents duplicate color definitions and ensures consistency.
 */

// =============================================================================
// ITEM COLORS
// =============================================================================

export const ITEM_COLORS = {
    // Resources
    wood: '#8B4513',
    stone: '#9ca3af',
    dirt: '#854d0e',
    leaf: '#166534',
    
    // Food
    apple: '#ef4444',
    meat: '#ef4444',
    fish: '#60a5fa',
    bread: '#fcd34d',
    
    // Weapons
    sword: '#6b7280',
    axe: '#78716c',
    pickaxe: '#fbbf24',
    bow: '#8b4513',
    arrows: '#d6d3d1',
    
    // Equipment
    shield: '#94a3b8',
    helmet: '#71717a',
    armor: '#71717a',
    boots: '#78716c',
    
    // Special
    torch: '#f59e0b',
    potion: '#a855f7',
    gold: '#fbbf24',
    gem: '#06b6d4',
    
    // Default
    default: '#ffffff',
} as const;

// =============================================================================
// TERRAIN COLORS
// =============================================================================

export const TERRAIN_COLORS = {
    grass: '#4ade80',
    dirt: '#854d0e',
    stone: '#9ca3af',
    sand: '#fde047',
    snow: '#f3f4f6',
    water: '#3b82f6',
    lava: '#ef4444',
    bedrock: '#1f2937',
} as const;

// =============================================================================
// CHARACTER COLORS
// =============================================================================

export const CHARACTER_COLORS = {
    // Animals
    sheep_wool: '#f5f5f5',
    sheep_face: '#3d3d3d',
    cow_body: '#4a3728',
    cow_spots: '#f5f5f5',
    pig_body: '#ffc0cb',
    
    // Enemies
    zombie_skin: '#22c55e',
    zombie_clothes: '#1e3a1e',
    skeleton_bone: '#e5e5e5',
    skeleton_eyes: '#ff0000',
    sorcerer_robe: '#581c87',
    giant_skin: '#7c3aed',
    
    // NPCs
    merchant_clothes: '#fbbf24',
    guard_armor: '#71717a',
} as const;

// =============================================================================
// UI COLORS
// =============================================================================

export const UI_COLORS = {
    // Health
    hp_full: '#22c55e',
    hp_medium: '#eab308',
    hp_low: '#ef4444',
    hp_bar_bg: '#1f2937',
    
    // Hunger
    hunger_full: '#f97316',
    hunger_empty: '#78716c',
    
    // XP
    xp_bar: '#3b82f6',
    xp_bar_bg: '#1e3a5f',
    
    // Notifications
    notification_info: '#3b82f6',
    notification_warning: '#eab308',
    notification_error: '#ef4444',
    notification_success: '#22c55e',
    
    // Borders
    selected: '#fbbf24',
    hover: '#ffffff',
} as const;

// =============================================================================
// EFFECT COLORS
// =============================================================================

export const EFFECT_COLORS = {
    damage: '#ef4444',
    heal: '#22c55e',
    magic: '#a855f7',
    fire: '#f97316',
    ice: '#60a5fa',
    poison: '#84cc16',
    blood: '#991b1b',
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get item color by type, with fallback to default
 */
export function getItemColor(type: string): string {
    const lowerType = type.toLowerCase();
    
    // Check direct match
    if (lowerType in ITEM_COLORS) {
        return ITEM_COLORS[lowerType as keyof typeof ITEM_COLORS];
    }
    
    // Check partial matches
    for (const [key, color] of Object.entries(ITEM_COLORS)) {
        if (lowerType.includes(key)) {
            return color;
        }
    }
    
    return ITEM_COLORS.default;
}

/**
 * Get terrain color by type
 */
export function getTerrainColor(type: string): string {
    const lowerType = type.toLowerCase();
    
    for (const [key, color] of Object.entries(TERRAIN_COLORS)) {
        if (lowerType.includes(key)) {
            return color;
        }
    }
    
    return TERRAIN_COLORS.stone;
}
