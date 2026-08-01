const fs = require('fs');
const jsxPath = 'src/pages/Tools/components/SocialMedia.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

const twSearch = `function TypewriterText({ text, speed = 12 }) {
  const [displayedText, setDisplayedText] = useState("");
  const hasStreamedRef = useRef(false);
  const previousTextRef = useRef("");

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      hasStreamedRef.current = false;
      previousTextRef.current = "";
      return;
    }

    if (previousTextRef.current !== text) {
      hasStreamedRef.current = false;
      previousTextRef.current = text;
    }

    if (hasStreamedRef.current) {
      setDisplayedText(text);
      return;
    }

    let currentIndex = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text.charAt(currentIndex));
        currentIndex++;
      } else {
        hasStreamedRef.current = true;
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);`;

const twReplace = `function TypewriterText({ text, speed = 12, bypass = false }) {
  const [displayedText, setDisplayedText] = useState("");
  const hasStreamedRef = useRef(false);
  const previousTextRef = useRef("");

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      hasStreamedRef.current = false;
      previousTextRef.current = "";
      return;
    }

    if (previousTextRef.current !== text) {
      hasStreamedRef.current = false;
      previousTextRef.current = text;
    }

    if (hasStreamedRef.current || bypass) {
      setDisplayedText(text);
      hasStreamedRef.current = true;
      return;
    }

    let currentIndex = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text.charAt(currentIndex));
        currentIndex++;
      } else {
        hasStreamedRef.current = true;
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, bypass]);`;

// Since line endings can be annoying (\r\n vs \n), we'll do smaller regex replacements
jsx = jsx.replace(/function TypewriterText\(\{ text, speed = 12 \}\) \{/g, 'function TypewriterText({ text, speed = 12, bypass = false }) {');
jsx = jsx.replace(/if \(hasStreamedRef\.current\) \{\s*setDisplayedText\(text\);\s*return;\s*\}/g, 'if (hasStreamedRef.current || bypass) {\n      setDisplayedText(text);\n      hasStreamedRef.current = true;\n      return;\n    }');
jsx = jsx.replace(/  \}, \[text, speed\]\);/g, '  }, [text, speed, bypass]);');

// 2. Add isNewlyGenerated state
const stateSearch = `const [goalArchitect, setGoalArchitect] = useState("awareness");`;
const stateReplace = `const [goalArchitect, setGoalArchitect] = useState("awareness");\n  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);`;
if (!jsx.includes('isNewlyGenerated')) {
    jsx = jsx.replace(stateSearch, stateReplace);
}

// 3. Inject setIsNewlyGenerated(true) into all handleGenerate* functions
jsx = jsx.replace(/setIsGenerating([a-zA-Z]+)\(true\);/g, 'setIsGenerating$1(true);\n    setIsNewlyGenerated(true);');

// 4. Update all TypewriterText instances
jsx = jsx.replace(/<TypewriterText text=\{([^}]+)\}\s*speed=\{10\}\s*\/>/g, '<TypewriterText text={$1} speed={10} bypass={!isNewlyGenerated} />');

// 5. Update hydration effect
const hydrationSearch = `  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {`;
const hydrationReplace = `  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        setIsNewlyGenerated(false);
        setIsGeneratingArchitect(false);
        setIsGeneratingModal(false);
        setIsGeneratingScript(false);
        setIsGeneratingCaption(false);
        setIsGeneratingRepurpose(false);
        setIsGeneratingQa(false);
        setIsGeneratingIdeas(false);
        setIsGeneratingTrends(false);
        setIsGeneratingAdaptation(false);`;
if (jsx.includes(hydrationSearch) && !jsx.includes('setIsNewlyGenerated(false);')) {
    jsx = jsx.replace(hydrationSearch, hydrationReplace);
}

// 6. Sanitize cache payload and remove debounce
const saveSearch = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ activeTab, analysisMode, activeAudioRecommendation, activeTrendingTopic, platformArchitect, goalArchitect, isGeneratingArchitect, resultArchitect, matrixData, nicheField, activeModal, challengeText, featureText, isGeneratingModal, modalAiResult, activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult, isGeneratingScript, captionTopic, captionTone, captionHook, captionResult, isGeneratingCaption, originalContent, repurposeFormat, repurposeResult, isGeneratingRepurpose, qaQuestion, qaTone, qaFormat, qaResult, isGeneratingQa, ideasResult, savedIdeas, isGeneratingIdeas, trendingHashtags, trendingAudios, isGeneratingTrends, selectedViralVideo, viralAdaptation, isGeneratingAdaptation, energyScore, selectedMood, weeklyPostsCount });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, activeTab, analysisMode, activeAudioRecommendation, activeTrendingTopic, platformArchitect, goalArchitect, isGeneratingArchitect, resultArchitect, matrixData, nicheField, activeModal, challengeText, featureText, isGeneratingModal, modalAiResult, activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult, isGeneratingScript, captionTopic, captionTone, captionHook, captionResult, isGeneratingCaption, originalContent, repurposeFormat, repurposeResult, isGeneratingRepurpose, qaQuestion, qaTone, qaFormat, qaResult, isGeneratingQa, ideasResult, savedIdeas, isGeneratingIdeas, trendingHashtags, trendingAudios, isGeneratingTrends, selectedViralVideo, viralAdaptation, isGeneratingAdaptation, energyScore, selectedMood, weeklyPostsCount]);`;

const saveReplace = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    saveResult({ activeTab, analysisMode, activeAudioRecommendation, activeTrendingTopic, platformArchitect, goalArchitect, resultArchitect, matrixData, nicheField, activeModal, challengeText, featureText, modalAiResult, activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult, captionTopic, captionTone, captionHook, captionResult, originalContent, repurposeFormat, repurposeResult, qaQuestion, qaTone, qaFormat, qaResult, ideasResult, savedIdeas, trendingHashtags, trendingAudios, selectedViralVideo, viralAdaptation, energyScore, selectedMood, weeklyPostsCount });
  }, [isLoadedFromCloud, activeTab, analysisMode, activeAudioRecommendation, activeTrendingTopic, platformArchitect, goalArchitect, resultArchitect, matrixData, nicheField, activeModal, challengeText, featureText, modalAiResult, activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult, captionTopic, captionTone, captionHook, captionResult, originalContent, repurposeFormat, repurposeResult, qaQuestion, qaTone, qaFormat, qaResult, ideasResult, savedIdeas, trendingHashtags, trendingAudios, selectedViralVideo, viralAdaptation, energyScore, selectedMood, weeklyPostsCount]);`;

if (jsx.includes(saveSearch)) {
    jsx = jsx.replace(saveSearch, saveReplace);
}

fs.writeFileSync(jsxPath, jsx);
console.log("Patched successfully!");
