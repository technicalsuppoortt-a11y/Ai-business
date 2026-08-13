import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

/* =============================================
   INITIAL STATE
   ============================================= */
const initialState = {
  user: {
    name: '',
    email: '',
    country: 'EG',
    level: 'beginner',
    avatar: '',
    interests: [],
    loggedIn: false,
  },
  niche: '',
  subNiche: '',
  exactTitle: '',
  brandName: '',
  brandCategory: '',
  brandStyle: '',
  brandCatalogs: [],
  market: 'global',
  currency: 'USD',
  skills: [],
  apiKey: '',
  tone: 'expert',
  proposalLang: 'ar',
  projects: [],
  completedSteps: [],
  currentView: 'onboarding',
  language: 'ar',
  isLoadedFromCloud: false,
  toolResults: {},
  credits: 20,
  pwaPrompt: null,
  pwaModalOpen: false,
};

/* =============================================
   REDUCER
   ============================================= */
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'LOGIN':
      return { ...state, user: { ...state.user, ...action.payload, loggedIn: true } };
    case 'LOGOUT':
      ['app_user', 'app_steps', 'app_projects', 'app_tool_results', 'app_api_key'].forEach(k => localStorage.removeItem(k));
      return { ...initialState, isLoadedFromCloud: true };
    case 'COMPLETE_STEP': {
      const stepId = action.step || action.payload;
      const steps = state.completedSteps.includes(stepId)
        ? state.completedSteps.filter(s => s !== stepId)
        : [...state.completedSteps, stepId];
      return { ...state, completedSteps: steps };
    }
    case 'ADD_SKILL': {
      if (state.skills.some(s => s.id === action.skill.id)) return state;
      return { ...state, skills: [...state.skills, action.skill] };
    }
    case 'REMOVE_SKILL':
      return { ...state, skills: state.skills.filter(s => s.id !== action.id) };
    case 'ADD_PROJECT':
      return { ...state, projects: [action.project, ...state.projects] };
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter((_, i) => i !== action.index) };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SAVE_TOOL_RESULT':
      return { ...state, toolResults: { ...state.toolResults, [action.toolId]: action.data } };
    case 'LOAD_SAVED':
      return { ...state, ...action.payload, isLoadedFromCloud: true };
    case 'SET_CREDITS':
      return { ...state, credits: action.payload };
    case 'DEDUCT_CREDIT':
      return { ...state, credits: Math.max(0, state.credits - 1) };
    case 'SET_PWA_PROMPT':
      return { ...state, pwaPrompt: action.payload };
    case 'SET_PWA_MODAL':
      return { ...state, pwaModalOpen: action.payload };
    default:
      return state;
  }
}

/* =============================================
   PROVIDER
   ============================================= */
export function AppProvider({ children }) {
  const { userData, loadingUser } = useAuth();

  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    // Initial load from localStorage (fallback)
    try {
      const savedUser = JSON.parse(localStorage.getItem('app_user') || '{}');
      const savedSteps = JSON.parse(localStorage.getItem('app_steps') || '[]');
      const savedProjects = JSON.parse(localStorage.getItem('app_projects') || '[]');
      const savedToolResults = JSON.parse(localStorage.getItem('app_tool_results') || '{}');
      const savedApiKey = localStorage.getItem('app_api_key') || '';
      const savedLanguage = localStorage.getItem('app_language') || 'ar';
      return {
        ...init,
        user: { ...init.user, ...savedUser },
        completedSteps: savedSteps,
        projects: savedProjects,
        toolResults: savedToolResults,
        apiKey: savedApiKey,
        language: savedLanguage,
      };
    } catch {
      return init;
    }
  });

  // ═══════════════ FIREBASE SYNC ═══════════════

  // Load from Firestore when user logs in
  useEffect(() => {
    // Wait for auth to fully initialize before deciding to LOGOUT.
    // If loadingUser is still true, userData is null only because Firebase
    // hasn't resolved the session yet — NOT because the user is logged out.
    if (loadingUser) return;

    if (!userData?.uid) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    const loadFromFirestore = async () => {
      try {
        const docRef = doc(db, 'users', userData.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.appState) {
            dispatch({ type: 'LOAD_SAVED', payload: cloudData.appState });
          } else {
            // Document exists but no state yet (first login)
            dispatch({ type: 'SET_FIELD', field: 'isLoadedFromCloud', value: true });
          }

          // Load Basic Information back into state
          if (cloudData.name || cloudData.country || cloudData.level) {
            dispatch({
              type: 'SET_USER',
              payload: {
                name: cloudData.name || '',
                country: cloudData.country || 'EG',
                level: cloudData.level || 'beginner'
              }
            });
          }
        } else {
          // New user, no document yet
          dispatch({ type: 'SET_FIELD', field: 'isLoadedFromCloud', value: true });
        }
      } catch (err) {
        console.error("Error loading app state from Firestore:", err);
      }
    };

    loadFromFirestore();
  }, [userData?.uid, loadingUser]);

  // ═══════════════ GLOBAL SYSTEM LANGUAGE SYNC ═══════════════
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tenants', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.systemLanguage) {
          dispatch({ type: 'SET_LANGUAGE', payload: data.systemLanguage });
        }
      }
    });
    return () => unsub();
  }, []);

  // Save to Firestore on every state change
  useEffect(() => {
    if (!userData?.uid || !state.isLoadedFromCloud) return;

    const saveToFirestore = async () => {
      try {
        // We save the entire state (excluding the user object and meta flags)
        const { user, isLoadedFromCloud, ...stateToSave } = state;
        const docRef = doc(db, 'users', userData.uid);
        await setDoc(docRef, { 
          appState: stateToSave,
          name: user.name || '',
          country: user.country || 'EG',
          level: user.level || 'beginner'
        }, { merge: true });
      } catch (err) {
        console.error("Error saving app state to Firestore:", err);
      }
    };

    // Debounce saving slightly if needed, but for now simple useEffect
    const timer = setTimeout(saveToFirestore, 1000);
    return () => clearTimeout(timer);
  }, [state, userData?.uid]);

  // Persist state changes to localStorage (legacy fallback)
  useEffect(() => {
    localStorage.setItem('app_user', JSON.stringify(state.user));
    localStorage.setItem('app_steps', JSON.stringify(state.completedSteps));
    localStorage.setItem('app_projects', JSON.stringify(state.projects));
    localStorage.setItem('app_tool_results', JSON.stringify(state.toolResults));
    localStorage.setItem('app_api_key', state.apiKey);
    localStorage.setItem('app_language', state.language);
  }, [state]);

  useEffect(() => {
    localStorage.setItem('app_steps', JSON.stringify(state.completedSteps));
  }, [state.completedSteps]);

  useEffect(() => {
    localStorage.setItem('app_projects', JSON.stringify(state.projects));
  }, [state.projects]);

  useEffect(() => {
    if (state.apiKey) localStorage.setItem('app_api_key', state.apiKey);
  }, [state.apiKey]);

  useEffect(() => {
    localStorage.setItem('app_language', state.language);
  }, [state.language]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
