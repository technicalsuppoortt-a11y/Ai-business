const fs = require('fs');

const path = 'src/pages/Tools/components/ProfitCalculator.jsx';
let code = fs.readFileSync(path, 'utf8').replace(/\r/g, '');

// 1. Add useToolCache import
if (!code.includes('import useToolCache')) {
  code = code.replace(
    'import { useAuth } from \'../../../context/AuthContext\';',
    'import { useAuth } from \'../../../context/AuthContext\';\nimport useToolCache from "../../../hooks/useToolCache";'
  );
}

// 2. Add isNewlyGenerated state and useToolCache hooks
let searchState = `  // -- Accordion State --
  const [openAccordions, setOpenAccordions] = useState({ 0: true, 1: false });

  const toggleAccordion = (idx) => {
    setOpenAccordions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };`;

let replaceState = `  // -- Accordion State --
  const [openAccordions, setOpenAccordions] = useState({ 0: true, 1: false });
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);

  // --- STATE PERSISTENCE & HYDRATION ---
  const { cached, isLoadedFromCloud, saveResult } = useToolCache('profit-calculator');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.activeMode) setActiveMode(cached.activeMode);
        if (cached.analysisMode) setAnalysisMode(cached.analysisMode);
        if (cached.salePrice !== undefined) setSalePrice(cached.salePrice);
        if (cached.productCost !== undefined) setProductCost(cached.productCost);
        if (cached.dailyBudget !== undefined) setDailyBudget(cached.dailyBudget);
        if (cached.cpc !== undefined) setCpc(cached.cpc);
        if (cached.cvr !== undefined) setCvr(cached.cvr);
        if (cached.aiInsights) setAiInsights(cached.aiInsights);
        if (cached.aiInsightsMode) setAiInsightsMode(cached.aiInsightsMode);
        if (cached.monthlyBudget !== undefined) setMonthlyBudget(cached.monthlyBudget);
        if (cached.targetMonthlyProfit !== undefined) setTargetMonthlyProfit(cached.targetMonthlyProfit);
        if (cached.customNotes) setCustomNotes(cached.customNotes);
        if (cached.monthlyPlanResult) setMonthlyPlanResult(cached.monthlyPlanResult);
        if (cached.openAccordions) setOpenAccordions(cached.openAccordions);
        setIsNewlyGenerated(false);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights, aiInsightsMode, monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult, openAccordions });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights, aiInsightsMode, monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult, openAccordions]);

  const toggleAccordion = (idx) => {
    setOpenAccordions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };`;

code = code.replace(searchState, replaceState);

fs.writeFileSync(path, code);
console.log('Patch V6 applied!');
