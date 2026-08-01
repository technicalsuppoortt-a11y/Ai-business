import { useApp } from '../context/AppContext';

/**
 * useToolCache — Reusable hook for tool result caching
 * 
 * Reads cached results from AppContext (which syncs to Firestore automatically).
 * Provides a saveResult helper that tags data with isCached: true.
 * 
 * @param {string} toolId - The unique tool identifier (e.g., 'ad-creative', 'marketing-plan')
 */
export function useToolCache(toolId) {
  const { state, dispatch } = useApp();
  const cached = state.toolResults[toolId] || null;

  const saveResult = (data) => {
    dispatch({
      type: 'SAVE_TOOL_RESULT',
      toolId,
      data: { ...data, isCached: true },
    });
  };

  return {
    cached,                          // Full cached payload object (or null)
    cachedResult: cached?.result,    // The result data directly
    cachedMode: cached?.mode || 'fast', // The mode used when result was generated
    isCached: !!cached?.result,      // Whether valid cached result exists
    isLoadedFromCloud: state.isLoadedFromCloud, // Track if Firestore async load is complete
    saveResult,                      // Helper to save result with isCached flag
  };
}

export default useToolCache;
