# API Reference

This document covers the services, hooks, and utility functions in Adventure Craft.

## Services

### geminiService

**Path:** `services/geminiService.ts`

Interfaces with Google Gemini AI for content generation.

#### generateStructure

```typescript
generateStructure(
  prompt: string,
  currentBlocksCount: number
): Promise<GenerationResponse>
```

Generates a voxel structure from a text prompt.

**Parameters:**

- `prompt` — Description of the structure to build
- `currentBlocksCount` — Current world block count (unused but available for optimization)

**Returns:**

```typescript
interface GenerationResponse {
  description: string; // Short description of what was built
  blocks: Block[]; // Array of block positions and colors
}
```

**AI Configuration:**

- Model: `gemini-2.5-flash`
- Max blocks: 400 (800 for towers)
- Temperature: 1.0 (creative)

---

#### generateCharacter

```typescript
generateCharacter(prompt: string): Promise<CharacterGenerationResponse>
```

Generates a voxel character/creature.

**Parameters:**

- `prompt` — Description of the character

**Returns:**

```typescript
interface CharacterGenerationResponse {
  description: string; // Name/description of the creature
  parts: CharacterPart[]; // Body parts for animation
}

interface CharacterPart {
  name:
    | "head"
    | "body"
    | "left_arm"
    | "right_arm"
    | "left_leg"
    | "right_leg"
    | "misc";
  voxels: CharacterVoxel[];
}
```

**AI Configuration:**

- Model: `gemini-2.5-flash`
- Max size: 16x16x16 voxels
- Parts must be segmented for animation

---

#### generateItem

```typescript
generateItem(prompt: string): Promise<ItemGenerationResponse>
```

Generates an inventory item.

**Parameters:**

- `prompt` — Description of the item

**Returns:**

```typescript
interface ItemGenerationResponse {
  name: string; // Item name for inventory
  color: string; // Hex color for display
  description: string; // Short description
}
```

---

#### generateDialogue

```typescript
generateDialogue(
  npcName: string,
  playerMessage: string,
  history: ChatMessage[]
): Promise<string>
```

Generates NPC dialogue responses.

**Parameters:**

- `npcName` — Character name (affects personality)
- `playerMessage` — What the player said
- `history` — Previous conversation for context

**Returns:** String response (under 20 words)

---

## Hooks

### usePlayerPhysics

**Path:** `hooks/usePlayerPhysics.ts`

Handles player movement, jumping, and collision detection.

```typescript
usePlayerPhysics({
  controlsRef,
  blockMap,
  position,
  setPosition,
  viewMode,
  setIsLocked,
  respawnTrigger,
  targetPosRef,
  resetViewTrigger
}: UsePlayerPhysicsProps)
```

**Returns:**

```typescript
{ isLocked: MutableRefObject<boolean>, camAngle: { pitch: number, yaw: number } }
```

**Features:**

- WASD + Arrow key movement
- Space to jump (with ground detection)
- Sprint after holding move for 1 second
- Gravity and collision resolution
- Respawn handling
- View mode switching

**Physics Constants:**

- `GRAVITY`: 18.0
- `JUMP_FORCE`: 13.0
- `SPEED`: 6.0 (12.0 when sprinting)

---

### usePlayerInteraction

**Path:** `hooks/usePlayerInteraction.ts`

Handles mining, placing, and combat.

```typescript
usePlayerInteraction({
  blockMap,
  position,
  inventory,
  setInventory,
  activeSlot,
  setBlocks,
  setCharacters,
  setPlayerHunger,
  viewMode,
  isLocked,
  targetPosRef,
  characters,
  onQuestUpdate
}: UsePlayerInteractionProps)
```

**Features:**

- **Left-click**: Mine blocks or attack enemies
- **Right-click**: Place blocks or interact with NPCs
- Raycast to find target block/entity
- Inventory management on gather
- Quest progress updates
- Apple consumption

---

### useGameAI

**Path:** `hooks/useGameAI.ts`

Runs AI behavior for all characters.

```typescript
useGameAI({
  characters,
  setCharacters,
  projectiles,
  setProjectiles,
  position,
  setPlayerHp,
  blockMap
}: UseGameAIProps)
```

**Features:**

- Updates characters every 50ms
- Routes to behavior module based on character type:
  - `isAquatic` → aquaticBehavior
  - `isEnemy` → enemyBehavior
  - `isFriendly` → friendlyBehavior
- Handles projectile movement and collisions
- Player damage from projectiles

---

### useMinimap

**Path:** `hooks/useMinimap.ts`

Renders the minimap canvas.

```typescript
useMinimap({
  playerPosRef,
  characters,
  blocks,
  filter,
  spawnMarkers
}: UseMinimapProps)
```

**Returns:**

```typescript
{
  canvasRef: RefObject<HTMLCanvasElement>,
  identifiedEntity: string | null,
  handleCanvasClick: (e: MouseEvent) => void
}
```

**Features:**

- Real-time canvas rendering at 60fps
- Filter-based visibility
- Spawn marker glow animation
- Click-to-identify entities

---

### useRainAudio

**Path:** `hooks/useRainAudio.ts`

Manages rain sound effects.

```typescript
useRainAudio(isRaining: boolean)
```

**Features:**

- Plays looping rain audio when `isRaining` is true
- Stops and cleans up when rain ends

---

## Utilities

### physics.ts

**Path:** `utils/physics.ts`

Physics and collision utilities.

#### Constants

```typescript
GRAVITY = 18.0;
JUMP_FORCE = 13.0;
SPEED = 6.0;
PLAYER_HEIGHT = 1.8;
PLAYER_WIDTH = 0.6;
```

#### createBlockMap

```typescript
createBlockMap(blocks: Block[]): Map<string, Block>
```

Converts block array to a Map for O(1) lookups.

**Key format:** `"x,y,z"` (rounded integers)

---

#### resolveCollision

```typescript
resolveCollision(
  position: THREE.Vector3,
  velocity: THREE.Vector3,
  delta: number,
  blockMap: Map<string, Block>
): { position: THREE.Vector3, velocity: THREE.Vector3, onGround: boolean }
```

AABB collision detection and resolution.

**Process:**

1. Apply gravity to velocity
2. Try X movement, revert if collision
3. Try Z movement, revert if collision
4. Try Y movement, check ground contact
5. Apply floor at y = -2 (water safety)

---

#### raycastBlock

```typescript
raycastBlock(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  blockMap: Map<string, Block>,
  maxDist: number = 5
): { block: Block | null, face: THREE.Vector3 | null, dist: number }
```

Simple step-marching raycast for mining.

**Used for:**

- Finding block to mine (left-click)
- Finding placement face (right-click)

---

### procedural.ts

**Path:** `utils/procedural.ts`

Procedural terrain generation.

#### generateInitialTerrain

```typescript
generateInitialTerrain(): Block[]
```

Generates the starting 40x40 terrain.

---

#### generateExpansion

```typescript
generateExpansion(currentSize: number, expansionSize: number): Block[]
```

Generates terrain for world expansion ring.

---

#### generateTerrainForRange

```typescript
generateTerrainForRange(
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  existingBounds?: {...}
): Block[]
```

Core terrain generation function.

**Features:**

- Deterministic height using sin/cos waves
- Water below y=0
- Sand near water
- Snow on peaks
- Stone on highlands
- 2% tree spawn chance on grass

---

### AI Behavior Modules

**Path:** `utils/ai/`

#### enemyBehavior.ts

```typescript
updateEnemyCharacter(
  char: Character,
  playerPos: THREE.Vector3,
  blockMap: Map<string, Block>,
  setProjectiles: Dispatch<SetStateAction<Projectile[]>>
): Character
```

**Behavior:**

- Chase player if within 15 blocks
- Stop near player (1.2 blocks, 3 for giants)
- Wander randomly when player is far
- Sorcerers fire projectiles every 5 seconds

---

#### friendlyBehavior.ts

```typescript
updateFriendlyCharacter(char: Character): Character
```

**Behavior:**

- Currently returns character unchanged
- Can be extended for NPC idle animations

---

#### aquaticBehavior.ts

```typescript
updateAquaticCharacter(
  char: Character,
  blockMap: Map<string, Block>
): Character
```

**Behavior:**

- Swim around in water blocks
- Bob up and down animation
- Stay within water areas
