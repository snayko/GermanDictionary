import { useState, useEffect, useCallback } from 'react';
import { apiService, localWordToApiSync, apiWordToLocal } from '../services/api';
import { db } from '../db';

// ----------------------------------------------------------------------

const SYNC_INTERVAL = 30000; // 30 seconds
const LAST_SYNC_KEY = 'germandict_last_sync';
const SYNC_ENABLED = import.meta.env.VITE_ENABLE_SYNC === 'true';

// ----------------------------------------------------------------------

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    localStorage.getItem(LAST_SYNC_KEY)
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email?: string; displayName?: string } | null>(null);

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

  // Check if API is available and get user info
  const checkApiHealth = useCallback(async () => {
    if (!isOnline || !SYNC_ENABLED) {
      setIsApiAvailable(false);
      return false;
    }

    try {
      // First check if user is authenticated via SWA
      const swaAuth = await apiService.getSwaAuth();
      if (!swaAuth) {
        console.log('[Sync] Not authenticated via SWA, skipping API check');
        setIsApiAvailable(false);
        setCurrentUser(null);
        return false;
      }

      const health = await apiService.healthCheck();
      const available = health.status === 'healthy';
      setIsApiAvailable(available);

      // If API is available, get user info
      if (available) {
        try {
          const user = await apiService.getMe();
          setCurrentUser({ email: user.email, displayName: user.displayName });
        } catch {
          // User might not be authenticated yet
          setCurrentUser(null);
        }
      }

      return available;
    } catch {
      setIsApiAvailable(false);
      return false;
    }
  }, [isOnline]);

  // Sync local words with server
  const syncWithServer = useCallback(async (): Promise<boolean> => {
    console.log('[Sync] syncWithServer called', { isOnline, SYNC_ENABLED });
    
    if (!isOnline || !SYNC_ENABLED) {
      console.log('[Sync] Skipping: offline or disabled');
      setSyncError('Sync is disabled or you are offline');
      return false;
    }

    // Check auth directly instead of relying on React state (avoids timing issues)
    const swaAuth = await apiService.getSwaAuth();
    if (!swaAuth) {
      console.log('[Sync] Skipping: no SWA auth');
      setSyncError('Please sign in to sync');
      return false;
    }
    console.log('[Sync] Authenticated as:', swaAuth.userDetails);

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Get all local words that have been modified since last sync
      const localWords = await db.words.toArray();
      console.log('[Sync] Local words to sync:', localWords.length);
      
      // Convert to API format
      const changes = localWords.map(word => localWordToApiSync(word));
      console.log('[Sync] Sending changes:', changes.length);

      // Send to server for sync
      const response = await apiService.syncWords({
        lastSyncAt: lastSyncedAt || undefined,
        changes,
      });
      console.log('[Sync] Server response:', response);

      // Update local database with server changes
      for (const serverWord of response.serverChanges) {
        const localWord = apiWordToLocal(serverWord);
        await db.words.put(localWord);
      }

      // Remove deleted words from local DB
      for (const deletedId of response.deletedIds) {
        await db.words.delete(deletedId);
        await db.reviews.delete(deletedId);
      }

      // Update last synced timestamp
      const syncTime = response.syncedAt;
      localStorage.setItem(LAST_SYNC_KEY, syncTime);
      setLastSyncedAt(syncTime);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setSyncError(message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, lastSyncedAt]);

  // Fetch all words from server (initial load or full refresh)
  const fetchFromServer = useCallback(async (): Promise<boolean> => {
    console.log('[Sync] fetchFromServer called', { isOnline, SYNC_ENABLED });
    
    if (!isOnline || !SYNC_ENABLED) {
      return false;
    }

    // Check auth directly
    const swaAuth = await apiService.getSwaAuth();
    if (!swaAuth) {
      console.log('[Sync] fetchFromServer: no SWA auth');
      return false;
    }
    console.log('[Sync] fetchFromServer: authenticated as', swaAuth.userDetails);

    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await apiService.getWords({ limit: 1000 });
      console.log('[Sync] fetchFromServer: got', response.words.length, 'words from server');
      
      // Clear local DB and replace with server data
      await db.words.clear();
      
      for (const apiWord of response.words) {
        const localWord = apiWordToLocal(apiWord);
        await db.words.put(localWord);
      }

      // Update last synced timestamp
      const syncTime = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, syncTime);
      setLastSyncedAt(syncTime);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch from server';
      console.log('[Sync] fetchFromServer error:', message);
      setSyncError(message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  // Auto-sync on interval when online and authenticated
  useEffect(() => {
    if (!isOnline || !isApiAvailable || !SYNC_ENABLED || !currentUser) return;

    const interval = setInterval(() => {
      syncWithServer();
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline, isApiAvailable, currentUser, syncWithServer]);

  // Initial health check
  useEffect(() => {
    checkApiHealth();
  }, [checkApiHealth]);

  // Initial sync when API becomes available and user is authenticated
  useEffect(() => {
    if (isApiAvailable && SYNC_ENABLED && currentUser && !lastSyncedAt) {
      // First time - fetch all from server
      fetchFromServer();
    } else if (isApiAvailable && SYNC_ENABLED && currentUser) {
      // Subsequent - sync changes
      syncWithServer();
    }
  }, [isApiAvailable]);

  return {
    isOnline,
    isApiAvailable,
    isSyncing,
    lastSyncedAt,
    syncError,
    syncEnabled: SYNC_ENABLED,
    currentUser,
    isAuthenticated: !!currentUser,
    syncWithServer,
    fetchFromServer,
    checkApiHealth,
  };
}
