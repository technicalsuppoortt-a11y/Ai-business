const fs = require('fs');

const files = [
  'PlatformRadar.jsx',
  'FreelancePricing.jsx',
  'SkillsCrafter.jsx',
  'PortfolioBuilder.jsx',
  'ProposalSniper.jsx',
  'InterviewPrep.jsx',
  'SalesTemplates.jsx'
];

for (const filename of files) {
  const path = `src/pages/Tools/components/${filename}`;
  if (!fs.existsSync(path)) continue;

  let code = fs.readFileSync(path, 'utf8');
  
  if (code.includes('Reset / Start Fresh')) {
    console.log(`Skipping ${filename}, already has reset button.`);
    continue;
  }

  const buttonCode = `
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '10px' }}>
          <button
            onClick={handleResetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={12} />
            {(state?.language || 'ar') === 'en' ? 'Reset / Start Fresh' : 'إعادة ضبط / بدء من جديد'}
          </button>
        </div>`;

  // We want to insert the button inside the root div of leftContent.
  // We can look for "const leftContent =" and then the first "<div".
  // Let's use a regex that matches const leftContent = (\n  <div ...>
  
  const regex = /(const\s+leftContent\s*=\s*\([\s\S]*?<div[^>]*>)/;
  const match = regex.exec(code);
  
  if (match) {
    code = code.slice(0, match.index + match[0].length) + buttonCode + code.slice(match.index + match[0].length);
    fs.writeFileSync(path, code);
    console.log(`Successfully injected reset button into ${filename}`);
  } else {
    console.log(`Failed to find leftContent div in ${filename}`);
  }
}
