const fs = require('fs');

const path = 'src/pages/Tools/components/AnalysisIdentity.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Replace handleResetSession
const resetStart = code.indexOf('const handleResetSession = () => {');
const resetEndString = '  const activeNicheTitle =';
const resetEnd = code.indexOf(resetEndString);

if (resetStart !== -1 && resetEnd !== -1) {
  const newResetLogic = `const handleResetSession = () => {
    if (activeTab === "niche") {
      setSelectedNiche(null);
      setSelectedMicroNiche(null);
      dispatch({ type: 'SET_FIELD', field: 'niche', value: '' });
      dispatch({ type: 'SET_FIELD', field: 'subNiche', value: '' });
      setCustomNicheInput("");
      setNicheAnalysis(null);
      setAiData({
        benchmark: null,
        microNiches: [],
        marketOpportunities: null,
        topLeaders: [],
        loading: {
          benchmark: false,
          microNiches: false,
          opportunities: false,
          leaders: false
        },
        error: null
      });
      setLiveAiMicroIdeas([]);
      saveResult({ ...cached, selectedNiche: null, selectedMicroNiche: null, customNicheInput: "", aiData: null, nicheAnalysis: null, liveAiMicroIdeas: [] });
    } else if (activeTab === "name") {
      setGeneratedNames(null);
      setSelectedCatalogs([]);
      setCustomNameInput("");
      setPinnedNames([]);
      saveResult({ ...cached, generatedNames: null, selectedCatalogs: [], customNameInput: "", pinnedNames: [] });
    } else if (activeTab === "identity") {
      setColorAnalysis(null);
      setLogoPreview(null);
      saveResult({ ...cached, colorAnalysis: null, logoPreview: null });
    }
  };

`;
  code = code.substring(0, resetStart) + newResetLogic + code.substring(resetEnd);
}

// 2. Fix the styling of bn-catalog-btn
const btnStyleTarget = `                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}`;

const btnStyleReplacement = `                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          border: isChecked ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid rgba(255,255,255,0.05)",
                          backgroundColor: isChecked ? "rgba(99, 102, 241, 0.1)" : "rgba(30,41,59,0.5)",
                          color: isChecked ? "#818cf8" : "#94a3b8"
                        }}`;

code = code.replace(btnStyleTarget, btnStyleReplacement);

fs.writeFileSync(path, code);
console.log('Successfully patched AnalysisIdentity logic and styles!');
