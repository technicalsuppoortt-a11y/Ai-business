import React from 'react';
import { useApp } from '../../../context/AppContext';

export default function StandardTool({ id, title, subtitle, icon, steps = [], video, accentColor = 'emerald', stepNumber }) {
  const toast = useToast();
  const { state, dispatch } = useApp();

  const isCompleted = state.completedSteps.includes(id);

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: id });
  };

  return (
    <div className="relative mb-12 md:mb-16 group step-item">
      {stepNumber && (
        <>
          <div className="step-circle">
            <span>{stepNumber}</span>
          </div>
          <div className="step-connector"></div>
        </>
      )}

      <div className="card-gradient p-6 md:p-10 animate-slide-up">
        <div className="mb-8">
          <h2 className="tool-title flex items-center gap-3">
            <span className="text-3xl">{icon}</span> {title}
          </h2>
          <p className="tool-description">{subtitle}</p>
        </div>

        {video && (
          <div className="video-wrapper">
            <div className="video-container">
              <iframe src={video} frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-10">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest opacity-60">
            <span className="w-2 h-2 bg-primary rounded-full"></span> المهام المطلوبة
          </h3>
          {steps.map((step, i) => (
            <div key={i} className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-default">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-500 border border-white/10 group-hover:border-primary/50 group-hover:text-primary transition-all">
                {i + 1}
              </div>
              <span className="text-slate-300 font-bold text-sm">{step}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border border-primary/20">
          <div className="flex items-center gap-4">
            <input 
              type="checkbox" 
              checked={isCompleted}
              onChange={handleComplete}
              className="premium-checkbox" 
            />
            <span className="font-bold text-white text-sm">تم الإنجاز بنجاح ✅</span>
          </div>
          {isCompleted && (
            <span className="text-[10px] font-bold text-primary bg-primary/20 px-3 py-1 rounded-full uppercase animate-pulse">مكتمل</span>
          )}
        </div>
      </div>
    </div>
  );
}
