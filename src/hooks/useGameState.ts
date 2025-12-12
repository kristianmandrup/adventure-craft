import { audioManager } from '../utils/audio';
import { useState, useCallback, useEffect } from 'react';
import { Job, Quest, Character, ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useGameState = (onXpGain: (amount: number) => void) => {
    const [gameStarted, setGameStarted] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    
    // Quest State
    const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
    const [questMessage, setQuestMessage] = useState<string | null>(null);

    // Chat / Shop
    const [activeDialogNpcId, setActiveDialogNpcId] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
    const [shopOpen, setShopOpen] = useState(false);
    const [activeMerchant, setActiveMerchant] = useState<Character | null>(null);

    // Notifications
    const [notification, setNotification] = useState<{ message: string, subMessage?: string, type: import('../types').NotificationType, icon?: string, duration?: number } | null>(null);
    const [hasApiKey, setHasApiKey] = useState(true);

    useEffect(() => {
        // @ts-ignore
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey || apiKey === 'undefined' || apiKey === '') setHasApiKey(false);
    }, []);

    const updateJobStatus = useCallback((id: string, status: Job['status'], message?: string) => {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status, message } : j));
        setTimeout(() => setJobs(prev => prev.filter(j => j.id !== id)), 5000);
    }, []);

    const generateRandomQuest = useCallback(() => {
        const types = ['GATHER', 'HUNT'];
        const type = types[Math.floor(Math.random() * types.length)];
        let quest: Quest;
        
        if (type === 'GATHER') {
            const resources = ['wood', 'stone', 'leaf', 'dirt'];
            // ... (Logic from App.tsx) - Simplifying for brevity in this step, but needs full logic
            const resource = resources[Math.floor(Math.random() * resources.length)];
            const amount = Math.floor(Math.random() * 10) + 5;
            quest = { id: uuidv4(), title: `Gather ${amount} ${resource}`, requirements: { [resource]: amount }, progress: { [resource]: 0 }, completed: false };
        } else {
             // ... Hunt logic
             const enemies = ['zombie', 'spider', 'skeleton'];
             const enemy = enemies[Math.floor(Math.random() * enemies.length)];
             const amount = Math.floor(Math.random() * 3) + 1;
             quest = { id: uuidv4(), title: `Hunt ${amount} ${enemy}s`, requirements: { [enemy]: amount }, progress: { [enemy]: 0 }, completed: false };
        }
        setCurrentQuest(quest);
    }, []);

    const onQuestUpdate = useCallback((type: string, amount: number) => {
        setCurrentQuest(prev => {
            if (!prev || prev.completed) return prev;
            // Simplified match
            let key = type;
            const keys = Object.keys(prev.requirements);
            const match = keys.find(k => type.includes(k));
            if (match) key = match;
            else return prev;

            const newProgress = { ...prev.progress, [key]: (prev.progress[key] || 0) + amount };
            let isComplete = true;
            for (const k of keys) {
                if ((newProgress[k] || 0) < prev.requirements[k]) isComplete = false;
            }

            if (isComplete) {
                setQuestMessage("Quest Complete!");
                onXpGain(100); 
                try { audioManager.playSFX('UI_ACHIEVEMENT'); } catch(e) {}
                setTimeout(() => {
                    setQuestMessage(null);
                    generateRandomQuest();
                }, 4000);
            }
            return { ...prev, progress: newProgress, completed: isComplete };
        });
    }, [onXpGain, generateRandomQuest]);

    return {
        gameStarted, setGameStarted,
        jobs, setJobs, updateJobStatus,
        currentQuest, setCurrentQuest, questMessage, setQuestMessage,
        activeDialogNpcId, setActiveDialogNpcId,
        chatHistory, setChatHistory,
        shopOpen, setShopOpen,
        activeMerchant, setActiveMerchant,
        notification, setNotification,
        hasApiKey,
        generateRandomQuest, onQuestUpdate
    };
};
