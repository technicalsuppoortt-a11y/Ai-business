import React from "react";
import { Zap, Cpu, Sparkles, Key } from "lucide-react";
import { getCurrentUserEmail, getOpenAiApiKey } from "../../services/liveAiService";
import "./AnalysisModeSelector.css";

/**
 * Dual Analysis Mode Selector
 * Allows users to toggle between:
 * 1. Fast / Stored Mode (Firebase pre-computed fetch logic)
 * 2. Live AI Real-time Analysis (Live LLM API dispatch)
 */
export default function AnalysisModeSelector({
  mode = "fast",
  onChange,
  lang = "ar",
  accentColor = "#10B981",
  style = {},
}) {
  const isArabic = lang === "ar";
  const activeEmail = getCurrentUserEmail();
  const isAllowedUser = activeEmail.toLowerCase() === 'admin@brand.com';
  const hasKey = Boolean(getOpenAiApiKey());

  return (
    <div
      className="analysis-mode-selector-wrapper"
      dir={isArabic ? "rtl" : "ltr"}
      style={{ "--ams-accent": accentColor, ...style }}
    >
      <div className="ams-header flex items-center justify-between mb-2">
        <span className="ams-label-title text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles size={14} color={accentColor} />
          {isArabic ? "نمط المعالجة والتوليد" : "AI Processing Mode"}
        </span>
        <span className="ams-current-badge text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1">
          {mode === "fast" ? (
            <>
              <Zap size={11} color={accentColor} />
              <span>{isArabic ? "النمط السريع" : "Fast Mode"}</span>
            </>
          ) : (
            <>
              <Cpu size={11} color={accentColor} />
              <span>{isArabic ? "الذكاء الاصطناعي المباشر" : "Live AI Real-time"}</span>
            </>
          )}
        </span>
      </div>

      <div className="ams-tabs-container">
        {/* Option 1: Fast / Stored Mode */}
        <button
          type="button"
          className={`ams-tab-btn ${mode === "fast" ? "active" : ""}`}
          onClick={() => onChange && onChange("fast")}
        >
          <div className="ams-tab-icon">
            <Zap size={18} color={mode === "fast" ? accentColor : "#94A3B8"} />
          </div>
          <div className="ams-tab-text">
            <span className="ams-tab-main">
              {isArabic ? "النمط السريع" : "Fast Mode"}
            </span>
            <span className="ams-tab-sub">
              {isArabic
                ? "استجابة فورية ومحللة مسبقاً"
                : "Instant pre-computed response"}
            </span>
          </div>
        </button>

        {/* Option 2: Live AI Real-time Analysis */}
        <button
          type="button"
          className={`ams-tab-btn ${mode === "live" ? "active" : ""}`}
          onClick={() => onChange && onChange("live")}
        >
          <div className="ams-tab-icon">
            <Cpu size={18} color={mode === "live" ? accentColor : "#94A3B8"} />
          </div>
          <div className="ams-tab-text">
            <span className="ams-tab-main flex items-center gap-1.5">
              {isArabic
                ? "الذكاء الاصطناعي المباشر"
                : "Live AI Real-time"}
              {!isAllowedUser && !hasKey && (
                <span className="text-[10px] text-amber-400 font-normal flex items-center gap-0.5" title={isArabic ? "يتطلب إضافة مفتاحك الخاص في الإعدادات" : "Requires personal API key in Settings"}>
                  <Key size={10} />
                  ({isArabic ? "مفتاحك الإعدادات" : "Own Key"})
                </span>
              )}
            </span>
            <span className="ams-tab-sub">
              {isArabic
                ? "توليد كود واستراتيجية لحظياً"
                : "Real-time context-aware generation"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
