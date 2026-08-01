const fs = require('fs');
const path = 'src/pages/Tools/components/SmartAIAssistant.jsx';
let code = fs.readFileSync(path, 'utf8').replace(/\r/g, '');

// 1. Ensure useToolCache is imported correctly (it is already imported on line 2, but just to be sure)
if (!code.includes('import useToolCache')) {
  code = code.replace(
    'import { useApp }',
    'import useToolCache from "../../../hooks/useToolCache";\nimport { useApp }'
  );
}

// 2. Add hydration and save logic
let searchState = `  // Stage mode: 'input' (Stage 1), 'loading' (Stage 2), 'output' (Stage 3)
  const [activeStage, setActiveStage] = useState('input');

  useEffect(() => {
    if (state.apiKey) {
      setTempApiKey(state.apiKey);
    }
  }, [state.apiKey]);`;

let replaceState = `  // Stage mode: 'input' (Stage 1), 'loading' (Stage 2), 'output' (Stage 3)
  const [activeStage, setActiveStage] = useState('input');

  // --- STATE PERSISTENCE & HYDRATION ---
  const { cached, isLoadedFromCloud, saveResult } = useToolCache('smart-ai-assistant');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.analysisMode) setAnalysisMode(cached.analysisMode);
        if (cached.selectedGoal) setSelectedGoal(cached.selectedGoal);
        if (cached.selectedChannel) setSelectedChannel(cached.selectedChannel);
        if (cached.selectedClient) setSelectedClient(cached.selectedClient);
        if (cached.selectedPricing) setSelectedPricing(cached.selectedPricing);
        if (cached.activeStage) setActiveStage(cached.activeStage);
        if (cached.result) setResult(cached.result);
      }
    }
  }, [isLoadedFromCloud, cached]);

  // Synchronize state changes to Firebase
  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({
        analysisMode,
        selectedGoal,
        selectedChannel,
        selectedClient,
        selectedPricing,
        activeStage,
        result
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, analysisMode, selectedGoal, selectedChannel, selectedClient, selectedPricing, activeStage, result]);

  useEffect(() => {
    if (state.apiKey) {
      setTempApiKey(state.apiKey);
    }
  }, [state.apiKey]);`;

code = code.replace(searchState, replaceState);

// 3. Immediately trigger saveResult in handleGenerate
let searchHandleGenSuccessLive = `        setResult(formattedResult);
        setActiveStage('output');
        dispatch({`;
let replaceHandleGenSuccessLive = `        setResult(formattedResult);
        setActiveStage('output');
        saveResult({
          analysisMode,
          selectedGoal,
          selectedChannel,
          selectedClient,
          selectedPricing,
          activeStage: 'output',
          result: formattedResult
        });
        dispatch({`;
code = code.replace(searchHandleGenSuccessLive, replaceHandleGenSuccessLive);

let searchHandleGenSuccessFast = `      setResult(formattedResult);
      setActiveStage('output');
      dispatch({`;
let replaceHandleGenSuccessFast = `      setResult(formattedResult);
      setActiveStage('output');
      saveResult({
        analysisMode,
        selectedGoal,
        selectedChannel,
        selectedClient,
        selectedPricing,
        activeStage: 'output',
        result: formattedResult
      });
      dispatch({`;
code = code.replace(searchHandleGenSuccessFast, replaceHandleGenSuccessFast);

fs.writeFileSync(path, code);
console.log('Smart AI Assistant patch applied!');
