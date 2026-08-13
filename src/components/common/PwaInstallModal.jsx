import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Smartphone, Download, Share, PlusSquare, X } from 'lucide-react';

export default function PwaInstallModal({ isOpen, onClose }) {
  const { state, dispatch } = useApp();
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Detect iOS devices (Safari) where automated PWA install via JS is restricted
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
  }, []);

  const handleInstall = async () => {
    // Retrieve the deferred prompt from state or window global failsafe
    const promptEvent = state.pwaPrompt || window.deferredPWAInstallPrompt;
    
    if (!promptEvent) {
      alert(state.language === "en" ? "Installation is not available or already installed." : "التثبيت غير متاح أو تم التثبيت بالفعل.");
      return;
    }
    
    setInstalling(true);
    
    // Safety timeout in case the native prompt hangs or is blocked silently
    const safetyTimeout = setTimeout(() => {
      setInstalling(false);
    }, 5000);
    
    try {
      // Must be synchronous relative to the user interaction
      promptEvent.prompt();
      
      const { outcome } = await promptEvent.userChoice;
      clearTimeout(safetyTimeout);
      
      if (outcome === 'accepted') {
        // Clear the saved prompt since it can't be used again
        window.deferredPWAInstallPrompt = null;
        dispatch({ type: 'SET_PWA_PROMPT', payload: null });
        onClose();
      } else {
        setInstalling(false);
      }
    } catch (error) {
      clearTimeout(safetyTimeout);
      console.error("PWA Install Error:", error);
      setInstalling(false);
    }
  };

  const isAr = state.language === "ar";
  const direction = isAr ? "rtl" : "ltr";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
            className="modal-content" 
            style={{ background: "var(--bg1, #080C14)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", width: "100%", maxWidth: "420px", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden", direction }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Background */}
            <div style={{ height: "120px", background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.1))", position: "relative" }}>
              <button 
                onClick={onClose} 
                style={{ position: "absolute", top: "16px", [isAr ? "left" : "right"]: "16px", background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", zIndex: 10 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* App Icon overlapping */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "-40px", position: "relative" }}>
              <div style={{ width: "80px", height: "80px", background: "var(--bg2, #0D1220)", borderRadius: "20px", padding: "12px", border: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(0,0,0,0.3)" }}>
                <img src="/favicon.svg" alt="App Logo" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "contain" }} />
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "24px", textAlign: "center" }}>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "var(--text1, #fff)", fontWeight: "700" }}>
                {isAr ? "قم بتثبيت التطبيق" : "Install App"}
              </h2>
              <p style={{ margin: "0 0 24px 0", fontSize: "15px", color: "var(--text2, #94A3B8)", lineHeight: "1.6" }}>
                {isAr 
                  ? "احصل على تجربة أسرع وأكثر سلاسة. قم بتثبيت التطبيق على جهازك للوصول المباشر بنقرة واحدة."
                  : "Get a faster, smoother experience. Install our app on your device for one-click access."}
              </p>

              {isIOS ? (
                /* iOS Specific Instructions */
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)", textAlign: isAr ? "right" : "left" }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", color: "var(--text1, #fff)", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", background: "var(--accent, #3B82F6)", borderRadius: "50%", color: "#fff", fontSize: "12px" }}>!</span>
                    {isAr ? "لأجهزة آيفون (iOS)" : "For iPhone (iOS)"}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Share size={20} color="var(--text3, #64748B)" />
                      <span style={{ fontSize: "14px", color: "var(--text2, #94A3B8)" }}>
                        {isAr ? "1. اضغط على زر المشاركة أسفل الشاشة" : "1. Tap the Share button at the bottom"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <PlusSquare size={20} color="var(--text3, #64748B)" />
                      <span style={{ fontSize: "14px", color: "var(--text2, #94A3B8)" }}>
                        {isAr ? "2. اختر (إضافة إلى الشاشة الرئيسية)" : "2. Select (Add to Home Screen)"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Android / Desktop Install Button */
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, var(--accent, #3B82F6), var(--accent-hover, #2563EB))",
                    color: "#fff",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: installing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    boxShadow: "0 8px 16px rgba(59,130,246,0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 20px rgba(59,130,246,0.4)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(59,130,246,0.3)"; }}
                >
                  <Download size={20} />
                  {isAr ? "تثبيت التطبيق الآن" : "Install App Now"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
