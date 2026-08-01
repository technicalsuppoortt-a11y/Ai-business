const fs = require('fs');
const path = require('path');

const cssPath = path.join('src', 'pages', 'Tools', 'components', 'AnalysisIdentity.css');
const cssContent = `

/* ==========================================================================
   UI POLISH 2.0 (Glassmorphism, Depth, Micro-animations)
   ========================================================================== */

/* Enhanced Main Panels */
.ai-panel {
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  border-radius: 24px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:root.light-mode .ai-panel, body.light-mode .ai-panel, .light-mode .ai-panel {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1) !important;
}

/* Enhanced Cards / Sub-panels */
.ns-panel-card, .ns-subcard {
  background: rgba(30, 41, 59, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
  border-radius: 16px !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease !important;
}

.ns-panel-card:hover, .ns-subcard:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.2) !important;
  box-shadow: 
    0 12px 24px -8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}

:root.light-mode .ns-panel-card, body.light-mode .ns-panel-card, .light-mode .ns-panel-card,
:root.light-mode .ns-subcard, body.light-mode .ns-subcard, .light-mode .ns-subcard {
  background: rgba(248, 250, 252, 0.7) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1) !important;
}

:root.light-mode .ns-panel-card:hover, body.light-mode .ns-panel-card:hover, .light-mode .ns-panel-card:hover,
:root.light-mode .ns-subcard:hover, body.light-mode .ns-subcard:hover, .light-mode .ns-subcard:hover {
  box-shadow: 
    0 12px 24px -8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 1) !important;
}

/* Enhanced Color Presets (Visual Identity Tab) */
.identity-preset-btn {
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.identity-preset-btn:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: rgba(99, 102, 241, 0.4) !important;
  box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.2) !important;
}
.identity-preset-btn.active {
  background: rgba(99, 102, 241, 0.1) !important;
  border-color: #6366f1 !important;
  box-shadow: 
    0 0 0 1px #6366f1,
    0 10px 30px -10px rgba(99, 102, 241, 0.4) !important;
}

/* Enhanced Color Display Cards (Primary, Secondary, Accent) */
.brand-color-card {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.4) !important;
  border-radius: 16px !important;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}
.brand-color-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.5) !important;
}

/* Typography Polish */
h2, h3, h4 {
  letter-spacing: -0.01em !important;
}

.ai-tab-btn {
  letter-spacing: 0.01em !important;
}
`;

fs.appendFileSync(cssPath, cssContent);
console.log('CSS appended successfully');
