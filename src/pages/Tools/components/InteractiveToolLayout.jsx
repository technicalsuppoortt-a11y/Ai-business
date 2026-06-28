import React from 'react';
import { useApp } from '../../../context/AppContext';
import './InteractiveTools.css';

/**
 * Premium Split-View Layout for Interactive Tools
 * 
 * @param {string} id - The tool ID for tracking completion
 * @param {string} title - The main tool title
 * @param {string} subtitle - The tool description
 * @param {string} icon - Emoji icon
 * @param {number} stepNumber - The step number in the journey
 * @param {React.ReactNode} leftContent - The inputs/controls on the right (RTL layout)
 * @param {React.ReactNode} rightContent - The preview/output on the left (RTL layout)
 * @param {boolean} isGenerating - Loading state for the AI/generator
 * @param {Function} onComplete - Optional custom completion handler
 */
export default function InteractiveToolLayout({ 
  id, 
  title, 
  subtitle, 
  icon, 
  stepNumber, 
  leftContent, // In RTL, this is the Input side (Right visually)
  rightContent, // In RTL, this is the Output side (Left visually)
  isGenerating = false,
  onComplete
}) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const isCompleted = state.completedSteps?.includes(id);

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      dispatch({ type: 'COMPLETE_STEP', payload: id });
    }
  };

  return (
    <div className="it-container it-animate-fade-up relative mb-16 group">
      {/* Journey Step Circle */}
      {stepNumber && (
        <>
          <div className="it-step-circle">
            <span>{stepNumber}</span>
          </div>
          <div className="it-step-connector"></div>
        </>
      )}

      {/* Main Card Layout */}
      <div className="it-main-card">
        
        {/* Input/Control Side (Right in RTL) */}
        <div className="it-col-input p-6 md:p-8 lg:p-12 border-b xl:border-b-0 xl:border-l border-white/5 relative z-10 flex flex-col">
          <div className="mb-10">
            <h2 className="it-title flex items-center gap-4 mb-4">
              <span className="text-3xl md:text-4xl drop-shadow-lg">{icon}</span> {title}
            </h2>
            <p className="it-subtitle">
              {subtitle}
            </p>
          </div>

          <div className="flex-grow w-full">
            {leftContent}
          </div>

          {/* Completion Status */}
          <div className="mt-12 pt-6 border-t border-white/10">
            <button 
              onClick={handleComplete}
              className={`it-btn ${isCompleted ? 'it-btn-secondary' : 'it-btn-primary'}`}
              style={isCompleted ? { borderColor: 'var(--it-primary)', color: 'var(--it-primary)', background: 'var(--it-primary-glow)' } : {}}
            >
              {isCompleted ? (
                <span className="relative z-10 flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✓</span> 
                  {lang === 'en' ? 'Tool completed & documented' : 'أداة مكتملة وموثقة'}
                </span>
              ) : (
                <span className="relative z-10">○ {lang === 'en' ? 'Mark as completed' : 'تحديد كخطوة مكتملة'}</span>
              )}
            </button>
          </div>
        </div>

        {/* Preview/Output Side (Left in RTL) */}
        <div className="it-col-output bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-950/90 relative flex flex-col min-h-[500px] xl:min-h-full overflow-hidden">
          
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

          <div className="relative h-full p-6 md:p-8 lg:p-12 flex flex-col w-full overflow-hidden">
            
            {/* Header of Output Side */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 shrink-0">
              <h3 className="text-slate-300 font-black text-xs md:text-sm tracking-widest uppercase flex items-center gap-3 drop-shadow-md">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                </span>
                {lang === 'en' ? 'Output Screen' : 'شاشة المخرجات (Output)'}
              </h3>
              {isGenerating && (
                 <span className="it-badge it-badge-emerald animate-pulse">
                   <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                   {lang === 'en' ? 'Processing data...' : 'جاري معالجة البيانات...'}
                 </span>
              )}
            </div>

            {/* The Actual Output Content */}
            <div className="flex-grow w-full h-full overflow-y-auto it-scrollbar pr-2 pb-4">
               {rightContent}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
