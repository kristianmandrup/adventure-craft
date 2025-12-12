import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StartTitlePanel } from './StartTitlePanel';

describe('StartTitlePanel', () => {
    const mockOnStart = vi.fn();
    const mockOnContinue = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render game title', () => {
        render(<StartTitlePanel onStart={mockOnStart} />);
        
        expect(screen.getByText('Adventure')).toBeInTheDocument();
        expect(screen.getByText('Craft')).toBeInTheDocument();
    });

    it('should render adventure mode button', () => {
        render(<StartTitlePanel onStart={mockOnStart} />);
        
        expect(screen.getByText('ADVENTURE')).toBeInTheDocument();
    });

    it('should render creative mode button', () => {
        render(<StartTitlePanel onStart={mockOnStart} />);
        
        expect(screen.getByText('CREATIVE')).toBeInTheDocument();
    });

    it('should call onStart with ADVENTURE when adventure button clicked', () => {
        render(<StartTitlePanel onStart={mockOnStart} />);
        
        fireEvent.click(screen.getByText('ADVENTURE'));
        
        expect(mockOnStart).toHaveBeenCalledWith('ADVENTURE', 'NORMAL');
    });

    it('should call onStart with CREATIVE when creative button clicked', () => {
        render(<StartTitlePanel onStart={mockOnStart} />);
        
        fireEvent.click(screen.getByText('CREATIVE'));
        
        expect(mockOnStart).toHaveBeenCalledWith('CREATIVE', 'NORMAL');
    });

    it('should show continue button when hasSave is true', () => {
        render(<StartTitlePanel onStart={mockOnStart} onContinue={mockOnContinue} hasSave={true} />);
        
        expect(screen.getByText('CONTINUE')).toBeInTheDocument();
    });

    it('should not show continue button when hasSave is false', () => {
        render(<StartTitlePanel onStart={mockOnStart} hasSave={false} />);
        
        expect(screen.queryByText('CONTINUE')).not.toBeInTheDocument();
    });

    it('should call onContinue when continue button clicked', () => {
        render(<StartTitlePanel onStart={mockOnStart} onContinue={mockOnContinue} hasSave={true} />);
        
        fireEvent.click(screen.getByText('CONTINUE'));
        
        expect(mockOnContinue).toHaveBeenCalled();
    });
});
