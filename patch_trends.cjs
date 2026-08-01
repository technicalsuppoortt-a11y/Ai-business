const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix saveResult block to include all fields in payload and dependency array!
const oldSaveResultBlock = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    saveResult({
      activeTab, analysisMode, platformArchitect, goalArchitect, resultArchitect,
      activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult,
      captionTopic, captionTone, captionHook, captionResult,
      originalContent, repurposeFormat, repurposeResult,
      qaQuestion, qaTone, qaFormat, qaResult,
      nicheField, ideasResult, viralAdaptation,
      energyScore, selectedMood, weeklyPostsCount,
      savedIdeas, trendingHashtags, trendingAudios, selectedViralVideo
    });
  }, [
    isLoadedFromCloud, activeTab, analysisMode, platformArchitect, goalArchitect, resultArchitect,
    activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult,
    captionTopic, captionTone, captionHook, captionResult,
    originalContent, repurposeFormat, repurposeResult,
    qaQuestion, qaTone, qaFormat, qaResult,
    nicheField, ideasResult, viralAdaptation,
    energyScore, selectedMood, weeklyPostsCount,
    savedIdeas, trendingHashtags, trendingAudios, selectedViralVideo
  ]);`;

const targetSaveSearch1 = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    saveResult({
      activeTab, analysisMode, platformArchitect, goalArchitect, resultArchitect,
      activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult,
      captionTopic, captionTone, captionHook, captionResult,
      originalContent, repurposeFormat, repurposeResult,
      qaQuestion, qaTone, qaFormat, qaResult,
      ideasResult, viralAdaptation,
      energyScore, selectedMood, weeklyPostsCount
    });
  }, [
    isLoadedFromCloud, activeTab, analysisMode, platformArchitect, goalArchitect, resultArchitect,
    activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult,
    captionTopic, captionTone, captionHook, captionResult,
    originalContent, repurposeFormat, repurposeResult,
    qaQuestion, qaTone, qaFormat, qaResult,
    ideasResult, viralAdaptation,
    energyScore, selectedMood, weeklyPostsCount
  ]);`;

const newSaveResultBlock = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    saveResult({
      activeTab, analysisMode, platformArchitect, goalArchitect, resultArchitect,
      activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult,
      captionTopic, captionTone, captionHook, captionResult,
      originalContent, repurposeFormat, repurposeResult,
      qaQuestion, qaTone, qaFormat, qaResult,
      nicheField, ideasResult, viralAdaptation,
      energyScore, selectedMood, weeklyPostsCount,
      savedIdeas, trendingHashtags, trendingAudios, selectedViralVideo
    });
  }, [
    isLoadedFromCloud, activeTab, analysisMode, platformArchitect, goalArchitect, resultArchitect,
    activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult,
    captionTopic, captionTone, captionHook, captionResult,
    originalContent, repurposeFormat, repurposeResult,
    qaQuestion, qaTone, qaFormat, qaResult,
    nicheField, ideasResult, viralAdaptation,
    energyScore, selectedMood, weeklyPostsCount,
    savedIdeas, trendingHashtags, trendingAudios, selectedViralVideo
  ]);`;

if (content.includes(oldSaveResultBlock)) {
    content = content.replace(oldSaveResultBlock, newSaveResultBlock);
} else if (content.includes(targetSaveSearch1)) {
    content = content.replace(targetSaveSearch1, newSaveResultBlock);
}

// 2. Fix handleResetSession to properly clear local Trends states
const oldResetBlock = `      setIsGeneratingRepurpose(false);
      setIsGeneratingQa(false);
      
      saveResult(null);
    };`;

const newResetBlock = `      setIsGeneratingRepurpose(false);
      setIsGeneratingQa(false);
      
      setTrendingHashtags([
        {
          tag: "#ترند_توضيحي",
          category: "hot",
          label: lang === "en" ? "Super Hot" : "نار نار",
          growth: "+340%",
        },
        {
          tag: "#ترند_صاعد",
          category: "rising",
          label: lang === "en" ? "Rising" : "صاعد بقوة",
          growth: "+180%",
        },
      ]);
      setTrendingAudios([
        {
          title: "Cyber Pulse Ambient Beat",
          creator: "Trend Beats",
          uses: "45.2K",
        },
      ]);
      
      saveResult(null); // This specifically wipes the Firestore cache key completely
    };`;

if (content.includes(oldResetBlock)) {
    content = content.replace(oldResetBlock, newResetBlock);
}

fs.writeFileSync(path, content);
console.log("Successfully patched Trends caching and reset logic.");
