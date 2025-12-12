import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../utils/firebase';

interface UseFirebaseAuthResult {
    user: User | null;
    userId: string | null;
    isLoading: boolean;
    error: Error | null;
}

export const useFirebaseAuth = (): UseFirebaseAuthResult => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is signed in
                setUser(currentUser);
                setIsLoading(false);
            } else {
                // No user, sign in anonymously
                try {
                    await signInAnonymously(auth);
                    // onAuthStateChanged will fire again with the new user
                } catch (err) {
                    console.error('Anonymous auth failed:', err);
                    setError(err as Error);
                    setIsLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return {
        user,
        userId: user?.uid || null,
        isLoading,
        error
    };
};
