const fs = require('fs');

const path = 'src/pages/Tools/components/ProductSource.jsx';
let code = fs.readFileSync(path, 'utf8');

const target = `                  </div>
                ) : (
                  <div className="ps-ideas-spatial-grid">`;

const replacement = `                  </div>
                ) : isGenerating ? (
                  <div className="ps-ideas-spatial-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={\`skeleton-\${i}\`}
                        className="ps-saas-card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                          minHeight: '230px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          background: 'rgba(30, 41, 59, 0.4)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '60px', height: '22px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)' }} />
                            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: '70px', height: '22px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)' }} />
                          </div>
                          
                          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }} style={{ width: '85%', height: '18px', borderRadius: '4px', background: 'rgba(248, 250, 252, 0.1)', marginTop: '4px' }} />
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} style={{ width: '100%', height: '12px', borderRadius: '3px', background: 'rgba(248, 250, 252, 0.05)' }} />
                            <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: '90%', height: '12px', borderRadius: '3px', background: 'rgba(248, 250, 252, 0.05)' }} />
                            <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} style={{ width: '60%', height: '12px', borderRadius: '3px', background: 'rgba(248, 250, 252, 0.05)' }} />
                          </div>
                        </div>
                        
                        <div style={{ marginTop: '20px' }}>
                          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} style={{ width: '100%', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ps-ideas-spatial-grid">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(path, code);
  console.log('Successfully injected skeleton loader UI!');
} else {
  console.error('Target not found for skeleton injection.');
}
