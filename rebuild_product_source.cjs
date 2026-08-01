const fs = require('fs');

const path = 'src/pages/Tools/components/ProductSource.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!code.includes('import useToolCache')) {
  code = code.replace(
    "import React, { useState, useEffect, useMemo, useRef } from 'react';",
    "import React, { useState, useEffect, useMemo, useRef } from 'react';\nimport useToolCache from '../../../hooks/useToolCache';"
  );
}

// 2. Add hook and effects
const hookTarget = `const [searchQuery, setSearchQuery] = useState('');`;
const hookReplacement = `const [searchQuery, setSearchQuery] = useState('');

  // --- STATE PERSISTENCE & HYDRATION ---
  const { cached, isLoadedFromCloud, saveResult } = useToolCache('product-source');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.analysisMode !== undefined) setAnalysisMode(cached.analysisMode);
        if (cached.structure !== undefined) setStructure(cached.structure);
        if (cached.selectedType !== undefined) setSelectedType(cached.selectedType);
        if (cached.selectedNiche !== undefined) setSelectedNiche(cached.selectedNiche);
        if (cached.selectedEffort !== undefined) setSelectedEffort(cached.selectedEffort);
        if (cached.isGenerating !== undefined) setIsGenerating(cached.isGenerating);
        if (cached.ideas !== undefined) setIdeas(cached.ideas);
        if (cached.selectedIdea !== undefined) setSelectedIdea(cached.selectedIdea);
        if (cached.selectedToolingProduct !== undefined) setSelectedToolingProduct(cached.selectedToolingProduct);
        if (cached.expandedToolIndex !== undefined) setExpandedToolIndex(cached.expandedToolIndex);
        if (cached.aiTools !== undefined) setAiTools(cached.aiTools);
        if (cached.isLoadingAiTools !== undefined) setIsLoadingAiTools(cached.isLoadingAiTools);
        if (cached.aiToolsError !== undefined) setAiToolsError(cached.aiToolsError);
        if (cached.myProducts !== undefined) setMyProducts(cached.myProducts);
        if (cached.searchQuery !== undefined) setSearchQuery(cached.searchQuery);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating, ideas, selectedIdea, selectedToolingProduct, expandedToolIndex, aiTools, isLoadingAiTools, aiToolsError, myProducts, searchQuery });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating, ideas, selectedIdea, selectedToolingProduct, expandedToolIndex, aiTools, isLoadingAiTools, aiToolsError, myProducts, searchQuery]);
`;
if (!code.includes('useToolCache(')) {
  code = code.replace(hookTarget, hookReplacement);
}

// 3. Update handleResetSession
const resetTarget = `setSearchQuery('');
  };`;
const resetReplacement = `setSearchQuery('');
    saveResult(null);
  };`;
if (code.includes(resetTarget)) {
  code = code.replace(resetTarget, resetReplacement);
}

// 4. Update AI Handlers (Explicit saveResult)
code = code.replace(
  'setIdeas(formattedIdeas);',
  `setIdeas(formattedIdeas);
          saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating: false, ideas: formattedIdeas, selectedIdea, selectedToolingProduct, expandedToolIndex, aiTools, isLoadingAiTools, aiToolsError, myProducts, searchQuery });`
);
code = code.replace(
  'setIdeas(etsyTop10);',
  `setIdeas(etsyTop10);
          saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating: false, ideas: etsyTop10, selectedIdea, selectedToolingProduct, expandedToolIndex, aiTools, isLoadingAiTools, aiToolsError, myProducts, searchQuery });`
);
code = code.replace(
  'setIdeas(fallback);',
  `setIdeas(fallback);
        saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating: false, ideas: fallback, selectedIdea, selectedToolingProduct, expandedToolIndex, aiTools, isLoadingAiTools, aiToolsError, myProducts, searchQuery });`
);
code = code.replace(
  'setAiTools(parsed.tools);',
  `setAiTools(parsed.tools);
          saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating, ideas, selectedIdea, selectedToolingProduct: product, expandedToolIndex: 0, aiTools: parsed.tools, isLoadingAiTools: false, aiToolsError: null, myProducts, searchQuery });`
);

// 5. Fix Default Override
const loadEffectRegex = /if\s*\(data\.productTypes\?\.length\)\s*setSelectedType\(data\.productTypes\[0\]\.id\);\s*if\s*\(data\.niches\?\.length\)\s*setSelectedNiche\(data\.niches\[0\]\.id\);\s*if\s*\(data\.effortLevels\?\.length\)\s*setSelectedEffort\(data\.effortLevels\[0\]\.id\);/g;

const loadEffectReplacement = `if (data.productTypes?.length) setSelectedType(prev => prev || data.productTypes[0].id);
        if (data.niches?.length) setSelectedNiche(prev => prev || data.niches[0].id);
        if (data.effortLevels?.length) setSelectedEffort(prev => prev || data.effortLevels[0].id);`;

code = code.replace(loadEffectRegex, loadEffectReplacement);

fs.writeFileSync(path, code);
console.log('Successfully rebuilt ProductSource.jsx persistence!');
