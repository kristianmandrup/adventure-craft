# Getting Started

This guide walks you through setting up and running Adventure Craft locally.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Google Gemini API Key** — Get one from [Google AI Studio](https://aistudio.google.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/adventure-craft.git
cd adventure-craft
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

> [!IMPORTANT]
> The API key is required for AI content generation. Without it, structures, characters, and items cannot be generated.

## Running the Project

### Development Mode

```bash
npm run dev
```

This starts the Vite development server at `http://localhost:3000` with hot module replacement.

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` folder.

### Production Server

```bash
npm start
```

Starts the Node.js server on port `8080` (or `PORT` environment variable). This is what runs on Cloud Run.

### Preview Build

```bash
npm run preview
```

Preview the production build locally using Vite's preview server.

## Game Controls

| Control               | Action                          |
| --------------------- | ------------------------------- |
| **WASD / Arrow Keys** | Move                            |
| **Space**             | Jump                            |
| **Left Click**        | Mine/Attack                     |
| **Right Click**       | Place block / Interact with NPC |
| **Mouse**             | Look around                     |
| **1-5**               | Select hotbar slot              |
| **Enter**             | Focus generation input          |
| **C**                 | Toggle crafting menu            |
| **N**                 | Reset world                     |
| **R**                 | Respawn player                  |
| **M**                 | Expand world                    |
| **H**                 | Reset camera view               |

## First Steps

1. **Start the game** — Click anywhere on the start screen to lock your pointer
2. **Explore** — Move around the procedurally generated terrain
3. **Generate content** — Use the bottom input bar to generate structures or characters
4. **Spawn creatures** — Use the spawn menu buttons for quick spawning
5. **Complete quests** — Check the quest panel and gather resources or hunt enemies

## Troubleshooting

### "API Key must be set" Error

Ensure your `.env` file contains a valid `GEMINI_API_KEY` and restart the dev server.

### Controls Not Working

- Click on the game canvas to lock the pointer
- Check if you're focused on an input field (press Escape first)

### Performance Issues

- Try reducing the world expansion level
- Close other browser tabs
- Use Chrome or Edge for best WebGL performance
