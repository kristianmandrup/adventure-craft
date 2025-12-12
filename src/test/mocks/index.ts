/**
 * Reusable Test Mocks
 * 
 * Centralized mock definitions that can be imported in test files.
 */

import { vi } from 'vitest';
import { GameSaveState, InventoryItem, Equipment, Character } from '@/types';

// =============================================================================
// FIREBASE MOCKS
// =============================================================================

export const createFirebaseMocks = () => ({
    db: {},
    auth: {},
    storage: {},
});

export const createFirestoreMocks = () => ({
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
});

// =============================================================================
// AUDIO MOCKS
// =============================================================================

export const createAudioMocks = () => ({
    audioManager: {
        init: vi.fn(),
        playSFX: vi.fn(),
        playSpatialSFX: vi.fn(),
        setMusicVolume: vi.fn(),
        setSFXVolume: vi.fn(),
    },
});

// =============================================================================
// GAME STATE MOCKS
// =============================================================================

export const createMockGameState = (
    overrides: Partial<Omit<GameSaveState, 'timestamp'>> = {}
): Omit<GameSaveState, 'timestamp'> => ({
    version: 1,
    playerHp: 100,
    playerHunger: 100,
    playerXp: 0,
    playerLevel: 1,
    playerGold: 0,
    inventory: [],
    equipment: createMockEquipment(),
    blocks: [],
    characters: [],
    droppedItems: [],
    playerPos: [0, 5, 0],
    gameMode: 'CREATIVE',
    isDay: true,
    gameStarted: true,
    expansionLevel: 0,
    currentQuest: null,
    questMessage: null,
    ...overrides,
});

export const createMockEquipment = (
    overrides: Partial<Equipment> = {}
): Equipment => ({
    head: null,
    chest: null,
    feet: null,
    mainHand: null,
    offHand: null,
    ...overrides,
});

export const createMockInventoryItem = (
    overrides: Partial<InventoryItem> = {}
): InventoryItem => ({
    type: 'wood',
    count: 1,
    color: '#8B4513',
    ...overrides,
});

// =============================================================================
// CHARACTER MOCKS
// =============================================================================

export const createMockCharacter = (
    overrides: Partial<Character> = {}
): Character => ({
    id: 'test-char-' + Math.random().toString(36).substring(7),
    name: 'Test Character',
    playerPos: [0, 0, 0],
    rotation: 0,
    parts: [],
    maxHp: 100,
    hp: 100,
    isEnemy: false,
    isFriendly: false,
    isGiant: false,
    isAquatic: false,
    isMoving: false,
    ...overrides,
});

export const createMockEnemy = (
    overrides: Partial<Character> = {}
): Character => createMockCharacter({
    name: 'Zombie',
    isEnemy: true,
    maxHp: 20,
    hp: 20,
    ...overrides,
});

export const createMockAnimal = (
    overrides: Partial<Character> = {}
): Character => createMockCharacter({
    name: 'Sheep',
    isEnemy: false,
    isFriendly: false,
    maxHp: 10,
    hp: 10,
    ...overrides,
});

export const createMockNPC = (
    overrides: Partial<Character> = {}
): Character => createMockCharacter({
    name: 'Merchant',
    isEnemy: false,
    isFriendly: true,
    maxHp: 100,
    hp: 100,
    ...overrides,
});

// =============================================================================
// THREE.JS MOCKS
// =============================================================================

export const createVector3Mock = (x = 0, y = 0, z = 0) => ({
    x,
    y,
    z,
    set: vi.fn().mockReturnThis(),
    copy: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    sub: vi.fn().mockReturnThis(),
    multiplyScalar: vi.fn().mockReturnThis(),
    normalize: vi.fn().mockReturnThis(),
    length: vi.fn(() => Math.sqrt(x * x + y * y + z * z)),
    distanceTo: vi.fn((other: any) => {
        const dx = x - other.x;
        const dy = y - other.y;
        const dz = z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }),
    clone: vi.fn(() => createVector3Mock(x, y, z)),
});

// =============================================================================
// BROWSER API MOCKS
// =============================================================================

export const setupBrowserMocks = () => {
    // matchMedia
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    // ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));

    // crypto.randomUUID
    if (!global.crypto) {
        global.crypto = {} as Crypto;
    }
    global.crypto.randomUUID = vi.fn(() => 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }) as `${string}-${string}-${string}-${string}-${string}`
    );
};

// =============================================================================
// LOCAL STORAGE MOCK
// =============================================================================

export const createLocalStorageMock = () => {
    let store: Record<string, string> = {};
    
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (index: number) => Object.keys(store)[index] || null,
    };
};
