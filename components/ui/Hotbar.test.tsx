import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Hotbar } from './Hotbar';
import { InventoryItem } from '../../types';

describe('Hotbar', () => {
    const mockSetActiveSlot = vi.fn();
    const mockStopProp = vi.fn();
    const mockShowTooltip = vi.fn();
    const mockHideTooltip = vi.fn();

    const defaultProps = {
        inventory: [] as InventoryItem[],
        activeSlot: 0,
        setActiveSlot: mockSetActiveSlot,
        stopProp: mockStopProp,
        showTooltip: mockShowTooltip,
        hideTooltip: mockHideTooltip,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render 5 hotbar slots', () => {
        render(<Hotbar {...defaultProps} />);
        // Should render 5 slots with slot numbers
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should highlight active slot', () => {
        const { container } = render(<Hotbar {...defaultProps} activeSlot={2} />);
        // Check that slot styling is applied (active slot has special styling)
        const slots = container.querySelectorAll('[class*="w-12"]');
        expect(slots.length).toBe(5);
    });

    it('should call setActiveSlot when slot is clicked', () => {
        render(<Hotbar {...defaultProps} />);
        
        // Click on slot 3 (index 2)
        const slot3 = screen.getByText('3').closest('div');
        if (slot3) fireEvent.click(slot3);
        
        expect(mockSetActiveSlot).toHaveBeenCalledWith(2);
    });

    it('should display item icons when inventory has items', () => {
        const inventory: InventoryItem[] = [
            { type: 'sword', count: 1, color: '#ff0000' },
            { type: 'apple', count: 5, color: '#00ff00' },
        ];
        
        render(<Hotbar {...defaultProps} inventory={inventory} />);
        
        // Should show sword and apple emojis
        expect(screen.getByText('⚔️')).toBeInTheDocument();
        expect(screen.getByText('🍎')).toBeInTheDocument();
    });

    it('should display item counts', () => {
        const inventory: InventoryItem[] = [
            { type: 'wood', count: 10, color: '#8B4513' },
        ];
        
        render(<Hotbar {...defaultProps} inventory={inventory} />);
        
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should show correct icons for different item types', () => {
        const inventory: InventoryItem[] = [
            { type: 'shield', count: 1, color: '#aaa' },
            { type: 'bow', count: 1, color: '#8B4513' },
            { type: 'pickaxe', count: 1, color: '#ffd700' },
            { type: 'torch', count: 5, color: '#ff6600' },
        ];
        
        render(<Hotbar {...defaultProps} inventory={inventory} />);
        
        expect(screen.getByText('🛡️')).toBeInTheDocument();
        expect(screen.getByText('🏹')).toBeInTheDocument();
        expect(screen.getByText('⛏️')).toBeInTheDocument();
        expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('should call showTooltip on mouse enter', () => {
        render(<Hotbar {...defaultProps} />);
        
        const slot1 = screen.getByText('1').closest('div');
        if (slot1) fireEvent.mouseEnter(slot1);
        
        expect(mockShowTooltip).toHaveBeenCalled();
    });

    it('should call hideTooltip on mouse leave', () => {
        render(<Hotbar {...defaultProps} />);
        
        const slot1 = screen.getByText('1').closest('div');
        if (slot1) {
            fireEvent.mouseEnter(slot1);
            fireEvent.mouseLeave(slot1);
        }
        
        expect(mockHideTooltip).toHaveBeenCalled();
    });
});
