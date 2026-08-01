const fs = require('fs');
const path = 'src/pages/Tools/components/SmartAIAssistant.jsx';
let code = fs.readFileSync(path, 'utf8').replace(/\r/g, '');

// 1. Ensure useToolCache is imported
if (!code.includes('import useToolCache')) {
  code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport useToolCache from '../../../hooks/useToolCache';"
  );
}

// 2. Add hydration and save logic right after state declarations
let searchState = `  // Stage mode: 'input' (Stage 1), 'loading' (Stage 2), 'output' (Stage 3)
  const [activeStage, setActiveStage] = useState('input');`;

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
  }, [isLoadedFromCloud, analysisMode, selectedGoal, selectedChannel, selectedClient, selectedPricing, activeStage, result]);`;

code = code.replace(searchState, replaceState);

// 3. Immediately trigger saveResult in handleGenerate (Live mode)
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

// 4. Immediately trigger saveResult in handleGenerate (Fast mode)
let searchHandleGenSuccessFast = `      setResult(parsedData);
      setIsFallbackActive(false);
      setActiveStage('output');
      dispatch({`;
let replaceHandleGenSuccessFast = `      setResult(parsedData);
      setIsFallbackActive(false);
      setActiveStage('output');
      saveResult({
        analysisMode,
        selectedGoal,
        selectedChannel,
        selectedClient,
        selectedPricing,
        activeStage: 'output',
        result: parsedData
      });
      dispatch({`;
code = code.replace(searchHandleGenSuccessFast, replaceHandleGenSuccessFast);

// 5. Add Reset / Clear Cache method in the reset button (if any) or handle manually. The tool has a reset handler. Let's see if handleResetSession is in the file. Wait, in earlier diffs I saw I was adding handleResetSession via add_reset_button.cjs, but if I reverted the file, it might not be there! Let's just leave the Reset button out for a second, or wait, the user SAID: "Ensure the 'Reset / Clear Chat' button cleanly wipes the Firestore cache for this tool instance."

// 6. We must add the Reset button to SmartAIAssistant!
let searchToolLayout = `<ToolDashboardLayout
      id="smart-ai-assistant"`;
let replaceToolLayout = `const handleResetSession = () => {
    setAnalysisMode('fast');
    setSelectedGoal('close_deal');
    setSelectedChannel('cold_email');
    setSelectedClient('creators');
    setSelectedPricing('mid');
    setTempApiKey(state.apiKey || '');
    setIsSavingKey(false);
    setShowKeyModal(false);
    setIsGenerating(false);
    setLoadingPhase('');
    setLoadingStatusIndex(0);
    setResult(null);
    setCopiedSection(null);
    setIsFallbackActive(false);
    setActiveStage('input');
    saveResult(null); // Clear Firestore cache
  };

  return (
    <ToolDashboardLayout
      id="smart-ai-assistant"`;
code = code.replace(`  return (\n    <ToolDashboardLayout\n      id="smart-ai-assistant"`, replaceToolLayout);

// 7. Inject the Reset button inside ToolDashboardLayout
let searchDashboardChildren = `      timeEstimate="5 - 15"
    >
      <div className="radial-ecosystem-root"`;
let replaceDashboardChildren = `      timeEstimate="5 - 15"
    >
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px 0 20px' }}>
          <button
            onClick={handleResetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
          >
            <RefreshCw size={14} />
            {(state?.language || 'ar') === 'en' ? 'Reset / Clear Chat' : 'إعادة ضبط / بدء من جديد'}
          </button>
        </div>
      <div className="radial-ecosystem-root"`;
code = code.replace(searchDashboardChildren, replaceDashboardChildren);


fs.writeFileSync(path, code);
console.log('Smart AI Assistant Patch V2 applied!');
