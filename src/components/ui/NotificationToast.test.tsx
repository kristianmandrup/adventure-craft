import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { NotificationToast } from './NotificationToast';

describe('NotificationToast', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render nothing when message is null', () => {
        const { container } = render(
            <NotificationToast message={null} onClose={mockOnClose} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should display message when provided', () => {
        render(
            <NotificationToast message="Test Message" onClose={mockOnClose} />
        );
        
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('should display sub message when provided', () => {
        render(
            <NotificationToast 
                message="Main Message" 
                subMessage="Sub message here"
                onClose={mockOnClose} 
            />
        );
        
        expect(screen.getByText('Main Message')).toBeInTheDocument();
        expect(screen.getByText('Sub message here')).toBeInTheDocument();
    });

    it('should show skull icon for BOSS type', () => {
        render(
            <NotificationToast message="Boss Appeared!" type="BOSS" onClose={mockOnClose} />
        );
        
        expect(screen.getByText('☠️')).toBeInTheDocument();
    });

    it('should show money icon for MERCHANT type', () => {
        render(
            <NotificationToast message="Merchant Found" type="MERCHANT" onClose={mockOnClose} />
        );
        
        expect(screen.getByText('💰')).toBeInTheDocument();
    });

    it('should show sword icon for COMBAT_HIT type', () => {
        render(
            <NotificationToast message="Hit!" type="COMBAT_HIT" onClose={mockOnClose} />
        );
        
        expect(screen.getByText('⚔️')).toBeInTheDocument();
    });

    it('should show shield icon for COMBAT_BLOCK type', () => {
        render(
            <NotificationToast message="Blocked!" type="COMBAT_BLOCK" onClose={mockOnClose} />
        );
        
        expect(screen.getByText('🛡️')).toBeInTheDocument();
    });

    it('should show warning icon for WARNING type', () => {
        render(
            <NotificationToast message="Warning!" type="WARNING" onClose={mockOnClose} />
        );
        
        expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should use custom icon when provided', () => {
        render(
            <NotificationToast message="Custom" icon="🎮" onClose={mockOnClose} />
        );
        
        expect(screen.getByText('🎮')).toBeInTheDocument();
    });

    it('should infer icon from message content for INFO type', () => {
        render(
            <NotificationToast message="You got gold!" type="INFO" onClose={mockOnClose} />
        );
        
        expect(screen.getByText('💰')).toBeInTheDocument();
    });
});
