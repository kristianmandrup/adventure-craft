# Features

This document details all the features available in Adventure Craft.

## AI Content Generation

Adventure Craft uses Google Gemini AI to generate game content on-demand.

> [!NOTE]
> If GEMINI_API_KEY is not set, a warning banner will appear and AI features will be disabled. You can still play with predefined prefabs.

### Structure Generation

Generate voxel structures by typing prompts:

```
"Medieval castle with towers"
"Wooden bridge over river"
"Wizard tower with magical crystals"
"Underground dungeon entrance"
```

**How it works:**

1. Enter your prompt in the generation input
2. Select "STRUCTURE" mode (or type naturally)
3. The AI returns a list of voxel blocks with positions and colors
4. Blocks are placed at the target location (crosshair or random)

**Limits:**

- ~400 blocks per structure (800 for towers)
- Uses `gemini-2.5-flash` for fast generation

### Character Generation

Spawn AI-designed creatures:

```
"Green dragon with wings"
"Medieval knight in armor"
"Giant spider with red eyes"
```

**Character types:**
| Type | Behavior |
|------|----------|
| **Enemy** | Chases and attacks player |
| **Friendly** | Can be talked to (right-click) |
| **Giant** | 3x scale, high HP |
| **Aquatic** | Swims in water |

**Character anatomy:**

- Head, body, left/right arms, left/right legs
- Each part animates separately
- Walking animation when moving

### Item Generation

Create custom inventory items:

```
"Magic healing potion"
"Ancient map scroll"
"Golden key"
```

Items are added to your inventory with a generated name and color.

---

## Procedural Terrain

The world is generated procedurally using deterministic height functions.

### Terrain Features

| Feature   | Description                           |
| --------- | ------------------------------------- |
| **Grass** | Green surface blocks on normal height |
| **Stone** | Gray blocks on higher elevations      |
| **Snow**  | White caps on the highest peaks       |
| **Water** | Blue blocks filling low areas         |
| **Sand**  | Beach transition near water           |
| **Trees** | Oak, pine, and birch varieties        |

### Tree Types

1. **Oak** — Classic round canopy, brown trunk
2. **Pine** — Cone-shaped, darker leaves
3. **Birch** — Tall and thin, white trunk, lime leaves

Trees have **50 HP** and require multiple hits to cut down:

- **Axe**: 10 damage per hit (5 hits to break)
- **Fist**: 2 damage per hit (25 hits!)

Trees can drop **apples** (red blocks in leaves) and wood with axe gives 2-5 logs.

### World Expansion & Shrinking

Press **M** to expand the world, or use the shrink button:

- Starts at 80x80 blocks
- Each expansion adds 20 blocks in each direction
- Maximum 3 expansions (140x140 total)
- Shrinking removes blocks and entities outside the new bounds

---

## Economy & Gold

### Gold System

- Gold counter displayed in the top bar
- **Enemy drops**: 20% chance to drop gold on kill
  - Zombie: 5-10 gold
  - Skeleton: 8-15 gold
  - Spider: 5-12 gold
  - Sorcerer: 15-25 gold
  - Giant: 30-50 gold
  - Boss: 50-100 gold

### Merchant Shop

Interact with a **Merchant** NPC to open the shop panel:

| Item           | Price |
| -------------- | ----- |
| Iron Sword     | 50g   |
| Woodcutter Axe | 40g   |
| Hunter Bow     | 75g   |
| Arrows (x10)   | 20g   |
| Steel Shield   | 40g   |
| Torch          | 15g   |
| Fresh Apple    | 5g    |

---

## Combat System

### Weapons

| Weapon    | Damage | Notes                         |
| --------- | ------ | ----------------------------- |
| **Fist**  | 10     | Default                       |
| **Sword** | 20     | +attack multiplier from level |
| **Bow**   | 15     | Ranged, uses arrows           |
| **Axe**   | 10     | Also used for tree cutting    |

### Movement & Physics

- **Basic Movement**: WASD controls with smooth acceleration.
- **Sprinting**: Hold movement keys for >1 second to transition from Walk (10u/s) to Sprint (18u/s).
- **Jump**: Spacebar (Height approx 2 blocks).
- **Physics**: AABB Collision detection, gravity, and "unstuck" logic.

### Debugging Tools

- **Movement Overlay**: Bottom-right panel showing:
  - **Status**: Locked/Unlocked.
  - **Direction**: Compass heading (N, NE, etc) and degrees.
  - **Speed**: Current velocity.
  - **State**: Idle / Walking / Sprinting.
- **Keys**: Active key press display.

### Defense

- **Shield**: Doubles level defense bonus when in inventory
- **Level Defense**: Higher levels reduce incoming damage
- Defense applies to enemy projectile attacks

### Experience & Levels

Kill enemies to gain XP:

| Enemy      | XP Reward |
| ---------- | --------- |
| Zombie     | 10        |
| Spider     | 8         |
| Skeleton   | 15        |
| Sorcerer   | 25        |
| Giant/Boss | 50        |

Each level increases:

- Attack damage multiplier
- Movement speed
- Defense reduction

---

## Spawning System

### Entity Caps

| Type    | Maximum |
| ------- | ------- |
| Enemies | 20      |
| Animals | 10      |
| NPCs    | 10      |

### Spawn Rules

- **Random spawns** occur every 10-20 seconds
- Faster spawns in underworld (8s) and at higher levels
- Entities spawn at least **5 blocks away** from player
- **Non-aquatic** creatures won't spawn in water
- **Fish** can only spawn in water

### Prefab Characters

**Animals**: Sheep, Cow, Pig, Chicken, Fish, Horse

**Enemies**: Zombie, Skeleton, Spider, Sorcerer, Giant Ogre

**NPCs**: Villager, Knight, Wizard, Merchant

---

## Portal System

### Portal Spawning

- Portal spawns **60-120 seconds** after game starts
- Appears as an obsidian frame with purple interior
- Shown on minimap with spawn marker flash

### Underworld

The underworld features:

- No trees, only dead bushes
- More dramatic terrain with higher mountains
- Lava pools in low areas
- Dark volcanic rock surfaces
- 3-4 caves with a boss in one

---

## Controls

### Movement

| Key           | Action                         |
| ------------- | ------------------------------ |
| W/↑           | Move forward                   |
| S/↓           | Move backward                  |
| A/←           | Strafe left                    |
| D/→           | Strafe right                   |
| Space         | Jump                           |
| **N**         | New Game (Reset World)         |
| **R**         | Random Respawn (Unstuck)       |
| **H**         | Level View (Reset Pitch to 0°) |
| **V**         | Toggle View (First/Third)      |
| **-**         | Shrink World Size              |
| **P**         | Toggle Physics (Accel/Direct)  |
| Hold movement | Sprint (after 1s)              |

### Camera & Environment

- **Constrained View**: Pitch limited to +/- 45 degrees to prevent disorientation.
- **Level Shortcut**: Press 'H' to instantly level the camera.
- **Clouds**: Slow, atmospheric movement (Speed: 0.01).

### Interaction

| Action        | Control     |
| ------------- | ----------- |
| Attack/Mine   | Left click  |
| Place/Eat/Use | Right click |
| Switch hotbar | 1-5 keys    |

### UI Shortcuts

| Key   | Action                  |
| ----- | ----------------------- |
| H     | Toggle overhead/FP view |
| M     | Expand world            |
| C     | Crafting menu           |
| R     | Respawn/Unstuck         |
| Enter | Open chat input         |

---

## Debug Information

A debug panel shows:

- **LOCKED**: Whether mouse is captured
- **KEYS**: Currently pressed movement keys (WASD)
- **SPEED**: Current movement velocity
- **MOVING**: Whether actively moving
- **PITCH/YAW**: Camera angles
