const fs = require('fs');
const jsxPath = 'src/pages/Tools/components/SocialMedia.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

// --- 1. FULL PERSISTENCE HYDRATION FIX ---
// Let's add the 4 missing variables to both the hydration block and the saveResult array.

const hydrateSearch = `if (cached.energyScore !== undefined) setEnergyScore(cached.energyScore);
          if (cached.selectedMood !== undefined) setSelectedMood(cached.selectedMood);
          if (cached.weeklyPostsCount !== undefined) setWeeklyPostsCount(cached.weeklyPostsCount);`;

const hydrateReplace = `if (cached.energyScore !== undefined) setEnergyScore(cached.energyScore);
          if (cached.selectedMood !== undefined) setSelectedMood(cached.selectedMood);
          if (cached.weeklyPostsCount !== undefined) setWeeklyPostsCount(cached.weeklyPostsCount);
          if (cached.nicheField !== undefined) setNicheField(cached.nicheField);
          if (cached.ideasResult !== undefined) setIdeasResult(cached.ideasResult);
          if (cached.savedIdeas !== undefined) setSavedIdeas(cached.savedIdeas);
          if (cached.trendingHashtags !== undefined) setTrendingHashtags(cached.trendingHashtags);
          if (cached.trendingAudios !== undefined) setTrendingAudios(cached.trendingAudios);
          if (cached.selectedViralVideo !== undefined) setSelectedViralVideo(cached.selectedViralVideo);`;

if (jsx.includes(hydrateSearch) && !jsx.includes('setSavedIdeas(cached.savedIdeas)')) {
    jsx = jsx.replace(hydrateSearch, hydrateReplace);
}

const saveSearch = `ideasResult, viralAdaptation,
        energyScore, selectedMood, weeklyPostsCount
      });`;

const saveReplace = `nicheField, ideasResult, viralAdaptation,
        energyScore, selectedMood, weeklyPostsCount,
        savedIdeas, trendingHashtags, trendingAudios, selectedViralVideo
      });`;

if (jsx.includes(saveSearch) && !jsx.includes('savedIdeas, trendingHashtags')) {
    jsx = jsx.replace(saveSearch, saveReplace);
    // There are 2 instances of saveResult payload arrays (the useEffect and the dependency array)
    jsx = jsx.replace(`ideasResult, viralAdaptation,
      energyScore, selectedMood, weeklyPostsCount
    ]);`, `nicheField, ideasResult, viralAdaptation,
      energyScore, selectedMood, weeklyPostsCount,
      savedIdeas, trendingHashtags, trendingAudios, selectedViralVideo
    ]);`);
}


// --- 2. FORCING LOADING STATES TO FALSE IN HYDRATION ---
// Let's ensure ALL 8 tool loading states are false (including isGeneratingAdaptation which wasn't in the list).
const loadingSearch = `setIsGeneratingTrends(false);
          setIsGeneratingAdaptation(false);`;

const loadingReplace = `setIsGeneratingTrends(false);
          setIsGeneratingAdaptation(false);
          // Hard reset for any potential stragglers
          setIsGeneratingArchitect(false);
          setIsGeneratingModal(false);
          setIsGeneratingScript(false);
          setIsGeneratingCaption(false);
          setIsGeneratingRepurpose(false);
          setIsGeneratingQa(false);
          setIsGeneratingIdeas(false);
          setIsGeneratingTrends(false);
          setIsGeneratingAdaptation(false);
          setIsNewlyGenerated(false); // Force double check`;

if (jsx.includes(loadingSearch) && !jsx.includes('// Hard reset for any potential stragglers')) {
    jsx = jsx.replace(loadingSearch, loadingReplace);
}


// --- 3. WRAPPER CONTAINER FIXES FOR TOOLS 1-8 ---

// Add ai-output-scroll to the already patched showcase content (tools 1-4)
jsx = jsx.replace(/className="sm-showcase-content pcc-custom-scroll"/g, 'className="sm-showcase-content pcc-custom-scroll ai-output-scroll"');
jsx = jsx.replace(/className="sm-modal-output-scroll pcc-custom-scroll"/g, 'className="sm-modal-output-scroll pcc-custom-scroll ai-output-scroll"');

// Tool 5: Idea Lab Grid
jsx = jsx.replace(/className="sm-idea-cards-grid" style=\{\{ marginTop: "20px" \}\}/g, 'className="sm-idea-cards-grid pcc-custom-scroll ai-output-scroll" style={{ marginTop: "20px", maxHeight: "500px", overflowY: "auto" }}');

// Tool 6: Trends Wrapper
const trendsSearch = `                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginTop: "20px",
                    }}
                  >`;
const trendsReplace = `                  <div
                    className="pcc-custom-scroll ai-output-scroll"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginTop: "20px",
                      maxHeight: "500px",
                      overflowY: "auto",
                      paddingRight: "5px"
                    }}
                  >`;
if (jsx.includes(trendsSearch)) {
    jsx = jsx.replace(trendsSearch, trendsReplace);
}

// Tool 7: Viral Videos Execution Pane
jsx = jsx.replace(/className="sm-viral-pane execution-pane"/g, 'className="sm-viral-pane execution-pane pcc-custom-scroll ai-output-scroll" style={{ maxHeight: "500px", overflowY: "auto" }}');

// Tool 8: Burnout Guard Box
jsx = jsx.replace(/className="sm-energy-score-box"\s*style=\{\{\s*background: "rgba\(16,185,129,0.1\)",/g, 'className="sm-energy-score-box pcc-custom-scroll ai-output-scroll"\n                    style={{\n                      maxHeight: "500px", overflowY: "auto",\n                      background: "rgba(16,185,129,0.1)",');


fs.writeFileSync(jsxPath, jsx);
console.log("Complete fix applied to SocialMedia.jsx for all 8 Content Factory tools.");
