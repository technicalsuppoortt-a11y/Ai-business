import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * useToolCache — Reusable hook for tool result caching via Firestore subcollection
 * 
 * Reads and writes cached results directly to Firestore:
 * Path: users/{userId}/toolResults/{toolId}
 * 
 * @param {string} userId - The authenticated user's ID
 * @param {string} toolId - The unique tool identifier (e.g., 'ad-creative', 'marketing-plan')
 */
export function useToolCache(userId, toolId) {
  const [cachedData, setCachedData] = useState(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  // Load from Firestore
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCache(true); // Always start loading when dependencies change

    const loadCache = async () => {
      // If no userId yet (e.g. auth is still initializing), stay in loading state.
      // Do NOT set isLoadingCache(false) because it will unblock the skeleton loader
      // and cause premature hydration/overwrites.
      if (!userId || !toolId) {
        return;
      }

      try {
        const docRef = doc(db, 'users', userId, 'toolResults', toolId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && isMounted) {
          setCachedData(docSnap.data());
        } else if (isMounted) {
          // Explicitly set an empty object if missing, so consumers know it loaded but is empty
          setCachedData({});
        }
      } catch (err) {
        console.error(`Error loading cache for ${toolId}:`, err);
      } finally {
        if (isMounted) setIsLoadingCache(false);
      }
    };

    loadCache();

    return () => {
      isMounted = false;
    };
  }, [userId, toolId]);

  // Save to Firestore
  const saveResult = useCallback(async (data) => {
    if (!userId || !toolId) return;

    // Optimistic UI update
    setCachedData(prev => ({ ...prev, ...data, isCached: true }));

    try {
      const docRef = doc(db, 'users', userId, 'toolResults', toolId);
      await setDoc(docRef, { 
        ...data, 
        isCached: true, 
        updatedAt: serverTimestamp() 
      }, { merge: true });
    } catch (err) {
      console.error(`Error saving cache for ${toolId}:`, err);
    }
  }, [userId, toolId]);

  return {
    cachedData,
    cachedResult: cachedData?.result,
    cachedMode: cachedData?.mode || 'fast',
    isCached: !!cachedData?.result || !!cachedData?.isCached,
    isLoadingCache,
    saveResult,
  };
}

export default useToolCache;
