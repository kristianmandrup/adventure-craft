import { useState, useRef } from 'react';
import { GenerationMode } from '../types';

interface  UseGenerationInputProps {
  onGenerate: (prompt: string, mode: GenerationMode, count: number, isEnemy?: boolean) => void;
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

export const useGenerationInput = ({ onGenerate, count, setCount }: UseGenerationInputProps) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('STRUCTURE');
  const [isEnemy, setIsEnemy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt, mode, count, isEnemy);
    setPrompt('');
  };

  const toggleMic = () => {
    if (isListening) return; 

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setPrompt(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return {
    prompt,
    setPrompt,
    mode,
    setMode,
    isEnemy,
    setIsEnemy,
    isListening,
    inputRef,
    handleSend,
    toggleMic
  };
};
