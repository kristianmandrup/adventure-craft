import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateStructure, generateCharacter, generateItem, generateDialogue } from './geminiService';

// Mock dependencies
const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() }
});

vi.mock('@google/genai', () => {
    // Use a mock class for constructor compatibility
    class MockClient {
        models = {
            generateContent: mockGenerateContent
        };
        constructor(config: any) {}
    }

    return {
      GoogleGenAI: MockClient,
      Type: {
          OBJECT: 'OBJECT',
          STRING: 'STRING',
          INTEGER: 'INTEGER',
          ARRAY: 'ARRAY'
      }
    };
});

describe('geminiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.API_KEY = 'test-key';
    });

    describe('generateStructure', () => {
        it('should generate structure on success', async () => {
             const mockResponse = {
                 text: JSON.stringify({ description: 'Test', blocks: [{ x: 0, y: 0, z: 0, color: 'red' }] })
             };
             mockGenerateContent.mockResolvedValue(mockResponse);

             const result = await generateStructure('castle', 10);
             
             expect(result.description).toBe('Test');
             expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
                 contents: 'castle',
                 config: expect.objectContaining({
                     responseSchema: expect.anything()
                 })
             }));
        });

        it('should handle API failure', async () => {
             mockGenerateContent.mockRejectedValue(new Error('API Error'));
             await expect(generateStructure('fail', 0)).rejects.toThrow('API Error');
        });

        it('should throw if no text returned', async () => {
             mockGenerateContent.mockResolvedValue({ text: null });
             await expect(generateStructure('empty', 0)).rejects.toThrow('No response from AI');
        });
        
        it('should prioritize towers', async () => {
             const mockResponse = {
                 text: JSON.stringify({ description: 'Tower', blocks: [] })
             };
             mockGenerateContent.mockResolvedValue(mockResponse);
             
             await generateStructure('build a tower', 0);
             
             const options = mockGenerateContent.mock.calls[0][0];
             expect(options.config.systemInstruction).toContain('VERY TALL');
        });
    });

    describe('generateCharacter', () => {
        it('should generate character', async () => {
             const mockData = { description: 'Orc', parts: [] };
             mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockData) });
             
             const result = await generateCharacter('orc');
             expect(result).toEqual(mockData);
        });
    });

    describe('generateItem', () => {
        it('should generate item', async () => {
             const mockData = { name: 'Sword', color: '#fff', description: 'Sharp' };
             mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockData) });
             
             const result = await generateItem('sword');
             expect(result).toEqual(mockData);
        });
    });

    describe('generateDialogue', () => {
        it('should return text response', async () => {
             mockGenerateContent.mockResolvedValue({ text: 'Hello there!' });
             const result = await generateDialogue('Npc', 'Hi', []);
             expect(result).toBe('Hello there!');
        });

        it('should return fallback on error', async () => {
            mockGenerateContent.mockRejectedValue(new Error('Fail'));
            const result = await generateDialogue('Npc', 'Hi', []);
            expect(result).toBe('I cannot speak right now.');
        });
    });
});
