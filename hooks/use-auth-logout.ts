import { useEffect, useState } from 'react';

/**
 * Hook to listen for logout events and clear authentication-related state
 * Components can use this to reset their state when a user logs out
 */
export function useAuthLogout(onLogout?: () => void) {
  useEffect(() => {
    const handleLogout = (event: CustomEvent) => {
      console.log('[USE_AUTH_LOGOUT] Logout event received:', event.detail);
      
      // Call the custom logout handler if provided
      if (onLogout) {
        onLogout();
      }
    };

    // Listen for the custom logout event
    window.addEventListener('auth:logout', handleLogout as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('auth:logout', handleLogout as EventListener);
    };
  }, [onLogout]);
}

/**
 * Hook to clear authentication-related state when logout occurs
 * This is a convenience hook for common state clearing patterns
 */
export function useAuthStateClear<T>(
  initialState: T,
  authStateKeys: (keyof T)[] = []
) {
  const [state, setState] = useState<T>(initialState);

  useAuthLogout(() => {
    // Reset to initial state
    setState(initialState);
    console.log('[USE_AUTH_STATE_CLEAR] Reset state to initial values');
  });

  return [state, setState] as const;
}
