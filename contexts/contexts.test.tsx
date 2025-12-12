import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PlayerProvider, usePlayerContext } from './PlayerContext';
import { WorldProvider, useWorldContext } from './WorldContext';
import { UIProvider, useUIContext } from './UIContext';

// Test component that uses PlayerContext
const PlayerConsumer: React.FC = () => {
    const { playerHp, playerLevel } = usePlayerContext();
    return <div data-testid="player-data">{`HP: ${playerHp}, Level: ${playerLevel}`}</div>;
};

// Test component that uses WorldContext
const WorldConsumer: React.FC = () => {
    const { isDay, isRaining } = useWorldContext();
    return <div data-testid="world-data">{`Day: ${isDay}, Rain: ${isRaining}`}</div>;
};

// Test component that uses UIContext
const UIConsumer: React.FC = () => {
    const { gameMode } = useUIContext();
    return <div data-testid="ui-data">{`Mode: ${gameMode}`}</div>;
};

describe('Context Providers', () => {
    describe('PlayerContext', () => {
        it('should provide player values to children', () => {
            const mockValue = {
                playerHp: 85,
                setPlayerHp: vi.fn(),
                playerHunger: 90,
                setPlayerHunger: vi.fn(),
                inventory: [],
                setInventory: vi.fn(),
                activeSlot: 0,
                setActiveSlot: vi.fn(),
                respawnTrigger: 0,
                onRespawn: vi.fn(),
                resetViewTrigger: 0,
                onResetView: vi.fn(),
                viewMode: 'FP' as const,
                setViewMode: vi.fn(),
                playerPosRef: { current: null },
                targetPosRef: { current: null },
                playerXp: 150,
                playerLevel: 3,
                playerGold: 500,
                levelUpMessage: null,
                onXpGain: vi.fn(),
                onGoldGain: vi.fn(),
                playerStats: { attackMultiplier: 1.2, speedMultiplier: 1.1, defenseReduction: 0.1 },
                XP_THRESHOLDS: [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200],
                equipment: { head: null, chest: null, feet: null, mainHand: null, offHand: null },
                equipFromInventory: vi.fn(),
                unequipItem: vi.fn(),
                eatItem: vi.fn(),
                craftItem: vi.fn(),
            };

            render(
                <PlayerProvider value={mockValue}>
                    <PlayerConsumer />
                </PlayerProvider>
            );

            expect(screen.getByTestId('player-data')).toHaveTextContent('HP: 85, Level: 3');
        });

        it('should throw error when used outside provider', () => {
            // Suppress console error for this test
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => {
                render(<PlayerConsumer />);
            }).toThrow('usePlayerContext must be used within a PlayerProvider');
            
            spy.mockRestore();
        });
    });

    describe('WorldContext', () => {
        it('should provide world values to children', () => {
            const mockValue = {
                blocks: [],
                setBlocks: vi.fn(),
                characters: [],
                setCharacters: vi.fn(),
                projectiles: [],
                setProjectiles: vi.fn(),
                droppedItems: [],
                setDroppedItems: vi.fn(),
                spawnMarkers: [],
                isDay: false,
                setIsDay: vi.fn(),
                isRaining: true,
                expansionLevel: 1,
                handleExpand: vi.fn(),
                handleShrink: vi.fn(),
                portalActive: false,
                portalPosition: null,
                portalColor: '#a855f7',
                isUnderworld: false,
                enterUnderworld: vi.fn(),
            };

            render(
                <WorldProvider value={mockValue}>
                    <WorldConsumer />
                </WorldProvider>
            );

            expect(screen.getByTestId('world-data')).toHaveTextContent('Day: false, Rain: true');
        });

        it('should throw error when used outside provider', () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => {
                render(<WorldConsumer />);
            }).toThrow('useWorldContext must be used within a WorldProvider');
            
            spy.mockRestore();
        });
    });

    describe('UIContext', () => {
        it('should provide UI values to children', () => {
            const mockValue = {
                jobs: [],
                currentQuest: null,
                questMessage: null,
                onQuestUpdate: vi.fn(),
                notification: null,
                setNotification: vi.fn(),
                showNotification: vi.fn(),
                activeDialogNpcId: null,
                setActiveDialogNpcId: vi.fn(),
                chatHistory: {},
                shopOpen: false,
                setShopOpen: vi.fn(),
                activeMerchant: null,
                setActiveMerchant: vi.fn(),
                hasApiKey: false,
                gameMode: 'ADVENTURE' as const,
            };

            render(
                <UIProvider value={mockValue}>
                    <UIConsumer />
                </UIProvider>
            );

            expect(screen.getByTestId('ui-data')).toHaveTextContent('Mode: ADVENTURE');
        });

        it('should throw error when used outside provider', () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => {
                render(<UIConsumer />);
            }).toThrow('useUIContext must be used within a UIProvider');
            
            spy.mockRestore();
        });
    });
});
