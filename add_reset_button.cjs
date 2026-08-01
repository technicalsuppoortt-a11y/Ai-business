const fs = require('fs');

const path = 'src/pages/Tools/components/ProductSource.jsx';
let code = fs.readFileSync(path, 'utf8');

const functionToInject = `  const handleResetSession = () => {
    setAnalysisMode('fast');
    setStructure(null);
    setSelectedType('');
    setSelectedNiche('');
    setSelectedEffort('');
    setIsGenerating(false);
    setIdeas(null);
    setSelectedIdea(null);
    setSelectedToolingProduct(null);
    setExpandedToolIndex(0);
    setAiTools([]);
    setIsLoadingAiTools(false);
    setAiToolsError(null);
    setSearchQuery('');
    saveResult(null);
    toast(lang === 'en' ? 'Session reset successfully!' : 'تم إعادة ضبط الجلسة بنجاح!', 'info');
  };

  const handleGenerate = async () => {`;

code = code.replace('  const handleGenerate = async () => {', functionToInject);

const buttonToInject = `<div className="ps-search-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="ps-pink-glow-btn"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: 'none'
                  }}
                  title={lang === 'en' ? 'Reset Session' : 'إعادة ضبط'}
                >
                  <RotateCcw size={16} />
                  <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                </button>

                <div style={{ position: 'relative', width: '220px' }}>`;

code = code.replace(`<div className="ps-search-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '220px' }}>`, buttonToInject);

fs.writeFileSync(path, code);
console.log('Successfully injected Reset button safely!');
