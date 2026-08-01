const fs = require('fs');

const path = 'src/pages/Tools/components/LegalPages.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add useToolCache import
if (!code.includes('useToolCache')) {
  code = code.replace(
    "import { useApp } from '../../../context/AppContext';",
    "import { useApp } from '../../../context/AppContext';\nimport useToolCache from '../../../hooks/useToolCache';"
  );
}

// 2. Add RefreshCw to lucide-react imports
if (!code.includes('RefreshCw,')) {
  code = code.replace(
    "RotateCcw,",
    "RotateCcw,\n  RefreshCw,"
  );
}

// 3. Inject useToolCache hook and effects
const initTarget = `  const [activeTab, setActiveTab] = useState('privacy'); // privacy | terms | refund | cookie`;
const initReplacement = `  const [activeTab, setActiveTab] = useState('privacy'); // privacy | terms | refund | cookie

  const { cached, isLoadedFromCloud, saveResult } = useToolCache('legal-pages');
  const hydratedRef = useRef(false);

  // Hydrate from Cache
  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.brandName !== undefined) setBrandName(cached.brandName);
        if (cached.contactEmail !== undefined) setContactEmail(cached.contactEmail);
        if (cached.websiteUrl !== undefined) setWebsiteUrl(cached.websiteUrl);
        if (cached.country !== undefined) setCountry(cached.country);
        if (cached.activeTab !== undefined) setActiveTab(cached.activeTab);
      }
    }
  }, [isLoadedFromCloud, cached]);

  // Auto-Save to Cache
  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ brandName, contactEmail, websiteUrl, country, activeTab });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [brandName, contactEmail, websiteUrl, country, activeTab, isLoadedFromCloud]);

  const handleResetSession = () => {
    setBrandName('');
    setContactEmail('');
    setWebsiteUrl('');
    setCountry(lang === 'en' ? 'USA' : 'مصر');
    setActiveTab('privacy');
    saveResult(null);
    toast(lang === 'en' ? 'Legal pages reset successfully!' : 'تم إعادة ضبط الوثائق القانونية!', 'info');
  };`;

code = code.replace(initTarget, initReplacement);

// 4. Inject Reset Button into header
const headerActionsTarget = `          {/* Right Side: Primary Actions & Inspector Trigger */}
          <div className="lp-header-actions">
            <button 
              onClick={() => setIsDrawerOpen(true)}`;
const headerActionsReplacement = `          {/* Right Side: Primary Actions & Inspector Trigger */}
          <div className="lp-header-actions">
            <button 
              onClick={handleResetSession}
              className="lp-btn-action-ghost"
              style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}
              title={lang === 'en' ? 'Reset / Start Over' : 'إعادة ضبط / بدء من جديد'}
            >
              <RefreshCw size={13} />
              <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
            </button>

            <button 
              onClick={() => setIsDrawerOpen(true)}`;

code = code.replace(headerActionsTarget, headerActionsReplacement);

fs.writeFileSync(path, code);
console.log('Successfully patched LegalPages.jsx to add persistence and reset functionality!');
