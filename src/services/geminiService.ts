import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResponse, CharacterGenerationResponse, ChatMessage, ItemGenerationResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const selectModel = () => {
    const r = Math.random();
    if (r < 0.3) return "gemini-flash-2.5";
    if (r < 0.7) return "gemini-2.5-pro"; // 0.3 + 0.4
    return "gemini-3.0-preview";
};

// --- Schemas ---

const blockSchema = {
  type: Type.OBJECT,
  properties: {
    x: { type: Type.INTEGER, description: "X coordinate (integers only)" },
    y: { type: Type.INTEGER, description: "Y coordinate (height, must be >= 0)" },
    z: { type: Type.INTEGER, description: "Z coordinate (integers only)" },
    color: { type: Type.STRING, description: "Hex color code for the block (e.g., #8B4513)" },
    type: { type: Type.STRING, description: "Material type description (e.g., wood, stone, water)" }
  },
  required: ["x", "y", "z", "color"]
};

const structureResponseSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "A short confirmation of what was built." },
    blocks: {
      type: Type.ARRAY,
      items: blockSchema,
      description: "List of voxel blocks to add to the world."
    }
  },
  required: ["description", "blocks"]
};

const characterVoxelSchema = {
  type: Type.OBJECT,
  properties: {
    x: { type: Type.INTEGER, description: "Local X" },
    y: { type: Type.INTEGER, description: "Local Y" },
    z: { type: Type.INTEGER, description: "Local Z" },
    color: { type: Type.STRING, description: "Hex color" }
  },
  required: ["x", "y", "z", "color"]
};

const characterPartSchema = {
  type: Type.OBJECT,
  properties: {
    name: { 
      type: Type.STRING, 
      enum: ['head', 'body', 'left_arm', 'right_arm', 'left_leg', 'right_leg', 'misc'],
      description: "Name of the body part for animation purposes." 
    },
    voxels: {
      type: Type.ARRAY,
      items: characterVoxelSchema
    }
  },
  required: ["name", "voxels"]
};

const characterResponseSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "Name/Description of the creature" },
    parts: {
      type: Type.ARRAY,
      items: characterPartSchema,
      description: "Segmented body parts of the character."
    }
  },
  required: ["description", "parts"]
};

const itemResponseSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the item" },
    color: { type: Type.STRING, description: "A representative hex color for the item icon" },
    description: { type: Type.STRING, description: "Short description" }
  },
  required: ["name", "color", "description"]
};

// --- Generators ---

export const generateStructure = async (
  prompt: string, 
  currentBlocksCount: number
): Promise<GenerationResponse> => {
  
  // Switched to Flash for better quota management
  const modelId = selectModel(); 
  const isTower = prompt.toLowerCase().includes('tower');

  const systemInstruction = `
    You are a Minecraft Voxel Architect using Gemini.
    Generate 3D structures based on user prompts.
    
    Coordinate System:
    - Y is vertical (up/down).
    - X and Z are horizontal.
    
    Rules:
    1. Creative, vibrant colors.
    2. Limit to ${isTower ? '800' : '400'} blocks (optimized for Flash).
    3. If creating liquid (water/lava), use appropriate colors.
    4. Return blocks relative to a sensible center point, but using world coordinates generally centered around 0,0 unless specified.
    5. Assume terrain exists, build on top or integrate with it.
    ${isTower ? '6. IMPORTANT: The user requested a TOWER. It MUST be VERY TALL. Prioritize vertical height.' : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: structureResponseSchema,
        temperature: 1.0, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GenerationResponse;

  } catch (error) {
    console.error("Gemini Structure Generation Error:", error);
    throw error;
  }
};

export const generateCharacter = async (prompt: string): Promise<CharacterGenerationResponse> => {
  const modelId = selectModel();

  const systemInstruction = `
    You are a Voxel Character Designer.
    Design a creature or human.
    
    CRITICAL: You must segment the character into parts: 'head', 'body', 'left_arm', 'right_arm', 'left_leg', 'right_leg'.
    If it is a 4-legged animal, use arms as front legs.
    
    Format:
    - Voxels are LOCAL coordinates.
    - Center of character is roughly (0,0,0).
    - Legs should be at the bottom (negative Y or low Y).
    - Head at top.
    - Max size: 16x16x16.
    - Use high contrast colors.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Create a character: ${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: characterResponseSchema,
        temperature: 1.0,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as CharacterGenerationResponse;
  } catch (error) {
    console.error("Gemini Character Generation Error:", error);
    throw error;
  }
};

export const generateItem = async (prompt: string): Promise<ItemGenerationResponse> => {
  const modelId = selectModel();

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Create an inventory item based on this description: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: itemResponseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ItemGenerationResponse;
  } catch (error) {
    console.error("Gemini Item Generation Error:", error);
    throw error;
  }
};

export const generateDialogue = async (npcName: string, playerMessage: string, history: ChatMessage[]) => {
  const modelId = selectModel(); // Fast model for chat
  
  const conversation = history.map(h => `${h.sender}: ${h.text}`).join('\n');
  const context = `You are playing the role of ${npcName} in a fantasy voxel RPG. 
  Keep your responses concise (under 20 words). Be helpful but stay in character.
  Previous conversation:
  ${conversation}
  
  Player: ${playerMessage}
  ${npcName}:`;

  try {
     const response = await ai.models.generateContent({
       model: modelId,
       contents: context,
     });
     return response.text?.trim() || "...";
  } catch (e) {
    console.error(e);
    return "I cannot speak right now.";
  }
};