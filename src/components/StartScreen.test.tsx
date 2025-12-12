import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { StartScreen } from './StartScreen';

// Mock storage
vi.mock('../utils/storage', () => ({
    loadGame: vi.fn(() => null),
}));

// Mock cloudSaves
vi.mock('../utils/cloudSaves', () => ({
    getCloudSaveInfo: vi.fn(() => Promise.resolve({ exists: false })),
}));

// Mock child components since they have complex dependencies
vi.mock('./ui/start/StartTitlePanel', () => ({
    StartTitlePanel: ({ hasSave }: { hasSave: boolean }) => (
        <div data-testid="title-panel">{hasSave ? 'Has Save' : 'No Save'}</div>
    ),
}));

vi.mock('./ui/start/StartControlsPanel', () => ({
    StartControlsPanel: () => <div data-testid="controls-panel">Controls</div>,
}));

describe('StartScreen', () => {
    const mockOnStart = vi.fn();
    const mockOnContinue = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render without crashing', () => {
        render(
            <StartScreen 
                onStart={mockOnStart} 
                onContinue={mockOnContinue}
                userId={null}
                isAuthLoading={false}
                isLoadingContinue={false}
            />
        );
        
        expect(screen.getByTestId('title-panel')).toBeInTheDocument();
        expect(screen.getByTestId('controls-panel')).toBeInTheDocument();
    });

    it('should show offline mode when not authenticated', () => {
        render(
            <StartScreen 
                onStart={mockOnStart} 
                onContinue={mockOnContinue}
                userId={null}
                isAuthLoading={false}
                isLoadingContinue={false}
            />
        );
        
        expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
    });

    it('should show connecting when auth is loading', () => {
        render(
            <StartScreen 
                onStart={mockOnStart} 
                onContinue={mockOnContinue}
                userId={null}
                isAuthLoading={true}
                isLoadingContinue={false}
            />
        );
        
        expect(screen.getByText(/connecting to cloud/i)).toBeInTheDocument();
    });

    it('should show cloud connected when authenticated', async () => {
        render(
            <StartScreen 
                onStart={mockOnStart} 
                onContinue={mockOnContinue}
                userId="user-123"
                isAuthLoading={false}
                isLoadingContinue={false}
            />
        );
        
        await waitFor(() => {
            expect(screen.getByText(/cloud connected/i)).toBeInTheDocument();
        });
    });

    it('should show loading state when loading continue', () => {
        render(
            <StartScreen 
                onStart={mockOnStart} 
                onContinue={mockOnContinue}
                userId="user-123"
                isAuthLoading={false}
                isLoadingContinue={true}
            />
        );
        
        expect(screen.getByText(/loading save/i)).toBeInTheDocument();
    });
});
