import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CharacterHealthBar } from './CharacterHealthBar';
import { Character } from '../../types';

// Mock @react-three/drei Html component since it requires Three.js context
vi.mock('@react-three/drei', () => ({
  Html: ({ children }: any) => <div data-testid="drei-html">{children}</div>
}));

describe('CharacterHealthBar', () => {
    const mockCharacter: Character = {
        id: '1',
        name: 'TestChar',
        rotation: 0,
        parts: [],
        maxHp: 100,
        hp: 50,
        isEnemy: false,
        isFriendly: true
    };

    it('should render when character has damage', () => {
        render(<CharacterHealthBar character={mockCharacter} />);
        expect(screen.getByTestId('drei-html')).toBeInTheDocument();
    });

    it('should return null when character has full health', () => {
        const fullHpChar = { ...mockCharacter, hp: 100 };
        const { container } = render(<CharacterHealthBar character={fullHpChar} />);
        expect(container.firstChild).toBeNull();
        expect(screen.queryByTestId('drei-html')).not.toBeInTheDocument();
    });

    it('should render green bar for friendly characters', () => {
        render(<CharacterHealthBar character={mockCharacter} />);
        const bar = screen.getByTestId('health-bar-fill');
        expect(bar).toHaveStyle({ background: '#4ade80' });
    });

    it('should render red bar for enemy characters', () => {
        const enemyChar = { ...mockCharacter, isFriendly: false, isEnemy: true };
        render(<CharacterHealthBar character={enemyChar} />);
        const bar = screen.getByTestId('health-bar-fill');
        expect(bar).toHaveStyle({ background: '#ef4444' });
    });

    it('should calculate correct width based on HP', () => {
        const damagedChar = { ...mockCharacter, hp: 25, maxHp: 100 };
        render(<CharacterHealthBar character={damagedChar} />);
        const bar = screen.getByTestId('health-bar-fill');
        expect(bar).toHaveStyle({ width: '25%' });
    });

    it('should handle zero hp gracefully', () => {
         const deadChar = { ...mockCharacter, hp: -10, maxHp: 100 };
         render(<CharacterHealthBar character={deadChar} />);
         const bar = screen.getByTestId('health-bar-fill');
         expect(bar).toHaveStyle({ width: '0%' });
    });
});
