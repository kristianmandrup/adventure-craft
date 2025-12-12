import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { audioManager } from './audio';

vi.unmock('./audio');

// Mock Sound Assets to ensure we have something to test with
vi.mock('./sound-assets', () => ({
  SOUND_ASSETS: {
    PLAYER_STEP: ['step1.mp3', 'step2.mp3'],
    PLAYER_ATTACK: ['attack.mp3']
  },
  SoundCategory: {
    PLAYER_STEP: 'PLAYER_STEP',
    PLAYER_ATTACK: 'PLAYER_ATTACK'
  }
}));

describe('AudioManager', () => {
    let mockContext: any;
    let mockGainNode: any;
    let mockBufferSource: any;

    beforeEach(() => {
        // Reset singleton state
        (audioManager as any).ctx = null;
        (audioManager as any).buffers = new Map();
        (audioManager as any).masterGain = null;
        
        mockGainNode = {
            gain: { value: 0 },
            connect: vi.fn()
        };
        
        // ... rest mocks

        mockBufferSource = {
            buffer: null,
            playbackRate: { value: 1 },
            connect: vi.fn(),
            start: vi.fn()
        };

        mockContext = {
            createGain: vi.fn(() => mockGainNode),
            createBufferSource: vi.fn(() => mockBufferSource),
            decodeAudioData: vi.fn().mockResolvedValue({ duration: 1 }), // Mock AudioBuffer
            destination: {},
            resume: vi.fn().mockResolvedValue(undefined),
            state: 'suspended'
        };

        // Mock class constructor for AudioContext
        class MockAudioContext {
            destination = {};
            state = 'suspended';
            // Use the outer variable directly as the function reference so calls are tracked on the SAME mock function
            createGain = mockContext.createGain;
            createBufferSource = mockContext.createBufferSource;
            decodeAudioData = mockContext.decodeAudioData;
            resume = mockContext.resume;
            constructor() {
                // If the code assigns `this.ctx = new AudioContext()`, then `this.ctx.createGain()` calls `MockAudioContext.prototype.createGain` (or instance).
                // We assigned the spies to the instance properties above.
            }
        }
        
        // Ensure mockContext methods are actually spies before assigning
        mockContext.createGain = vi.fn(() => mockGainNode);
        mockContext.createBufferSource = vi.fn(() => mockBufferSource);
        mockContext.decodeAudioData = vi.fn().mockResolvedValue({ duration: 1 });
        mockContext.resume = vi.fn().mockResolvedValue(undefined);
        
        // Re-declare class to capture these new assignments if needed, 
        // but JavaScript closure captures variables. 
        // However, we need to ensure the class uses the references that we are asserting on.
        
        class MockAudioContextDelegate {
             destination = {};
             state = 'suspended';
             createGain() { return mockContext.createGain(); }
             createBufferSource() { return mockContext.createBufferSource(); }
             decodeAudioData(b: any) { return mockContext.decodeAudioData(b); }
             resume() { return mockContext.resume(); }
        }

        // Just use invoke the mocks directly
        
        vi.stubGlobal('AudioContext', MockAudioContextDelegate);
        vi.stubGlobal('webkitAudioContext', MockAudioContextDelegate);
        
        // @ts-ignore
        window.AudioContext = MockAudioContextDelegate;
        // @ts-ignore
        window.webkitAudioContext = MockAudioContextDelegate;

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
        }));
        
        const mockSpeechSynthesis = {
            speak: vi.fn()
        };
        vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);
        vi.stubGlobal('SpeechSynthesisUtterance', vi.fn());
        
        // Reset manager internals if possible using a cast (hacky but needed for singleton)
        // (audioManager as any).ctx = null;
        // (audioManager as any).buffers.clear();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should be a singleton', () => {
        expect(audioManager).toBeDefined();
        // Since we import the instance, we check identity implies singleton usage essentially
        // Ideally we'd check AudioManager.getInstance() === audioManager but class is not exported
    });

    it('should initialize AudioContext', async () => {
        await audioManager.init();
        // We can't check if window.AudioContext was called because it's a class not a spy.
        // But we can check if the methods inside it were called.
        expect(mockContext.createGain).toHaveBeenCalled();
    });

    it('should set volume correctly', async () => {
        await audioManager.init();
        audioManager.setVolume(0.5);
        expect(mockGainNode.gain.value).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', async () => {
        await audioManager.init();
        audioManager.setVolume(1.5);
        expect(mockGainNode.gain.value).toBe(1);
        audioManager.setVolume(-0.5);
        expect(mockGainNode.gain.value).toBe(0);
    });

    it('should attempt to load and play SFX', async () => {
        // @ts-ignore
        await audioManager.playSFX('PLAYER_ATTACK');
        
        expect(global.fetch).toHaveBeenCalled();
        expect(mockContext.decodeAudioData).toHaveBeenCalled();
        expect(mockContext.createBufferSource).toHaveBeenCalled();
        expect(mockBufferSource.start).toHaveBeenCalled();
    });

    it('should play spatial SFX with volume attenuation', async () => {
        const spy = vi.spyOn(audioManager, 'playSFX').mockImplementation(() => Promise.resolve());
        
        // Dist 0 -> 1.0
        // @ts-ignore
        audioManager.playSpatialSFX('PLAYER_STEP', 0);
        expect(spy).toHaveBeenCalledWith('PLAYER_STEP', 1);

        // Dist 15 -> 0.5
        // @ts-ignore
        audioManager.playSpatialSFX('PLAYER_STEP', 15);
        expect(spy).toHaveBeenCalledWith('PLAYER_STEP', 0.5);
        
        spy.mockRestore();
    });

    it('should not play spatial SFX if too far', async () => {
        const spy = vi.spyOn(audioManager, 'playSFX').mockImplementation(() => Promise.resolve());
        
        // @ts-ignore
        audioManager.playSpatialSFX('PLAYER_STEP', 31);
        expect(spy).not.toHaveBeenCalled();
        
        spy.mockRestore();
    });
    
    it('should use speech synthesis for speak', () => {
        audioManager.speak("Hello");
        expect(window.speechSynthesis.speak).toHaveBeenCalled();
        expect(window.SpeechSynthesisUtterance).toHaveBeenCalledWith("Hello");
    });
    
    it('should fail gracefully if fetch errors', async () => {
        // Clear previous calls
        (mockContext.createBufferSource as any).mockClear();
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error("Network fail")));
        
        // @ts-ignore
        await audioManager.playSFX('PLAYER_ATTACK');
        
        // Should NOT create buffer source if fetch failed
        expect(mockContext.createBufferSource).not.toHaveBeenCalled();
    });

    it('should not initialize if already initialized', async () => {
        await audioManager.init();
        // reset inner spies
        (mockContext.createGain as any).mockClear();
        
        await audioManager.init();
        // Should not create new gain node implies init didn't re-run full setup
        expect(mockContext.createGain).not.toHaveBeenCalled();
    });
});
