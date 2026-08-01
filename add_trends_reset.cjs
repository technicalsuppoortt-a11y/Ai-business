const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<button\s+type="button"\s+onClick=\{handleGenerateTrends\}\s+disabled=\{isGeneratingTrends\}\s+className="sm-dock-btn primary"\s*>\s*<RotateCcw[\s\S]*?<\/button>/;

const replace = `<div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setTrendingHashtags([
                            {
                              tag: "#ترند_توضيحي",
                              category: "hot",
                              label: "نار نار",
                              growth: "+340%",
                            },
                            {
                              tag: "#ترند_صاعد",
                              category: "rising",
                              label: "صاعد بقوة",
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
                          saveResult(null);
                        }}
                        className="sm-dock-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          boxShadow: 'none'
                        }}
                      >
                        <RotateCcw size={15} />
                        <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                      </button>
                      $$&
                    </div>`;

if (regex.test(content)) {
  content = content.replace(regex, (match) => {
    return replace.replace('$$&', match);
  });
  fs.writeFileSync(path, content);
  console.log("Replaced Trends button successfully");
} else {
  console.log("Failed to match Trends button");
}
