# Components Reference

This document provides a reference for all React components in Adventure Craft.

## 3D Components

### VoxelWorld

**Path:** `components/VoxelWorld.tsx`

The main 3D scene container that renders the entire voxel world.

**Props:**

```typescript
interface VoxelWorldProps {
  blocks: Block[];
  characters: Character[];
  projectiles: Projectile[];
  onDayChange: (isDay: boolean) => void;
  isDay: boolean;
  isRaining: boolean;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  playerHp: number;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  playerHunger: number;
  setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  activeSlot: number;
  respawnTrigger: number;
  viewMode: "FP" | "OVERHEAD";
  setViewMode: (mode: "FP" | "OVERHEAD") => void;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  resetViewTrigger: number;
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  onCharacterInteract: (char: Character) => void;
  onQuestUpdate: (type: string, amount: number) => void;
}
```

**Responsibilities:**

- Wraps the Three.js canvas with `@react-three/fiber`
- Renders sky, lighting, and environmental effects
- Contains `WorldController` for game logic
- Renders all blocks, characters, and projectiles
- Manages camera controls (PointerLock vs OrbitControls)

---

### AnimatedCharacter

**Path:** `components/AnimatedCharacter.tsx`

Renders a single character with walking animations.

**Props:**

```typescript
interface AnimatedCharacterProps {
  character: Character;
  onInteract?: (char: Character) => void;
}
```

**Features:**

- Smooth position/rotation interpolation
- Limb animation when `isMoving` is true
- HP bar display above character
- "Right-click to talk" prompt for friendly NPCs
- Special effects for sorcerers (magic charge-up)
- Giant scaling (3x size)

---

### Cube

**Path:** `components/Cube.tsx`

Renders a single voxel block.

**Props:**

```typescript
interface CubeProps {
  position: [number, number, number];
  color: string;
  type?: string;
  textureMap: Record<string, THREE.Texture>;
  transparent?: boolean;
}
```

**Features:**

- Texture mapping based on block type
- Transparency support for water and leaves
- Standard material with color fallback

---

### Minimap

**Path:** `components/Minimap.tsx`

Renders the in-game minimap overlay.

**Props:**

```typescript
interface MinimapProps {
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  characters: Character[];
  blocks: Block[];
  spawnMarkers?: SpawnMarker[];
}
```

**Features:**

- Canvas-based rendering (150x150px)
- Filter buttons (ALL, FOES, ANIMALS, BUILDINGS, TREES)
- Click-to-identify entities
- Spawn marker glow animation

---

### ProjectileMesh

**Path:** `components/ProjectileMesh.tsx`

Renders a projectile (e.g., sorcerer magic ball).

**Props:**

```typescript
interface ProjectileMeshProps {
  projectile: Projectile;
}
```

---

### WorldController

**Path:** `components/WorldController.tsx`

Invisible component that handles per-frame game logic.

**Responsibilities:**

- Runs `usePlayerPhysics` for movement
- Runs `usePlayerInteraction` for mining/combat
- Runs `useGameAI` for character behaviors
- Updates day/night cycle
- Syncs `playerPosRef` for minimap

---

### RainSystem

**Path:** `components/environment/RainSystem.tsx`

Particle system for rain effects.

**Features:**

- Blue semi-transparent particles
- Falls around the player position
- Only renders when `isRaining` is true

---

## UI Components

### UIOverlay

**Path:** `components/UIOverlay.tsx`

Container for all UI elements overlaid on the 3D view.

**Props:**

```typescript
interface UIOverlayProps {
  onGenerate: (
    prompt: string,
    mode: GenerationMode,
    count: number,
    isEnemy?: boolean
  ) => void;
  onReset: () => void;
  onExpand: () => void;
  onGiveItem: (item: string, count: number) => void;
  onRespawn: () => void;
  onResetView: () => void;
  jobs: Job[];
  playerHp: number;
  playerHunger: number;
  inventory: InventoryItem[];
  activeSlot: number;
  setActiveSlot: (slot: number) => void;
  onCraft: (recipeId: string) => void;
  expansionLevel: number;
  viewMode?: "FP" | "OVERHEAD";
  quest: Quest | null;
  questMessage: string | null;
}
```

**Contains:**

- TopBar (status bars, action buttons)
- Hotbar (inventory)
- SpawnMenu (quick spawn buttons)
- GenerationInput (AI prompt input)
- QuestDisplay
- JobQueue
- CraftingMenu (conditional)
- Crosshair (in FP mode)

---

### TopBar

**Path:** `components/ui/TopBar.tsx`

Top area with health/hunger bars and action buttons.

**Features:**

- HP bar (green/red gradient)
- Hunger bar (orange/red gradient)
- View mode indicator
- Action buttons: Respawn, Reset View, Expand World, New World, Crafting

---

### Hotbar

**Path:** `components/ui/Hotbar.tsx`

Bottom inventory bar with 5 slots.

**Features:**

- Shows item icon (colored square) and count
- Active slot highlighted
- Click to select slot
- Tooltips on hover

---

### SpawnMenu

**Path:** `components/ui/SpawnMenu.tsx`

Tabbed menu for quick-spawn buttons.

**Tabs:**

- ITEMS (Sword, Apple, Shield)
- CHARACTERS (Villager, Knight, Wizard)
- ANIMALS (Sheep, Cow, Pig, Chicken, Fish, Horse)
- ENEMIES (Zombie, Skeleton, Sorcerer, Giant, Spider)
- STRUCTURES (House, Tower, Wine Barrel, Temple, Tree, Fountain)

---

### GenerationInput

**Path:** `components/ui/GenerationInput.tsx`

Text input for AI content generation.

**Features:**

- Mode selector (STRUCTURE, CHARACTER, ITEM)
- Count selector (1-10)
- Enemy/giant/friendly modifiers
- Keyboard shortcut: Enter to focus

---

### ChatWindow

**Path:** `components/ui/ChatWindow.tsx`

Dialog window for NPC conversations.

**Props:**

```typescript
interface ChatWindowProps {
  npcName: string;
  history: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  stopProp: (e: any) => void;
}
```

**Features:**

- Scrollable message history
- Player messages right-aligned
- NPC messages left-aligned
- Input field for new messages

---

### CraftingMenu

**Path:** `components/ui/CraftingMenu.tsx`

Modal menu for crafting recipes.

**Features:**

- List of available recipes
- Shows input/output requirements
- Click to craft

---

### QuestDisplay

**Path:** `components/ui/QuestDisplay.tsx`

Displays current quest progress.

**Features:**

- Quest title
- Progress bars for each requirement
- "Quest Complete!" message animation

---

### JobQueue

**Path:** `components/ui/JobQueue.tsx`

Shows active AI generation jobs.

**Features:**

- List of pending/generating/completed jobs
- Status indicators (spinner, checkmark, error)
- Auto-removes after completion

---

### StartScreen

**Path:** `components/StartScreen.tsx`

Initial screen before game starts.

**Features:**

- Title and click-to-start prompt
- Transitions to game on click
