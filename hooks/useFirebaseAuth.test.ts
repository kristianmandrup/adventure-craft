import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    signInAnonymously: vi.fn(),
    onAuthStateChanged: vi.fn(),
}));

vi.mock('../utils/firebase', () => ({
    auth: {},
}));

describe('useFirebaseAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should start with loading state', () => {
        vi.mocked(onAuthStateChanged).mockImplementation(() => () => {});
        
        const { result } = renderHook(() => useFirebaseAuth());
        
        expect(result.current.isLoading).toBe(true);
        expect(result.current.user).toBe(null);
        expect(result.current.userId).toBe(null);
    });

    it('should set user when already signed in', async () => {
        const mockUser = { uid: 'test-user-123' } as User;
        
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback: any) => {
            // Immediately call with user
            callback(mockUser);
            return () => {};
        });
        
        const { result } = renderHook(() => useFirebaseAuth());
        
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.userId).toBe('test-user-123');
    });

    it('should sign in anonymously when no user', async () => {
        vi.mocked(signInAnonymously).mockResolvedValue({} as any);
        
        let authCallback: any;
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback: any) => {
            authCallback = callback;
            // First call with null (no user)
            callback(null);
            return () => {};
        });
        
        renderHook(() => useFirebaseAuth());
        
        await waitFor(() => {
            expect(signInAnonymously).toHaveBeenCalled();
        });
    });

    it('should handle auth error', async () => {
        const testError = new Error('Auth failed');
        vi.mocked(signInAnonymously).mockRejectedValue(testError);
        
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback: any) => {
            callback(null);
            return () => {};
        });
        
        const { result } = renderHook(() => useFirebaseAuth());
        
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        
        expect(result.current.error).toEqual(testError);
    });

    it('should cleanup listener on unmount', () => {
        const unsubscribeMock = vi.fn();
        vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribeMock);
        
        const { unmount } = renderHook(() => useFirebaseAuth());
        
        unmount();
        
        expect(unsubscribeMock).toHaveBeenCalled();
    });
});
