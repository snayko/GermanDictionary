import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, localWordToApiSync, apiWordToLocal } from '../services/api';
import { db } from '../db';

// ----------------------------------------------------------------------

const LAST_SYNC_KEY = 'germandict_last_sync';
const SYNC_ENABLED = import.meta.env.VITE_ENABLE_SYNC === 'true';

// ----------------------------------------------------------------------

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    localStorage.getItem(LAST_SYNC_KEY)
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email?: string; displayName?: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Prevent multiple simultaneous syncs
  const isSyncInProgress = useRef(false);
  const hasInitialized = useRef(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check auth and load initial data - ONCE on mount
  useEffect(() => {
    if (hasInitialized.current || !SYNC_ENABLED) return;
    hasInitialized.current = true;

    const initialize = async () => {
      // Check if user is authenticated via SWA
      const swaAuth = await apiService.getSwaAuth();
      if (!swaAuth) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }

      setIsAuthenticated(true);
      setCurrentUser({ 
        email: swaAuth.userDetails, 
        displayName: swaAuth.userDetails 
      });

      // Load words from server if local DB is empty
      const localWords = await db.words.toArray();
      if (localWords.length === 0) {
        setIsSyncing(true);
        try {
          const response = await apiService.getWords({ limit: 1000 });
          for (const apiWord of response.words) {
            await db.words.put(apiWordToLocal(apiWord));
          }
          const syncTime = new Date().toISOString();
          localStorage.setItem(LAST_SYNC_KEY, syncTime);
          setLastSyncedAt(syncTime);
        } catch (err) {
          console.error('[Sync] Failed to fetch initial words:', err);
          setSyncError('Failed to load words from server');
        } finally {
          setIsSyncing(false);
        }
      }
    };

    initialize();
  }, []);

  // Sync a single word to server (call this when user adds/edits/deletes)
  const syncWord = useCallback(async (wordId: string): Promise<boolean> => {
    if (!isOnline || !SYNC_ENABLED || !isAuthenticated) {
      return false;
    }

    if (isSyncInProgress.current) {
      return false;
    }

    isSyncInProgress.current = true;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const word = await db.words.get(wordId);
      if (!word) {
        // Word was deleted - sync deletion
        const response = await apiService.syncWords({
          lastSyncAt: lastSyncedAt || undefined,
          changes: [{
            id: wordId,
            german: '',
            wordType: '',
            translations: {},
            clientUpdatedAt: new Date().toISOString(),
            isDeleted: true,
          }],
        });
        const syncTime = response.syncedAt;
        localStorage.setItem(LAST_SYNC_KEY, syncTime);
        setLastSyncedAt(syncTime);
      } else {
        // Sync the word
        const response = await apiService.syncWords({
          lastSyncAt: lastSyncedAt || undefined,
          changes: [localWordToApiSync(word)],
        });
        const syncTime = response.syncedAt;
        localStorage.setItem(LAST_SYNC_KEY, syncTime);
        setLastSyncedAt(syncTime);
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      console.error('[Sync] Error:', message);
      setSyncError(message);
      return false;
    } finally {
      isSyncInProgress.current = false;
      setIsSyncing(false);
    }
  }, [isOnline, isAuthenticated, lastSyncedAt]);

  // Full sync - sync all local words to server
  const syncAllWords = useCallback(async (): Promise<boolean> => {
    if (!isOnline || !SYNC_ENABLED || !isAuthenticated) {
      setSyncError('Cannot sync: offline or not authenticated');
      return false;
    }

    if (isSyncInProgress.current) {
      return false;
    }

    isSyncInProgress.current = true;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const localWords = await db.words.toArray();
      if (localWords.length === 0) {
        return true; // Nothing to sync
      }

      const changes = localWords.map(word => localWordToApiSync(word));
      const response = await apiService.syncWords({
        lastSyncAt: lastSyncedAt || undefined,
        changes,
      });

      // Update local DB with any server changes
      for (const serverWord of response.serverChanges) {
        await db.words.put(apiWordToLocal(serverWord));
      }

      // Remove deleted words
      for (const deletedId of response.deletedIds) {
        await db.words.delete(deletedId);
        await db.reviews.delete(deletedId);
      }

      const syncTime = response.syncedAt;
      localStorage.setItem(LAST_SYNC_KEY, syncTime);
      setLastSyncedAt(syncTime);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      console.error('[Sync] Error:', message);
      setSyncError(message);
      return false;
    } finally {
      isSyncInProgress.current = false;
      setIsSyncing(false);
    }
  }, [isOnline, isAuthenticated, lastSyncedAt]);

  // Fetch all words from server (full refresh)
  const fetchFromServer = useCallback(async (): Promise<boolean> => {
    if (!isOnline || !SYNC_ENABLED || !isAuthenticated) {
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await apiService.getWords({ limit: 1000 });
      
      // Clear local DB and replace with server data
      await db.words.clear();
      
      for (const apiWord of response.words) {
        await db.words.put(apiWordToLocal(apiWord));
      }

      const syncTime = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, syncTime);
      setLastSyncedAt(syncTime);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch from server';
      console.error('[Sync] Error:', message);
      setSyncError(message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isAuthenticated]);

  return {
    isOnline,
    isSyncing,
    lastSyncedAt,
    syncError,
    syncEnabled: SYNC_ENABLED,
    currentUser,
    isAuthenticated,
    syncWord,        // Sync single word (call after add/edit/delete)
    syncAllWords,    // Sync all words (manual full sync)
    fetchFromServer, // Fetch all from server (refresh)
  };
}
