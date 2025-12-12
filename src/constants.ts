/**
 * Game Constants
 * 
 * Centralized configuration for all magic numbers and tuning values.
 * This makes it easy to adjust game balance and find all related values.
 */

// =============================================================================
// PHYSICS CONSTANTS
// =============================================================================

export const PHYSICS = {
    /** Gravity acceleration (blocks/s²) */
    /** Gravity acceleration (blocks/s²) */
    GRAVITY: 18.0,
    /** Jump force (blocks/s) */
    JUMP_FORCE: 10.0,
    /** Base movement speed (blocks/s) */
    SPEED: 3.5,
    /** Max sprint speed (blocks/s) */
    MAX_SPRINT_SPEED: 6.0,
    /** Sprint multiplier */
    SPRINT_MULTIPLIER: 1.5,
} as const;

// =============================================================================
// PLAYER CONSTANTS
// =============================================================================

export const PLAYER = {
    /** Player hitbox dimensions */
    HEIGHT: 1.8,
    WIDTH: 0.6,
    /** Starting stats */
    INITIAL_HP: 100,
    INITIAL_HUNGER: 100,
    INITIAL_GOLD: 0,
    /** Stat caps */
    MAX_HP: 100,
    MAX_HUNGER: 100,
    /** Hunger decay interval (ms) */
    HUNGER_TICK_MS: 3000,
    /** HP regeneration interval (ms) */
    REGEN_TICK_MS: 2000,
} as const;

// =============================================================================
// WORLD CONSTANTS
// =============================================================================

export const WORLD = {
    /** Base world size (blocks from center) */
    BASE_SIZE: 40,
    /** Expansion step size */
    EXPANSION_STEP: 20,
    /** Maximum expansion level */
    MAX_EXPANSION: 3,
    /** Day/night cycle duration (ms) - 5 minutes */
    DAY_CYCLE_MS: 300000,
    /** Rain check interval (ms) */
    RAIN_CHECK_MS: 60000,
    /** Rain duration (ms) */
    RAIN_DURATION_MS: 30000,
    /** Rain probability per check */
    RAIN_PROBABILITY: 0.2,
} as const;

// =============================================================================
// PORTAL CONSTANTS
// =============================================================================

export const PORTAL = {
    /** Minimum spawn delay (ms) */
    MIN_SPAWN_DELAY_MS: 60000,
    /** Random spawn delay range (ms) */
    SPAWN_DELAY_RANGE_MS: 60000,
    /** Portal color variants */
    COLORS: [
        { color: '#a855f7', name: 'Purple' },
        { color: '#f97316', name: 'Orange' },
        { color: '#3b82f6', name: 'Blue' },
        { color: '#7f1d1d', name: 'Dark Red' },
        { color: '#ec4899', name: 'Pink' },
        { color: '#22c55e', name: 'Green' },
        { color: '#e2e8f0', name: 'Silver' },
        { color: '#000000', name: 'Void' },
    ],
} as const;

// =============================================================================
// ENTITY CONSTANTS
// =============================================================================

export const ENTITIES = {
    /** Maximum entity counts */
    CAPS: {
        enemies: 20,
        friendlyNpcs: 10,
        animals: 10,
        structures: 10,
    },
    /** Spawn marker lifetime (ms) */
    SPAWN_MARKER_LIFETIME_MS: 30000,
} as const;

// =============================================================================
// COMBAT CONSTANTS
// =============================================================================

export const COMBAT = {
    /** Base attack damage */
    BASE_DAMAGE: 10,
    /** Attack range (blocks) */
    MELEE_RANGE: 2.5,
    /** Attack cooldown (ms) */
    ATTACK_COOLDOWN_MS: 500,
    /** XP rewards by enemy type */
    ENEMY_XP: {
        zombie: 15,
        skeleton: 20,
        spider: 15,
        sorcerer: 40,
        giant: 75,
    } as Record<string, number>,
    /** Gold drop ranges [min, max] */
    ENEMY_GOLD: {
        zombie: [5, 10],
        skeleton: [8, 15],
        spider: [5, 10],
        sorcerer: [15, 25],
        giant: [30, 50],
        boss: [50, 100],
    } as Record<string, [number, number]>,
} as const;

// =============================================================================
// PROGRESSION CONSTANTS
// =============================================================================

export const PROGRESSION = {
    /** XP thresholds for each level (index = level - 1) */
    XP_THRESHOLDS: [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200],
    /** Stat multipliers per level */
    ATTACK_MULTIPLIER_PER_LEVEL: 0.1,
    SPEED_MULTIPLIER_PER_LEVEL: 0.05,
    DEFENSE_REDUCTION_PER_LEVEL: 0.05,
} as const;

// =============================================================================
// SAVE CONSTANTS
// =============================================================================

export const SAVES = {
    /** Auto-save interval (ms) */
    LOCAL_SAVE_INTERVAL_MS: 30000,
    /** Cloud save interval (ms) */
    CLOUD_SAVE_INTERVAL_MS: 60000,
    /** Leaderboard size limit */
    LEADERBOARD_SIZE: 5,
    /** Local storage key */
    STORAGE_KEY: 'adventure_craft_save',
    /** Leaderboard storage key */
    LEADERBOARD_KEY: 'adventure_craft_leaderboard',
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI = {
    /** Notification display duration (ms) */
    NOTIFICATION_DURATION_MS: 4000,
    /** Level up message duration (ms) */
    LEVEL_UP_MESSAGE_MS: 3000,
    /** Quest complete message duration (ms) */
    QUEST_COMPLETE_MS: 4000,
    /** Hotbar slot count */
    HOTBAR_SLOTS: 5,
} as const;

// =============================================================================
// AI CONSTANTS
// =============================================================================

export const AI = {
    /** Chase range for enemies */
    CHASE_RANGE: 15,
    /** Wander range for passive mobs */
    WANDER_RANGE: 10,
    /** Attack range for melee enemies */
    ATTACK_RANGE: 2,
    /** Time between attacks (ms) */
    ATTACK_COOLDOWN_MS: 1500,
} as const;
