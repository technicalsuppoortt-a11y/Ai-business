const fs = require('fs');

const path = 'src/pages/Tools/components/ProductSource.jsx';
let code = fs.readFileSync(path, 'utf8');

// Patch handleGenerate -> formattedIdeas
code = code.replace(
  'setIdeas(formattedIdeas);',
  `setIdeas(formattedIdeas);
          saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating: false, ideas: formattedIdeas, selectedIdea, selectedToolingProduct, expandedToolIndex, aiTools, isLoadingAiTools, aiToolsError, myProducts, searchQuery });`
);

// Patch handleGenerate -> etsyTop10
code = code.replace(
  'setIdeas(etsyTop10);',
  `setIdeas(etsyTop10);
          saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating: false, ideas: etsyTop10, selectedIdea, selectedToolingProduct, expandedToolIndex, aiTools, isLoadingAiTools, aiToolsError, myProducts, searchQuery });`
);

// Patch handleGenerate -> fallback
code = code.replace(
  'setIdeas(fallback);',
  `setIdeas(fallback);
        saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating: false, ideas: fallback, selectedIdea, selectedToolingProduct, expandedToolIndex, aiTools, isLoadingAiTools, aiToolsError, myProducts, searchQuery });`
);

// Patch fetchDynamicAiToolsFromOpenAI -> parsed.tools
code = code.replace(
  'setAiTools(parsed.tools);',
  `setAiTools(parsed.tools);
          saveResult({ analysisMode, structure, selectedType, selectedNiche, selectedEffort, isGenerating, ideas, selectedIdea, selectedToolingProduct: product, expandedToolIndex: 0, aiTools: parsed.tools, isLoadingAiTools: false, aiToolsError: null, myProducts, searchQuery });`
);

fs.writeFileSync(path, code);
console.log('Successfully patched ProductSource.jsx for explicit persistence!');
