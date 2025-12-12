import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QuestDisplay } from './QuestDisplay';
import { Quest } from '../../types';

describe('QuestDisplay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render nothing when no quest', () => {
        const { container } = render(<QuestDisplay quest={null} questMessage={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('should display quest title', () => {
        const quest: Quest = {
            id: 'q1',
            title: 'Gather 5 wood',
            requirements: { wood: 5 },
            progress: { wood: 0 },
            completed: false,
        };
        
        render(<QuestDisplay quest={quest} questMessage={null} />);
        
        expect(screen.getByText('Gather 5 wood')).toBeInTheDocument();
    });

    it('should display quest progress', () => {
        const quest: Quest = {
            id: 'q1',
            title: 'Gather 10 stone',
            requirements: { stone: 10 },
            progress: { stone: 3 },
            completed: false,
        };
        
        render(<QuestDisplay quest={quest} questMessage={null} />);
        
        expect(screen.getByText('3/10')).toBeInTheDocument();
    });

    it('should display quest complete message', () => {
        render(<QuestDisplay quest={null} questMessage="Quest Complete!" />);
        
        expect(screen.getByText('Quest Complete!')).toBeInTheDocument();
    });

    it('should display multiple requirements', () => {
        const quest: Quest = {
            id: 'q1',
            title: 'Hunt enemies',
            requirements: { zombie: 3, skeleton: 2 },
            progress: { zombie: 1, skeleton: 0 },
            completed: false,
        };
        
        render(<QuestDisplay quest={quest} questMessage={null} />);
        
        expect(screen.getByText('zombie')).toBeInTheDocument();
        expect(screen.getByText('skeleton')).toBeInTheDocument();
        expect(screen.getByText('1/3')).toBeInTheDocument();
        expect(screen.getByText('0/2')).toBeInTheDocument();
    });

    it('should show Current Quest header', () => {
        const quest: Quest = {
            id: 'q1',
            title: 'Test Quest',
            requirements: { item: 1 },
            progress: { item: 0 },
            completed: false,
        };
        
        render(<QuestDisplay quest={quest} questMessage={null} />);
        
        expect(screen.getByText('Current Quest')).toBeInTheDocument();
    });
});
