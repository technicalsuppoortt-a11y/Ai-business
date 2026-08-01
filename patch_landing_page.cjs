const fs = require('fs');

const path = 'src/pages/Tools/components/LandingPageContent.jsx';
let code = fs.readFileSync(path, 'utf8');

// Patch 1: Live mode success
const liveSuccessTarget = `          if (typeof liveResult === "object" && liveResult !== null) {
            setGeneratedContent({
              hero: ensureArray(liveResult.hero),
              problem: ensureArray(liveResult.problem),
              offer: ensureArray(liveResult.offer),
              proof: ensureArray(liveResult.proof),
              cta: ensureArray(liveResult.cta),
            });
          } else {`;
const liveSuccessReplacement = `          if (typeof liveResult === "object" && liveResult !== null) {
            const liveContent = {
              hero: ensureArray(liveResult.hero),
              problem: ensureArray(liveResult.problem),
              offer: ensureArray(liveResult.offer),
              proof: ensureArray(liveResult.proof),
              cta: ensureArray(liveResult.cta),
            };
            setGeneratedContent(liveContent);
            saveResult({ analysisMode, activeSectionIndex, isConsoleCollapsed, isInputDrawerOpen, scanningStep: 0, productName, audience, validationError, objective, awareness, pricePoint, emotion, isGenerating: false, generatedContent: liveContent, activeIdeaIndex });
          } else {`;

// Patch 2: Live mode fallback
const liveFallbackTarget = `          } else {
            setGeneratedContent({
              hero: [String(liveResult)],
              problem: [],
              offer: [],
              proof: [],
              cta: [],
            });
          }`;
const liveFallbackReplacement = `          } else {
            const fallbackContent = {
              hero: [String(liveResult)],
              problem: [],
              offer: [],
              proof: [],
              cta: [],
            };
            setGeneratedContent(fallbackContent);
            saveResult({ analysisMode, activeSectionIndex, isConsoleCollapsed, isInputDrawerOpen, scanningStep: 0, productName, audience, validationError, objective, awareness, pricePoint, emotion, isGenerating: false, generatedContent: fallbackContent, activeIdeaIndex });
          }`;

// Patch 3: Fast mode
const fastModeTarget = `        setGeneratedContent(content);
        dispatch({`;
const fastModeReplacement = `        setGeneratedContent(content);
        saveResult({ analysisMode, activeSectionIndex, isConsoleCollapsed, isInputDrawerOpen, scanningStep: 0, productName, audience, validationError, objective, awareness, pricePoint, emotion, isGenerating: false, generatedContent: content, activeIdeaIndex });
        dispatch({`;

code = code.replace(liveSuccessTarget, liveSuccessReplacement);
code = code.replace(liveFallbackTarget, liveFallbackReplacement);
code = code.replace(fastModeTarget, fastModeReplacement);

fs.writeFileSync(path, code);
console.log('Successfully patched LandingPageContent.jsx with immediate saveResult calls');
