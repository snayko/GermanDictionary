import { useCallback } from 'react';
import { useWords } from './useWords';
import { useSyncStatus } from './useSync';

// ----------------------------------------------------------------------

/**
 * Hook that combines useWords with automatic server sync.
 * Use this instead of useWords when you want changes to sync to the server.
 */
export function useSyncedWords() {
  const { syncWord, isAuthenticated, syncEnabled } = useSyncStatus();
  
  // Create the sync callback - only sync if authenticated and enabled
  const onWordChanged = useCallback(async (wordId: string) => {
    if (isAuthenticated && syncEnabled) {
      await syncWord(wordId);
    }
  }, [syncWord, isAuthenticated, syncEnabled]);

  // Use the words hook with the sync callback
  const wordsHook = useWords({ onWordChanged });

  return wordsHook;
}
