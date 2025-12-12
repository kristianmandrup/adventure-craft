import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGenerationInput } from './useGenerationInput';

describe('useGenerationInput', () => {
    let onGenerate: any;
    let setCount: any;
    
    beforeEach(() => {
        onGenerate = vi.fn();
        setCount = vi.fn();
    });

    const getDefaultProps = () => ({
        onGenerate,
        count: 1,
        setCount
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useGenerationInput(getDefaultProps()));
        expect(result.current.prompt).toBe('');
        expect(result.current.mode).toBe('STRUCTURE');
        expect(result.current.isEnemy).toBe(false);
    });

    it('should update prompt and call onGenerate when sending', () => {
        const { result } = renderHook(() => useGenerationInput(getDefaultProps()));

        act(() => {
            result.current.setPrompt('Test Castle');
        });

        expect(result.current.prompt).toBe('Test Castle');

        act(() => {
            result.current.handleSend();
        });

        expect(onGenerate).toHaveBeenCalledWith('Test Castle', 'STRUCTURE', 1, false);
        expect(result.current.prompt).toBe(''); // Should reset
    });

    it('should NOT call onGenerate if prompt is empty', () => {
        const { result } = renderHook(() => useGenerationInput(getDefaultProps()));

        act(() => {
            result.current.setPrompt('   '); // Whitespace
            result.current.handleSend();
        });

        expect(onGenerate).not.toHaveBeenCalled();
    });

    it('should handle mode and enemy toggle changes', () => {
        const { result } = renderHook(() => useGenerationInput(getDefaultProps()));

        act(() => {
            result.current.setMode('CHARACTER');
            result.current.setIsEnemy(true);
        });

        expect(result.current.mode).toBe('CHARACTER');
        expect(result.current.isEnemy).toBe(true);

        // Verify send uses new values
        act(() => {
            result.current.setPrompt('Orc');
        });
        
        act(() => {
            result.current.handleSend();
        });
        
        expect(onGenerate).toHaveBeenCalledWith('Orc', 'CHARACTER', 1, true);
    });

    it('should handle SpeechRecognition if supported', () => {
        
        // Mock Constructible Class
        class MockSpeechRecognition {
            start = vi.fn().mockImplementation(function(this: any) {
                if (this.onstart) this.onstart();
            });
            stop = vi.fn().mockImplementation(function(this: any) {
                 if (this.onend) this.onend();
            });
            abort = vi.fn();
            lang = 'en-US';
            interimResults = false;
            maxAlternatives = 1;
            onresult = null;
            onerror = null;
            onend = null;
            onstart = null;
        }

        (window as any).SpeechRecognition = MockSpeechRecognition;
        (window as any).webkitSpeechRecognition = MockSpeechRecognition;

        const { result } = renderHook(() => useGenerationInput(getDefaultProps()));

        act(() => {
            result.current.toggleMic();
        });

        // expect start to have been called - implicit by isListening true
        expect(result.current.isListening).toBe(true);
        
        // toggleMic() only starts it, stopping is handled by callbacks in the actual hook
        // but we can simulate end
        act(() => {
           // Simulate end
           // result.current.toggleMic(); // actually the hook guards if(isListening) return;
        });
    });

    it('should alert if SpeechRecognition is NOT supported', () => {
        // Remove mocks
        vi.stubGlobal('SpeechRecognition', undefined);
        vi.stubGlobal('webkitSpeechRecognition', undefined);
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { result } = renderHook(() => useGenerationInput(getDefaultProps()));

        act(() => {
            result.current.toggleMic();
        });

        expect(alertMock).toHaveBeenCalledWith("Speech recognition not supported in this browser.");
    });
});
