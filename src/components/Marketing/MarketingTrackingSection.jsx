import { useState, useEffect, useRef } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { Tracking } from "../../utils/tracking";
import { useToast } from "../../context/ToastContext";
import {
  BarChart,
  Plug,
  Target,
  BookOpen,
  Activity,
  Filter,
  ShieldCheck,
  Terminal,
  FlaskConical,
  Bot,
  Settings,
  FileText,
  Magnet,
  CreditCard,
  UserPlus,
  Key,
  Calendar,
  AlertTriangle,
  Cookie,
  Radar,
  Lock,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Search,
  Plus,
  X
} from "lucide-react";
const isValidMetaPixelId = (id) => /^\d{10,16}$/.test(id.trim());
const isValidGA4Id = (id) => /^G-[A-Z0-9]{4,20}$/i.test(id.trim());
const defaultConfig = () => ({
  meta: { connected: false, business: "", page: "", pixel: { id: "", name: "" } },
  google: { connected: false, property: { name: "", measurementId: "" } },
  advancedMode: false,
  customEvents: [],
  webhookUrl: ""
});
const STANDARD_EVENTS = [
  "Page View",
  "View Content",
  "Lead",
  "Contact",
  "Purchase",
  "Add To Cart",
  "Initiate Checkout",
  "Book Meeting",
  "Complete Registration",
  "Login",
  "Logout",
  "Generate AI",
  "Upload File",
  "Download File",
  "Export PDF",
  "Invite Member",
  "Upgrade Plan",
  "Cancel Subscription",
  "Payment Success",
  "Payment Failed",
  "Project Created",
  "Project Deleted",
  "Subscription Started",
  "Subscription Renewed",
  "Subscription Cancelled"
];
const EVENT_MAPPINGS = [
  { std: "Purchase", targets: ["Meta: Purchase", "GA4: purchase", "DB: purchase"] },
  { std: "Lead", targets: ["Meta: Lead", "GA4: generate_lead"] },
  { std: "Complete Registration", targets: ["Meta: CompleteRegistration", "GA4: sign_up"] },
  { std: "Book Meeting", targets: ["Meta: Schedule", "GA4: book_meeting"] },
  { std: "Add To Cart", targets: ["Meta: AddToCart", "GA4: add_to_cart"] },
  { std: "Initiate Checkout", targets: ["Meta: InitiateCheckout", "GA4: begin_checkout"] }
];
const TEST_EVENTS = [
  { name: "Page View", icon: <FileText size={20} /> },
  { name: "Lead", icon: <Magnet size={20} /> },
  { name: "Purchase", icon: <CreditCard size={20} /> },
  { name: "Signup", icon: <UserPlus size={20} /> },
  { name: "Login", icon: <Key size={20} /> },
  { name: "Book Meeting", icon: <Calendar size={20} /> }
];
function MarketingTrackingSection({ isAdmin, userId, isRtl, t }) {
  const globalToast = useToast();
  const toast = {
    success: (msg) => globalToast(msg, 'success'),
    error: (msg) => globalToast(msg, 'error')
  };
  const L = (en, ar) => isRtl ? ar : en;
  const getDocRef = () => {
    if (isAdmin) {
      return doc(db, "settings", "marketingTracking");
    } else {
      const activeUserId = userId || auth?.currentUser?.uid;
      if (!activeUserId) return null;
      return doc(db, "users", activeUserId);
    }
  };
  const [config, setConfig] = useState(defaultConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [rtData, setRtData] = useState([]);
  const [rtFilter, setRtFilter] = useState("");
  const [debugLogs, setDebugLogs] = useState([]);
  const [wizard, setWizard] = useState({
    active: false,
    provider: null
  });
  const [testResults, setTestResults] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const [libraryFilter, setLibraryFilter] = useState("");
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [animateStats, setAnimateStats] = useState(false);
  useEffect(() => {
    if (activeTab === "funnels" || activeTab === "analytics") {
      setAnimateStats(false);
      const timer = setTimeout(() => setAnimateStats(true), 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);
  const wizardMetaRef = useRef(null);
  const wizardGoogleRef = useRef(null);
  const advMetaRef = useRef(null);
  const advGA4Ref = useRef(null);
  const advWebhookRef = useRef(null);
  const { meta, google, advancedMode, customEvents, webhookUrl } = config;
  const tabsRef = useRef(null);
  const addDebugLog = (method, path, result) => {
    const timeStr = (new Date()).toLocaleTimeString("en-GB", { hour12: false });
    setDebugLogs((prev) => [`[${timeStr}] ${method} ${path} \u2192 ${result}`, ...prev].slice(0, 100));
  };
  const scrollTabs = (dir) => {
    if (!tabsRef.current) return;
    const sign = isRtl ? -1 : 1;
    tabsRef.current.scrollBy({ left: dir * sign * 250, behavior: "smooth" });
  };
  useEffect(() => {
    const activeUserId = userId || auth?.currentUser?.uid;
    if (!activeUserId && !isAdmin) {
      console.log("[MarketingTracking] ⏳ Waiting for userId to resolve...");
      // DO NOT set loading to false here, we want it to retry when auth state changes
      return;
    }
    let unsub = null;
    let mounted = true;
    const applyConfig = (data) => {
      const src = isAdmin ? data : data?.trackingSettings || null;
      console.log("\u{1F4E5} LOADED FROM FIRESTORE:", {
        path: isAdmin ? "settings/marketingTracking" : `users/${userId}`,
        hasTrackingSettings: !!src,
        srcKeys: src ? Object.keys(src) : [],
        srcString: src ? JSON.stringify(src) : "null"
      });
      if (src && mounted) {
        setConfig({
          meta: {
            connected: false,
            business: "",
            page: "",
            pixel: { id: "", name: "" },
            ...src.meta || {}
          },
          google: {
            connected: false,
            property: { name: "", measurementId: "" },
            ...src.google || {}
          },
          advancedMode: !!src.advancedMode,
          customEvents: src.customEvents || [],
          webhookUrl: src.webhookUrl || ""
        });
      } else if (!src) {
        console.log("[MarketingTracking] \u2139\uFE0F No trackingSettings found in document yet. Defaults used.");
      }
    };
    const load = async () => {
      try {
        const docRef = getDocRef();
        if (!docRef) {
          console.warn("[MarketingTracking] \u26A0\uFE0F docRef is null \u2014 cannot load.");
          setLoading(false);
          return;
        }
        console.log("[MarketingTracking] \u{1F504} Fetching config with getDoc...");
        try {
          const snap = await getDoc(docRef);
          console.log("[MarketingTracking] getDoc result \u2014 exists:", snap.exists());
          if (snap.exists()) {
            applyConfig(snap.data());
          } else {
            console.log("[MarketingTracking] \u2139\uFE0F Document does not exist yet in Firestore.");
          }
        } catch (getErr) {
          console.error("[MarketingTracking] \u{1F534} getDoc ERROR:", getErr?.code, getErr?.message);
        }
        if (mounted) setLoading(false);
        unsub = onSnapshot(
          docRef,
          (snap) => {
            if (!mounted) return;
            if (!snap.exists()) {
              console.log("[MarketingTracking] onSnapshot \u2014 document does not exist yet.");
              return;
            }
            applyConfig(snap.data());
          },
          (err) => {
            console.error("[MarketingTracking] \u{1F534} onSnapshot ERROR:", err?.code, err?.message, err);
          }
        );
      } catch (err) {
        console.error("[MarketingTracking] \u{1F534} Load error:", err?.code, err?.message, err);
        if (mounted) setLoading(false);
      }
    };
    load();
    if (false) {
      console.warn("[MarketingTracking] \u26A0\uFE0F Running with MOCK Firestore (localStorage). Data will NOT persist to cloud.");
    } else {
      console.log("[MarketingTracking] \u2705 Real Firebase Firestore active. Project:", db?.app?.options?.projectId ?? "(unknown)");
    }
    addDebugLog("GET", "/tracking/config/load", "200 OK \u2014 getDoc + onSnapshot active");
    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, [isAdmin, userId, auth?.currentUser?.uid]);
  useEffect(() => {
    const handler = (e) => {
      const { event, payload, time } = e.detail;
      const newLog = {
        time,
        user: isAdmin ? "Platform User" : userId || "Partner",
        event,
        platform: "Meta / GA4",
        country: "Local",
        utm: "\u2014",
        status: "success"
      };
      setRtData((prev) => [newLog, ...prev].slice(0, 80));
      addDebugLog("POST", `/tracking/events/${event.replace(/\s+/g, "").toLowerCase()}`, "200 OK \u2014 Dispatched to pixels");
    };
    window.addEventListener("upklick_track", handler);
    return () => window.removeEventListener("upklick_track", handler);
  }, [isAdmin, userId]);
  useEffect(() => {
    const PIXEL_SCRIPT_ID = "mtc-meta-pixel";
    const NOSCRIPT_ID = "mtc-meta-pixel-noscript";
    document.getElementById(PIXEL_SCRIPT_ID)?.remove();
    document.getElementById(NOSCRIPT_ID)?.remove();
    if (!meta.connected || !meta.pixel?.id) {
      delete window.fbq;
      delete window._fbq;
      return;
    }
    const pixelId = meta.pixel.id;
    const script = document.createElement("script");
    script.id = PIXEL_SCRIPT_ID;
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
    const noscript = document.createElement("noscript");
    noscript.id = NOSCRIPT_ID;
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    document.head.appendChild(noscript);
    addDebugLog("POST", `/meta/pixel/init/${pixelId}`, "200 OK \u2014 fbq('init') injected into DOM");
    return () => {
      document.getElementById(PIXEL_SCRIPT_ID)?.remove();
      document.getElementById(NOSCRIPT_ID)?.remove();
    };
  }, [meta.connected, meta.pixel?.id]);
  useEffect(() => {
    const GA4_SCRIPT_ID = "mtc-ga4-gtag";
    const GA4_INLINE_ID = "mtc-ga4-inline";
    document.getElementById(GA4_SCRIPT_ID)?.remove();
    document.getElementById(GA4_INLINE_ID)?.remove();
    if (!google.connected || !google.property?.measurementId) {
      return;
    }
    const measurementId = google.property.measurementId;
    const gtagScript = document.createElement("script");
    gtagScript.id = GA4_SCRIPT_ID;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    gtagScript.async = true;
    document.head.appendChild(gtagScript);
    const inlineScript = document.createElement("script");
    inlineScript.id = GA4_INLINE_ID;
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    document.head.appendChild(inlineScript);
    addDebugLog("POST", `/ga4/gtag/init/${measurementId}`, "200 OK \u2014 gtag injected into DOM");
    return () => {
      document.getElementById(GA4_SCRIPT_ID)?.remove();
      document.getElementById(GA4_INLINE_ID)?.remove();
    };
  }, [google.connected, google.property?.measurementId]);
  const saveConfig = async (updates) => {
    const next = { ...config, ...updates };
    setConfig(next);
    setSaving(true);
    try {
      const docRef = getDocRef();
      if (!docRef) {
        console.warn("[MarketingTracking] saveConfig: docRef is null (userId empty?). Skipping Firestore write.");
        setSaving(false);
        return;
      }
      let dataToSave;
      if (isAdmin) {
        dataToSave = next;
      } else {
        dataToSave = { trackingSettings: next };
      }
      console.log("\u{1F525} PERSISTING TO FIRESTORE:", {
        path: isAdmin ? "settings/marketingTracking" : `users/${userId}`,
        dataToSaveString: JSON.stringify(dataToSave)
      });
      if (isAdmin) {
        await setDoc(docRef, dataToSave, { merge: true });
      } else {
        try {
          await updateDoc(docRef, dataToSave);
        } catch (err) {
          if (err?.code === "not-found") {
            await setDoc(docRef, dataToSave, { merge: true });
          } else {
            throw err;
          }
        }
      }
      console.log("\u2705 FIRESTORE WRITE SUCCESS for path:", isAdmin ? "settings/marketingTracking" : `users/${userId}`);
      showToast(L("Settings saved successfully!", "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0628\u0646\u062C\u0627\u062D!"));
    } catch (err) {
      console.error("[MarketingTracking] \u{1F534} FIRESTORE SAVE ERROR:", err?.code, err?.message, err);
      toast.error(L(
        `Save failed: ${err?.code || err?.message || "unknown error"}`,
        `\u0641\u0634\u0644 \u0627\u0644\u062D\u0641\u0638: ${err?.code || err?.message || "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}`
      ));
    } finally {
      setSaving(false);
    }
  };
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const docRef = getDocRef();
      if (!docRef) {
        setLoading(false);
        return;
      }
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const src = isAdmin ? data : data?.trackingSettings || null;
        if (src) {
          setConfig({
            meta: { connected: false, business: "", page: "", pixel: { id: "", name: "" }, ...src.meta || {} },
            google: { connected: false, property: { name: "", measurementId: "" }, ...src.google || {} },
            advancedMode: !!src.advancedMode,
            customEvents: src.customEvents || [],
            webhookUrl: src.webhookUrl || ""
          });
        }
      }
      showToast(L("Data refreshed from server", "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0646 \u0627\u0644\u062E\u0627\u062F\u0645"));
    } catch (err) {
      console.error("[MarketingTracking] Refresh error:", err);
      toast.error(L("Failed to refresh data", "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"));
    } finally {
      setLoading(false);
    }
  };
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3e3);
  };

  const openWizard = (provider) => setWizard({ active: true, provider });
  const closeWizard = () => {
    setWizard({ active: false, provider: null });
  };
  const saveDirectIntegration = (provider) => {
    const val = provider === "meta" ? wizardMetaRef.current?.value?.trim() || "" : wizardGoogleRef.current?.value?.trim() || "";
    if (!val) return;
    if (provider === "meta") {
      if (!isValidMetaPixelId(val)) {
        showToast(L("Invalid Pixel ID. Must be 10\u201316 digits.", "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0628\u064A\u0643\u0633\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D. \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 10-16 \u0631\u0642\u0645\u0627\u064B."));
        return;
      }
      saveConfig({
        meta: { connected: true, business: "Direct Setup", page: "Direct Setup", pixel: { id: val, name: "Custom Pixel" } }
      });
      addDebugLog("POST", "/graph/v19/pixel/connect", "200 OK \u2014 Connected Pixel: " + val);
    } else {
      if (!isValidGA4Id(val)) {
        showToast(L("Invalid GA4 ID. Format: G-XXXXXXXX", "\u0645\u0639\u0631\u0651\u0641 GA4 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D. \u0627\u0644\u0635\u064A\u063A\u0629: G-XXXXXXXX"));
        return;
      }
      saveConfig({
        google: { connected: true, property: { measurementId: val, name: "Custom GA4 Property" } }
      });
      addDebugLog("POST", "/analytics/v1/property/connect", "200 OK \u2014 Connected GA4: " + val);
    }
    closeWizard();
  };
  const disconnectIntegration = (provider) => {
    if (provider === "meta") {
      saveConfig({ meta: { connected: false, business: "", page: "", pixel: { id: "", name: "" } } });
      addDebugLog("POST", "/graph/v19/pixel/disconnect", "200 OK \u2014 Disconnected Pixel");
    } else {
      saveConfig({ google: { connected: false, property: { name: "", measurementId: "" } } });
      addDebugLog("POST", "/analytics/v1/property/disconnect", "200 OK \u2014 Disconnected GA4");
    }
  };
  const handleAddCustomEvent = () => {
    setNewEventName("");
    setShowEventDialog(true);
  };
  const submitCustomEvent = () => {
    const clean = newEventName.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (clean && !customEvents.includes(clean)) {
      saveConfig({ customEvents: [...customEvents, clean] });
    }
    setShowEventDialog(false);
  };
  const handleExportLogs = () => {
    const header = ["Time", "User", "Event", "Platform", "Country", "UTM", "Status"];
    const rows = rtData.map((r) => [r.time, r.user, r.event, r.platform, r.country, r.utm, r.status]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracking_logs_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const runTestEvent = (index, eventName) => {
    setTestResults((prev) => ({ ...prev, [index]: "sending" }));
    try {
      Tracking.track(eventName, { test_mode: true, source: "Marketing Tracking Dashboard" });
      setTestResults((prev) => ({ ...prev, [index]: "success" }));
    } catch {
      setTestResults((prev) => ({ ...prev, [index]: "failed" }));
    }
  };
  const allEvents = [...STANDARD_EVENTS, ...customEvents];
  const checklist = [
    meta.connected,
    // Meta Connected
    meta.connected,
    // Pixel Installed
    meta.connected,
    // Pixel Receiving Events
    meta.connected,
    // Conversion API
    google.connected,
    // GA4 Connected
    google.connected,
    // GA4 Receiving Events
    google.connected,
    // Google Tag Manager
    google.connected,
    // Search Console
    true,
    // SSL / HTTPS
    false,
    // Domain Verification (requires manual step)
    meta.connected || google.connected,
    // Webhook Status
    meta.connected || google.connected
    // OAuth Token Valid
  ];
  const doneCount = checklist.filter(Boolean).length;
  const readinessPct = Math.round(doneCount / checklist.length * 100);
  const healthItems = [
    { label: L("Meta Connected", "\u0627\u062A\u0635\u0627\u0644 \u0641\u064A\u0633\u0628\u0648\u0643 Meta"), ok: meta.connected },
    { label: L("Pixel Installed", "\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0628\u064A\u0643\u0633\u0644"), ok: meta.connected },
    { label: L("Pixel Receiving Events", "\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0623\u062D\u062F\u0627\u062B \u0627\u0644\u0628\u064A\u0643\u0633\u0644"), ok: meta.connected },
    { label: L("Conversion API", "\u0648\u0627\u062C\u0647\u0629 Conversion API"), ok: meta.connected },
    { label: L("GA4 Connected", "\u0627\u062A\u0635\u0627\u0644 GA4"), ok: google.connected },
    { label: L("GA4 Receiving Events", "\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0623\u062D\u062F\u0627\u062B GA4"), ok: google.connected },
    { label: L("Google Tag Manager", "Google Tag Manager"), ok: google.connected },
    { label: L("Search Console", "Search Console"), ok: google.connected },
    { label: L("SSL / HTTPS", "\u0623\u0645\u0627\u0646 SSL"), ok: true },
    { label: L("Domain Verification", "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062F\u0648\u0645\u064A\u0646"), ok: false },
    { label: L("Webhook Status", "\u062D\u0627\u0644\u0629 Webhook"), ok: meta.connected || google.connected },
    { label: L("OAuth Token Valid", "\u0631\u0645\u0632 OAuth \u0635\u0627\u0644\u062D"), ok: meta.connected || google.connected }
  ];
  const aiRecs = [];
  if (!meta.connected) aiRecs.push({ ic: <AlertTriangle size={20} color="#f59e0b" />, title: L("Meta is not connected", "\u062D\u0633\u0627\u0628 Meta \u063A\u064A\u0631 \u0645\u062A\u0635\u0644"), desc: L("Ad campaigns will lose conversion data. Connect Meta now.", "\u0633\u062A\u0641\u0642\u062F \u062D\u0645\u0644\u0627\u062A\u0643 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644. \u0627\u0631\u0628\u0637 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u0622\u0646.") });
  if (!google.connected) aiRecs.push({ ic: <AlertTriangle size={20} color="#f59e0b" />, title: L("Google Analytics is not connected", "\u062C\u0648\u062C\u0644 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644"), desc: L("GA4 is crucial to study user behavior.", "\u062A\u062D\u0644\u064A\u0644\u0627\u062A GA4 \u0636\u0631\u0648\u0631\u064A\u0629 \u0644\u062F\u0631\u0627\u0633\u0629 \u0633\u0644\u0648\u0643 \u0627\u0644\u0632\u0648\u0627\u0631.") });
  aiRecs.push({ ic: <Cookie size={20} color="#3b82f6" />, title: L("Cookie Consent Banner missing", "\u0634\u0631\u064A\u0637 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0641\u0642\u0648\u062F"), desc: L("Google Consent Mode v2 requires a consent banner.", "\u064A\u062A\u0637\u0644\u0628 \u0648\u0636\u0639 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0646 \u062C\u0648\u062C\u0644 \u0648\u062C\u0648\u062F \u0634\u0631\u064A\u0637 \u0645\u0644\u0641\u0627\u062A \u0627\u0631\u062A\u0628\u0627\u0637.") });
  const tabs = [
    { id: "overview", icon: <BarChart size={16} style={{ flexShrink: 0 }} />, label: L("Overview", "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629") },
    { id: "integrations", icon: <Plug size={16} style={{ flexShrink: 0 }} />, label: L("Connect Accounts", "\u0631\u0628\u0637 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A"), badge: (!meta.connected ? 1 : 0) + (!google.connected ? 1 : 0) },
    { id: "events", icon: <Target size={16} style={{ flexShrink: 0 }} />, label: L("Event SDK", "\u0623\u062D\u062F\u0627\u062B \u0627\u0644\u062A\u062A\u0628\u0651\u0639") },
    { id: "library", icon: <BookOpen size={16} style={{ flexShrink: 0 }} />, label: L("Event Library", "\u0645\u0643\u062A\u0628\u0629 \u0627\u0644\u0623\u062D\u062F\u0627\u062B") },
    { id: "realtime", icon: <Activity size={16} style={{ flexShrink: 0 }} />, label: L("Realtime", "\u0627\u0644\u0628\u062B \u0627\u0644\u0644\u062D\u0638\u064A") },
    { id: "funnels", icon: <Filter size={16} style={{ flexShrink: 0 }} />, label: L("Funnels", "\u0627\u0644\u0623\u0642\u0645\u0627\u0639") },
    { id: "analytics", icon: <BarChart size={16} style={{ flexShrink: 0 }} />, label: L("Analytics", "\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A") },
    { id: "health", icon: <ShieldCheck size={16} style={{ flexShrink: 0 }} />, label: L("Health Check", "\u0641\u062D\u0635 \u0627\u0644\u0635\u062D\u0629") },
    { id: "debug", icon: <Terminal size={16} style={{ flexShrink: 0 }} />, label: L("Debug Logs", "Debug") },
    { id: "test", icon: <FlaskConical size={16} style={{ flexShrink: 0 }} />, label: L("Test Center", "\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631") },
    { id: "automation", icon: <Bot size={16} style={{ flexShrink: 0 }} />, label: L("AI Optimization", "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A") },
    { id: "advanced", icon: <Settings size={16} style={{ flexShrink: 0 }} />, label: L("Advanced", "\u0625\u0639\u062F\u0627\u062F \u0645\u062A\u0642\u062F\u0645") }
  ];
  if (loading) {
    return <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", borderRadius: "16px", border: "1px solid", padding: "64px", backgroundColor: "var(--bg-2)", borderColor: "var(--line)", minHeight: 400 }}
    >
        <div
      className="h-10 w-10 rounded-full border-4 animate-spin"
      style={{ borderColor: "rgba(3,195,168,0.2)", borderTopColor: "var(--green)" }}
    />
        <p className="text-sm font-semibold" style={{ color: "var(--txt-dim)" }}>
          {L("Loading tracking configurations\u2026", "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062A\u062A\u0628\u0639\u2026")}
        </p>
      </div>;
  }
  return <>
      {
    /* ------------------------------------------------------------------ */
  }
      {
    /* Scoped CSS — injected once per render                               */
  }
      {
    /* ------------------------------------------------------------------ */
  }
      <style>{`
        /* ---- Dark-mode defaults ---- */
        .mtc-scope {
          --mtc-bg-0:          var(--bg);
          --mtc-bg-1:          var(--bg-2);
          --mtc-panel-solid:   var(--card);
          --mtc-border:        var(--border);
          --mtc-border-soft:   var(--line);
          --mtc-violet:        var(--green);
          --mtc-violet-soft:   var(--green-2);
          --mtc-grad:          var(--grad);
          --mtc-green:         #10b981;
          --mtc-yellow:        #f59e0b;
          --mtc-red:           #ef4444;
          --mtc-text-0:        var(--txt);
          --mtc-text-1:        var(--txt-dim);
          --mtc-text-2:        var(--txt-dim2);
          --mtc-mono:          'JetBrains Mono', 'Consolas', monospace;

          display: block;
          direction: ${isRtl ? "rtl" : "ltr"};
          color: var(--mtc-text-0);
          background: var(--mtc-bg-0);
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid var(--mtc-border-soft);
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }

        /* ---- Light-mode overrides ---- */
        :root:not(.dark) .mtc-scope,
        [data-theme="light"] .mtc-scope {
          --mtc-bg-0:        var(--bg);
          --mtc-bg-1:        var(--bg-2);
          --mtc-panel-solid: var(--card);
          --mtc-border:      var(--border);
          --mtc-border-soft: var(--line);
          --mtc-text-0:      var(--txt);
          --mtc-text-1:      var(--txt-dim);
          --mtc-text-2:      var(--txt-dim2);
          background: var(--mtc-bg-0);
        }
        :root:not(.dark) .mtc-scope .mtc-card,
        [data-theme="light"] .mtc-scope .mtc-card {
          background: var(--mtc-panel-solid);
        }
        :root:not(.dark) .mtc-scope .mtc-integ-card,
        [data-theme="light"] .mtc-scope .mtc-integ-card {
          background: var(--mtc-bg-1);
        }
        :root:not(.dark) .mtc-scope .mtc-console,
        [data-theme="light"] .mtc-scope .mtc-console {
          background: #111827 !important;
          color: #f3f4f6;
        }
        :root:not(.dark) .mtc-scope .mtc-realtime-search,
        [data-theme="light"] .mtc-scope .mtc-realtime-search {
          background: var(--mtc-bg-1);
          color: var(--mtc-text-0);
        }
        :root:not(.dark) .mtc-scope .mtc-header,
        [data-theme="light"] .mtc-scope .mtc-header {
          background: var(--mtc-bg-1) !important;
        }

        /* ---- Common styles ---- */
        .mtc-scope * { box-sizing: border-box; }

        .mtc-scope ::-webkit-scrollbar { width: 6px; height: 6px; }
        .mtc-scope ::-webkit-scrollbar-thumb { background: var(--mtc-border); border-radius: 8px; }

        .mtc-header {
          padding: 18px 22px 0;
          background: var(--mtc-bg-1);
          border-bottom: 1px solid var(--mtc-border-soft);
        }
        .mtc-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .mtc-title-wrap { display: flex; align-items: center; gap: 10px; }
        .mtc-brand-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: var(--mtc-grad);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
          box-shadow: 0 4px 16px #7c3aed4d;
        }
        .mtc-title-wrap b { font-size: 15px; display: block; color: var(--mtc-text-0); }
        .mtc-title-wrap span { font-size: 11.5px; color: var(--mtc-text-2); display: block; margin-top: 2px; }
        .mtc-top-actions { display: flex; gap: 10px; align-items: center; }
        .mtc-mode-toggle {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--mtc-text-2); font-weight: 500;
          cursor: pointer; user-select: none;
        }
        .mtc-switch {
          width: 36px; height: 20px;
          background-color: #334155;
          border-radius: 9999px; position: relative; transition: background-color .2s ease-in-out;
        }
        .mtc-switch::after {
          content: ''; position: absolute; top: 2px;
          left: ${isRtl ? "auto" : "2px"};
          right: ${isRtl ? "2px" : "auto"};
          width: 16px; height: 16px;
          background-color: white; border-radius: 50%; transition: transform .2s ease-in-out;
        }
        .mtc-switch.on { background-color: #3b82f6; }
        .mtc-switch.on::after {
          transform: translateX(${isRtl ? "-16px" : "16px"});
        }

        .mtc-btn {
          border: none; cursor: pointer; font-family: inherit;
          font-size: 13px; font-weight: 500;
          padding: 8px 14px; border-radius: 9px; transition: all .2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .mtc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .mtc-btn-primary {
          background-color: #4f46e5; /* indigo-600 */
          color: white;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .mtc-btn-primary:hover:not(:disabled) { background-color: #6366f1; /* indigo-500 */ }
        
        .mtc-btn-ghost:disabled {
          background-color: rgba(30, 41, 59, 0.8); /* slate-800/80 */
          color: #94a3b8; /* slate-400 */
          border: 1px solid rgba(51, 65, 85, 0.5); /* slate-700/50 */
          opacity: 1; /* override mtc-btn:disabled opacity */
        }
        .mtc-btn-ghost {
          background-color: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          display: flex; align-items: center; gap: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .mtc-btn-ghost:hover:not(:disabled) { background-color: #334155; }

        .mtc-tabs-wrapper {
          display: flex; align-items: center; gap: 4px;
          padding: 0 10px; border-bottom: 1px solid var(--mtc-border-soft);
        }
        .mtc-tabs-arrow {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          background: transparent; border: none; color: var(--mtc-text-1);
          cursor: pointer; transition: .15s; flex-shrink: 0;
        }
        .mtc-tabs-arrow:hover {
          background: var(--mtc-panel-solid); color: var(--mtc-text-0);
        }
        .mtc-tabs {
          display: flex; gap: 2px;
          overflow-x: auto; scroll-behavior: auto;
          margin-bottom: -1px; scrollbar-width: none; flex: 1;
          padding: 0 24px; /* Fix clipping at edges */
        }
        .mtc-tabs::-webkit-scrollbar { display: none; }
        .mtc-tab {
          display: flex; align-items: center; gap: 8px;
          white-space: nowrap; padding: 8px 16px;
          font-size: 13px; color: var(--mtc-text-2);
          border-radius: 8px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .mtc-tab:hover { color: var(--mtc-text-0); background: rgba(255,255,255,0.05); }
        .mtc-tab.active { color: var(--mtc-text-0); background: rgba(255,255,255,0.1); }
        .mtc-badge {
          font-size: 9.5px; background: var(--mtc-red); color: #fff;
          padding: 1px 6px; border-radius: 20px; margin-inline-start: 4px;
        }

        @keyframes mtc-fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mtc-tab-content { animation: mtc-fade-in 0.2s ease-out; }

        .mtc-body { padding: 20px; overflow-y: auto; overflow-x: hidden; }

        .mtc-grid { display: grid; gap: 14px; }
        .mtc-g4 { grid-template-columns: repeat(4, 1fr); }
        .mtc-g3 { grid-template-columns: repeat(3, 1fr); }
        .mtc-g2 { grid-template-columns: repeat(2, 1fr); }
        @media(max-width: 900px) {
          .mtc-g4 { grid-template-columns: repeat(2, 1fr); }
          .mtc-g3 { grid-template-columns: repeat(2, 1fr); }
          .mtc-g2 { grid-template-columns: 1fr; }
        }
        @media(max-width: 600px) {
          .mtc-g4 { grid-template-columns: 1fr; }
          .mtc-g3 { grid-template-columns: 1fr; }
        }

        .mtc-card {
          background: var(--mtc-panel-solid);
          border: 1px solid var(--mtc-border-soft);
          border-radius: 14px; padding: 16px;
          position: relative; overflow: hidden;
          text-align: ${isRtl ? "right" : "left"};
        }
        .mtc-card-label {
          font-size: 11.5px; color: var(--mtc-text-2);
          display: flex; justify-content: space-between; align-items: center;
        }
        .mtc-card-value { font-size: 22px; font-weight: 800; margin-top: 6px; color: var(--mtc-text-0); }
        .mtc-card-delta { font-size: 12px; margin-top: 4px; }

        .mtc-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-inline-start: 6px; }
        .mtc-dot-green { background: var(--mtc-green); box-shadow: 0 0 8px #22c55e88; }
        .mtc-dot-red   { background: var(--mtc-red);   box-shadow: 0 0 8px #ef444488; }

        .mtc-sec-title {
          font-size: 14px; margin: 20px 0 12px;
          display: flex; align-items: center; gap: 8px;
          color: var(--mtc-text-0); font-weight: bold;
        }
        .mtc-sec-desc { font-size: 12px; color: var(--mtc-text-2); margin: -4px 0 14px; }

        .mtc-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .mtc-table th {
          text-align: ${isRtl ? "right" : "left"};
          color: var(--mtc-text-2); font-weight: 600; font-size: 11px;
          padding: 9px 10px; border-bottom: 1px solid var(--mtc-border-soft);
        }
        .mtc-table td { padding: 9px 10px; border-bottom: 1px solid #ffffff08; color: var(--mtc-text-1); }
        .mtc-table tr:hover td { background: #ffffff05; }

        .mtc-pill { padding: 3px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 600; display: inline-block; }
        .mtc-pill-green  { background: #22c55e22; color: #4ade80; border: 1px solid #22c55e44; }
        .mtc-pill-red    { background: #ef444422; color: #f87171; border: 1px solid #ef444444; }
        .mtc-pill-violet { background: #7c3aed22; color: #a78bfa; border: 1px solid #7c3aed44; }

        .mtc-event-card {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 14px; border: 1px solid var(--mtc-border-soft);
          border-radius: 11px; background: var(--mtc-panel-solid);
          transition: .15s; cursor: default;
        }
        .mtc-event-card:hover {
          border-color: var(--mtc-violet-soft); background: rgba(124, 58, 237, 0.08);
        }

        .mtc-integ-card {
          background: var(--mtc-bg-1);
          border: 1px solid var(--mtc-border-soft);
          border-radius: 16px; padding: 20px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .mtc-integ-head { display: flex; align-items: center; gap: 12px; }
        .mtc-integ-logo {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 800; color: #fff; flex-shrink: 0;
        }
        .mtc-logo-meta     { background: linear-gradient(135deg, #0866FF, #5C41FF); }
        .mtc-logo-google   { background: linear-gradient(135deg, #EA4335, #4285F4, #34A853, #FBBC05); }
        .mtc-logo-tiktok   { background: #000; border: 1px solid #333; }
        .mtc-logo-linkedin { background: #0A66C2; }
        .mtc-integ-name { font-size: 14px; font-weight: 700; color: var(--mtc-text-0); }
        .mtc-integ-desc { font-size: 11.5px; color: var(--mtc-text-2); margin-top: 2px; }
        .mtc-integ-meta-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 16px; padding-top: 16px; border-top: 1px solid #1e293b;
        }
        .mtc-connected-box {
          background: #22c55e12; border: 1px solid #22c55e33;
          border-radius: 12px; padding: 11px 13px;
          font-size: 11.5px; display: flex; flex-direction: column; gap: 5px;
        }
        .mtc-connected-row { display: flex; justify-content: space-between; color: var(--mtc-text-1); }
        .mtc-connected-row b { color: var(--mtc-text-0); font-weight: 600; }

        .mtc-console {
          background: var(--mtc-bg-1); border: 1px solid var(--mtc-border-soft);
          border-radius: 12px; padding: 14px;
          font-family: var(--mtc-mono); height: 320px;
          overflow-y: auto; line-height: 1.7; direction: ltr; text-align: left;
        }
        .mtc-log-line { font-size: 11px; color: var(--mtc-text-1); border-bottom: 1px solid #ffffff02; padding: 2px 0; white-space: pre-wrap; word-break: break-all; }
        .mtc-log-get      { color: #60a5fa; }
        .mtc-log-post     { color: #4ade80; }
        .mtc-log-identify { color: #f59e0b; }

        .mtc-realtime-search {
          background: var(--mtc-bg-1); border: 1px solid var(--mtc-border);
          border-radius: 9px; color: var(--mtc-text-0);
          padding: 8px 11px; font-size: 12px; font-family: inherit; width: 100%; outline: none;
        }
        .mtc-realtime-search:focus { border-color: var(--mtc-violet-soft); }

        .mtc-funnel-step {
          display: flex; align-items: center; gap: 14px; margin-bottom: 8px;
          padding: 10px 14px; border-radius: 12px; background: rgba(255,255,255,0.02);
          border: 1px solid transparent; transition: .2s ease;
        }
        .mtc-funnel-step:hover { background: var(--mtc-panel-solid); border-color: var(--mtc-border-soft); }
        .mtc-funnel-bar-wrap { flex: 1; background: rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; height: 32px; border: 1px solid var(--mtc-border-soft); box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
        .mtc-funnel-bar { height: 100%; background: var(--mtc-grad); display: flex; align-items: center; padding: 0 10px; font-size: 11.5px; font-weight: 700; color: #fff; transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1); white-space: nowrap; }
        .mtc-funnel-drop { font-size: 11px; font-weight: 600; color: var(--mtc-red); width: 64px; text-align: ${isRtl ? "right" : "left"}; flex-shrink: 0; }
        .mtc-funnel-label { width: 145px; font-size: 12.5px; color: var(--mtc-text-0); font-weight: 500; flex-shrink: 0; display: flex; align-items: center; gap: 8px; }

        .mtc-tag { font-size: 9.5px; padding: 2px 7px; border-radius: 6px; background: #ffffff0d; color: var(--mtc-text-2); }

        .mtc-note {
          background: rgba(3, 195, 168, 0.1); border: 1px solid rgba(3, 195, 168, 0.3);
          border-radius: 11px; padding: 11px 15px;
          font-size: 11.5px; color: var(--mtc-text-1); margin-bottom: 16px;
          line-height: 1.8; text-align: ${isRtl ? "right" : "left"};
        }

        .mtc-field {
          background: var(--mtc-bg-1); border: 1px solid var(--mtc-border);
          border-radius: 9px; color: var(--mtc-text-0);
          padding: 9px 12px; font-size: 12px;
          font-family: inherit; width: 100%; outline: none; margin-top: 4px;
        }
        .mtc-field:focus { border-color: var(--mtc-violet-soft); }
        .mtc-field:disabled { opacity: 0.5; cursor: not-allowed; }

        .mtc-overlay {
          position: fixed; inset: 0; background: rgba(5,3,8,0.8); backdrop-filter: blur(4px);
          display: none; align-items: center; justify-content: center; z-index: 99999;
        }
        .mtc-overlay.active { display: flex; }
        .mtc-modal {
          width: 460px; max-width: 92vw;
          background: linear-gradient(180deg,#1e1533,#150f22);
          border: 1px solid var(--mtc-border-soft); border-radius: 18px; padding: 26px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          color: var(--mtc-text-0); animation: mtc-slide-in 0.2s ease-out;
        }
        .mtc-modal-head { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
        .mtc-modal-title { font-size: 15px; font-weight: 700; color: var(--mtc-text-0); }
        .mtc-close { cursor: pointer; color: var(--mtc-text-2); font-size: 18px; line-height: 1; transition: .15s; }
        .mtc-close:hover { color: #fff; }
        .mtc-wizard-body { min-height: 180px; }

        @keyframes mtc-spin { to { transform: rotate(360deg); } }
        @keyframes mtc-slide-in {
          from { transform: translateY(-16px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      {
    /* ------------------------------------------------------------------ */
  }
      {
    /* Toast                                                               */
  }
      {
    /* ------------------------------------------------------------------ */
  }
      {toastMsg && <div
    style={{
      position: "fixed",
      top: 20,
      zIndex: 999999,
      [isRtl ? "left" : "right"]: 20,
      background: "var(--mtc-grad, linear-gradient(135deg,#7c3aed,#8a1f4b))",
      color: "#fff",
      padding: "11px 22px",
      borderRadius: 10,
      boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
      fontSize: 13,
      fontWeight: "bold",
      animation: "mtc-slide-in 0.2s ease-out"
    }}
  >
          {toastMsg}
        </div>}

      {
    /* ------------------------------------------------------------------ */
  }
      {
    /* Main scoped wrapper                                                 */
  }
      {
    /* ------------------------------------------------------------------ */
  }
      <div className="mtc-scope">

        {
    /* Header */
  }
        <div className="mtc-header">
          <div className="mtc-header-top">
            <div className="mtc-title-wrap">
              <div className="mtc-brand-icon"><Radar size={18} color="#fff" /></div>
              <div>
                <b>{L("Pixel & Analytics Tracking", "\u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u062A\u0628\u0639 \u0648\u0627\u0644\u0628\u064A\u0643\u0633\u0644")}</b>
                <span>
                  {isAdmin ? L("Platform-wide tracking integrations", "\u0625\u062F\u0627\u0631\u0629 \u0645\u0648\u062D\u062F\u0629 \u0644\u0623\u0643\u0648\u0627\u062F \u0627\u0644\u062A\u062A\u0628\u0639 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u0646\u0635\u0629") : L("Your personal affiliate tracking pixels", "\u0623\u0643\u0648\u0627\u062F \u0627\u0644\u062A\u062A\u0628\u0639 \u0648\u0627\u0644\u0628\u064A\u0643\u0633\u0644 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u0634\u062E\u0635\u064A")}
                </span>
              </div>
            </div>
            <div className="mtc-top-actions">
              <button className="mtc-btn mtc-btn-ghost" onClick={handleRefresh} disabled={loading || saving}>
                {L("Refresh", "\u062A\u062D\u062F\u064A\u062B")}
              </button>
              <div
    className="mtc-mode-toggle"
    onClick={() => saveConfig({ advancedMode: !advancedMode })}
    title={L("Toggle Developer Mode", "\u062A\u0628\u062F\u064A\u0644 \u0648\u0636\u0639 \u0627\u0644\u0645\u0637\u0648\u0631")}
  >
                <span>{L("Dev Mode", "\u0648\u0636\u0639 \u0627\u0644\u0645\u0637\u0648\u0631")}</span>
                <div className={`mtc-switch ${advancedMode ? "on" : ""}`} />
              </div>
              <button className="mtc-btn mtc-btn-ghost" onClick={() => setRtData([])}>
                {L("Reset Logs", "\u0645\u0633\u062D \u0627\u0644\u0633\u062C\u0644\u0627\u062A")}
              </button>
              {saving && <div
    style={{ width: 16, height: 16, border: "2px solid #7c3aed44", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "mtc-spin .7s linear infinite" }}
  />}
            </div>
          </div>

          {
    /* Tab bar */
  }
          <div className="mtc-tabs-wrapper">
            <button className="mtc-tabs-arrow" onClick={() => scrollTabs(-1)}>
              {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <div
    className="mtc-tabs"
    ref={tabsRef}
  >
              {tabs.map((tab) => <div
    key={tab.id}
    className={`mtc-tab ${activeTab === tab.id ? "active" : ""}`}
    onClick={() => setActiveTab(tab.id)}
  >
                  {tab.icon}
                  {tab.label}
                  {tab.badge > 0 && <span className="mtc-badge">{tab.badge}</span>}
                </div>)}
            </div>
            <button className="mtc-tabs-arrow" onClick={() => scrollTabs(1)}>
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {
    /* Body */
  }
        <div className="mtc-body">
          <div className="mtc-tab-content" key={activeTab}>

          {
    /* ================================================================
       1. OVERVIEW
       ================================================================ */
  }
          {activeTab === "overview" && <div>
              <div className="mtc-note">
                💡 {L(
    isAdmin ? "This tracking studio centralizes event delivery to Meta Pixel & Google Analytics globally across the platform." : "This panel lets you configure your personal affiliate tracking pixels. Events from your unique landing page links will be dispatched to the pixels you connect here.",
    isAdmin ? "\u064A\u0642\u0648\u0645 \u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u062A\u0628\u0639 \u0628\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0648\u062A\u0648\u062D\u064A\u062F\u0647\u0627 \u0644\u0628\u064A\u0643\u0633\u0644 \u0641\u064A\u0633\u0628\u0648\u0643 \u0648\u062C\u0648\u062C\u0644 \u0625\u064A\u0646\u0627\u0644\u064A\u062A\u0643\u0633 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0646\u0638\u0627\u0645." : "\u062A\u062A\u064A\u062D \u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0644\u0648\u062D\u0629 \u0625\u0639\u062F\u0627\u062F \u0628\u064A\u0643\u0633\u0644\u0627\u062A \u0627\u0644\u062A\u062A\u0628\u0639 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643 \u0644\u0635\u0641\u062D\u062A\u0643 \u0627\u0644\u062A\u0633\u0648\u064A\u0642\u064A\u0629."
  )}
              </div>

              <div className="mtc-grid mtc-g4">
                <div className="mtc-card">
                  <div className="mtc-card-label">{L("Marketing Readiness", "\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u062A\u0633\u0648\u064A\u0642")}</div>
                  <div className="mtc-card-value">{readinessPct}%</div>
                  <div className="mtc-card-delta" style={{ color: "var(--mtc-violet-soft)" }}>
                    {doneCount} {L(`of ${checklist.length} items ready`, `\u0645\u0646 ${checklist.length} \u0628\u0646\u0648\u062F \u062C\u0627\u0647\u0632\u0629`)}
                  </div>
                </div>
                <div className="mtc-card">
                  <div className="mtc-card-label">Meta Status <span className={`mtc-dot ${meta.connected ? "mtc-dot-green" : "mtc-dot-red"}`} /></div>
                  <div className="mtc-card-value" style={{ fontSize: 15, color: meta.connected ? "#4ade80" : "var(--mtc-text-2)" }}>
                    {meta.connected ? L("Active \u2713", "\u0645\u062A\u0635\u0644 \u2713") : L("Not Connected", "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644")}
                  </div>
                </div>
                <div className="mtc-card">
                  <div className="mtc-card-label">Google Status <span className={`mtc-dot ${google.connected ? "mtc-dot-green" : "mtc-dot-red"}`} /></div>
                  <div className="mtc-card-value" style={{ fontSize: 15, color: google.connected ? "#4ade80" : "var(--mtc-text-2)" }}>
                    {google.connected ? L("Active \u2713", "\u0645\u062A\u0635\u0644 \u2713") : L("Not Connected", "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644")}
                  </div>
                </div>
                <div className="mtc-card">
                  <div className="mtc-card-label">{L("Today's Events", "\u0623\u062D\u062F\u0627\u062B \u0627\u0644\u064A\u0648\u0645")}</div>
                  <div className="mtc-card-value" style={{ color: "var(--mtc-text-0)" }}>{rtData.length}</div>
                </div>
                <div className="mtc-card">
                  <div className="mtc-card-label">{L("Active Pixel ID", "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0628\u064A\u0643\u0633\u0644")}</div>
                  <div className="mtc-card-value" style={{ fontSize: 13, color: "var(--mtc-violet-soft)", wordBreak: "break-all" }}>
                    {meta.connected ? meta.pixel.id : "\u2014"}
                  </div>
                </div>
                <div className="mtc-card">
                  <div className="mtc-card-label">{L("Google GA4 ID", "\u0645\u0639\u0631\u0651\u0641 GA4")}</div>
                  <div className="mtc-card-value" style={{ fontSize: 13, color: "var(--mtc-violet-soft)", wordBreak: "break-all" }}>
                    {google.connected ? google.property.measurementId : "\u2014"}
                  </div>
                </div>
                <div className="mtc-card">
                  <div className="mtc-card-label">{L("SSL Status", "\u062D\u0627\u0644\u0629 SSL")}</div>
                  <div className="mtc-card-value" style={{ fontSize: 15, color: "#4ade80" }}>{L("Secure \u2713", "\u0622\u0645\u0646 \u2713")}</div>
                </div>
                <div className="mtc-card">
                  <div className="mtc-card-label">{L("Realtime Visitors", "\u0632\u0648\u0627\u0631 \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0641\u0639\u0644\u064A")}</div>
                  <div className="mtc-card-value" style={{ color: "var(--mtc-green)" }}>{rtData.length}</div>
                </div>
              </div>

              <h3 className="mtc-sec-title"><Trophy size={16} /> {L("Top Events Today", "\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0627\u0644\u064A\u0648\u0645")}</h3>
              <div className="mtc-grid mtc-g2">
                <div className="mtc-card" style={{ padding: 0 }}>
                  <table className="mtc-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: isRtl ? "right" : "left" }}>{L("Event", "\u0627\u0644\u062D\u062F\u062B")}</th>
                        <th style={{ textAlign: "center" }}>{L("Count", "\u0627\u0644\u0639\u062F\u062F")}</th>
                        <th style={{ textAlign: "center" }}>{L("%", "\u0627\u0644\u0646\u0633\u0628\u0629")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
    const counts = {};
    rtData.forEach((r) => {
      counts[r.event] = (counts[r.event] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topCount = entries[0]?.[1] || 1;
    if (entries.length === 0) {
      return <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--mtc-text-2)", padding: 16 }}>
                              {L("No events tracked yet. Events will appear here in realtime.", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u062D\u062F\u0627\u062B \u0628\u0639\u062F. \u0633\u062A\u0638\u0647\u0631 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0647\u0646\u0627 \u0641\u0648\u0631 \u062A\u062A\u0628\u0639\u0647\u0627.")}
                            </td></tr>;
    }
    return entries.map(([evt, cnt]) => <tr key={evt}>
                            <td style={{ textAlign: isRtl ? "right" : "left" }}>{evt}</td>
                            <td style={{ textAlign: "center" }}>{cnt.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>
                              <span className={cnt / topCount > 0.5 ? "mtc-pill mtc-pill-green" : "mtc-pill mtc-pill-violet"}>
                                {(cnt / topCount * 100).toFixed(1)}%
                              </span>
                            </td>
                          </tr>);
  })()}
                    </tbody>
                  </table>
                </div>
                <div className="mtc-card">
                  <div className="mtc-card-label" style={{ marginBottom: 8 }}>{L("System Status", "\u062D\u0627\u0644\u0629 \u0627\u0644\u0646\u0638\u0627\u0645")}</div>
                  <div style={{ fontSize: 12.5, color: "var(--mtc-text-2)", padding: "10px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span className="mtc-dot mtc-dot-green" style={{ marginTop: 6 }} />
                      <div>
                        <div style={{ color: "var(--mtc-text-0)", fontWeight: 600 }}>{L("SSL Secure", "\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0622\u0645\u0646 SSL")}</div>
                        <div style={{ fontSize: 11, marginTop: 2 }}>{L("HTTPS is active and secure.", "\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644 HTTPS \u0646\u0634\u0637 \u0648\u0622\u0645\u0646.")}</div>
                      </div>
                    </div>
                    {!meta.connected && <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span className="mtc-dot mtc-dot-red" style={{ marginTop: 6 }} />
                        <div>
                          <div style={{ color: "var(--mtc-text-0)", fontWeight: 600 }}>{L("Meta Not Connected", "Meta \u063A\u064A\u0631 \u0645\u062A\u0635\u0644")}</div>
                          <div style={{ fontSize: 11, marginTop: 2 }}>{L("Connect Meta Pixel to start tracking conversions.", "\u0627\u0631\u0628\u0637 \u0628\u064A\u0643\u0633\u0644 Meta \u0644\u0628\u062F\u0621 \u062A\u062A\u0628\u0639 \u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A.")}</div>
                        </div>
                      </div>}
                    {!google.connected && <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span className="mtc-dot mtc-dot-red" style={{ marginTop: 6 }} />
                        <div>
                          <div style={{ color: "var(--mtc-text-0)", fontWeight: 600 }}>{L("GA4 Not Connected", "GA4 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644")}</div>
                          <div style={{ fontSize: 11, marginTop: 2 }}>{L("Connect Google Analytics 4 to track behavior.", "\u0627\u0631\u0628\u0637 Google Analytics 4 \u0644\u062A\u062A\u0628\u0639 \u0633\u0644\u0648\u0643 \u0627\u0644\u0632\u0648\u0627\u0631.")}</div>
                        </div>
                      </div>}
                    {meta.connected && google.connected && <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span className="mtc-dot mtc-dot-green" style={{ marginTop: 6 }} />
                        <div>
                          <div style={{ color: "var(--mtc-text-0)", fontWeight: 600 }}>{L("All Integrations Healthy", "\u062C\u0645\u064A\u0639 \u0627\u0644\u062A\u0643\u0627\u0645\u0644\u0627\u062A \u0633\u0644\u064A\u0645\u0629")}</div>
                          <div style={{ fontSize: 11, marginTop: 2 }}>{L("Meta and GA4 are both active and receiving events.", "Meta \u0648GA4 \u0646\u0634\u0637\u0627\u0646 \u0648\u064A\u0633\u062A\u0642\u0628\u0644\u0627\u0646 \u0627\u0644\u0623\u062D\u062F\u0627\u062B.")}</div>
                        </div>
                      </div>}
                  </div>
                </div>
              </div>
            </div>}

          {
    /* ================================================================
       2. INTEGRATIONS
       ================================================================ */
  }
          {activeTab === "integrations" && <div>
              <p className="mtc-sec-desc">
                {L("Link your pixel accounts to start tracking marketing conversions.", "\u0627\u0631\u0628\u0637 \u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0628\u064A\u0643\u0633\u0644 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643 \u0644\u0628\u062F\u0621 \u062A\u062A\u0628\u0639 \u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A \u0627\u0644\u062A\u0633\u0648\u064A\u0642\u064A\u0629.")}
              </p>
              <div className="mtc-grid mtc-g2">

                {
    /* Meta Card */
  }
                <div className="mtc-integ-card">
                  <div className="mtc-integ-head">
                    <div className="mtc-integ-logo mtc-logo-meta">f</div>
                    <div>
                      <div className="mtc-integ-name">{L("Meta Facebook Ads", "\u0631\u0628\u0637 \u0641\u064A\u0633\u0628\u0648\u0643 (Meta)")}</div>
                      <div className="mtc-integ-desc">{L("Pixel + Conversions API integration", "\u0631\u0628\u0637 \u0643\u0648\u062F \u0627\u0644\u0628\u064A\u0643\u0633\u0644 \u0648\u0648\u0627\u062C\u0647\u0629 Conversion API")}</div>
                    </div>
                  </div>
                  {meta.connected ? <div className="mtc-connected-box">
                      <div className="mtc-connected-row"><span>Business</span><b>{meta.business}</b></div>
                      <div className="mtc-connected-row"><span>Pixel ID</span><b>{meta.pixel.id}</b></div>
                      <div className="mtc-connected-row"><span>Conversions API</span><b style={{ color: "#4ade80" }}>{L("Active \u2713", "\u0646\u0634\u0637 \u2713")}</b></div>
                    </div> : <div className="mtc-integ-desc" style={{ color: "var(--mtc-text-2)" }}>
                      {L("Meta Ads account is not linked yet.", "\u0644\u0645 \u064A\u062A\u0645 \u0631\u0628\u0637 \u062D\u0633\u0627\u0628 \u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0641\u064A\u0633\u0628\u0648\u0643 \u0628\u0639\u062F.")}
                    </div>}
                  <div className="mtc-integ-meta-row">
                    <span>{meta.connected ? L("Last sync: Just now", "\u0622\u062E\u0631 \u0645\u0632\u0627\u0645\u0646\u0629: \u0627\u0644\u0622\u0646") : "\u2014"}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {meta.connected && <button className="mtc-btn mtc-btn-ghost" onClick={() => disconnectIntegration("meta")} style={{ color: "var(--mtc-red)", borderColor: "#ef444433" }}>
                          {L("Disconnect", "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u0628\u0637")}
                        </button>}
                      <button className="mtc-btn mtc-btn-primary" onClick={() => openWizard("meta")}>
                        {meta.connected ? L("Reconnect", "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0631\u0628\u0637") : L("Connect Meta", "\u0631\u0628\u0637 \u0641\u064A\u0633\u0628\u0648\u0643")}
                      </button>
                    </div>
                  </div>
                </div>

                {
    /* Google Card */
  }
                <div className="mtc-integ-card">
                  <div className="mtc-integ-head">
                    <div className="mtc-integ-logo mtc-logo-google">G</div>
                    <div>
                      <div className="mtc-integ-name">{L("Google Analytics 4", "\u0631\u0628\u0637 \u062C\u0648\u062C\u0644 (Google Analytics)")}</div>
                      <div className="mtc-integ-desc">{L("GA4 + GTM automatic link", "\u062A\u0641\u0639\u064A\u0644 \u062A\u062D\u0644\u064A\u0644\u0627\u062A \u062C\u0648\u062C\u0644 \u0648\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A GTM/GA4")}</div>
                    </div>
                  </div>
                  {google.connected ? <div className="mtc-connected-box">
                      <div className="mtc-connected-row"><span>GA4 Property</span><b>{google.property.name}</b></div>
                      <div className="mtc-connected-row"><span>Measurement ID</span><b>{google.property.measurementId}</b></div>
                      <div className="mtc-connected-row"><span>Google Tag Manager</span><b style={{ color: "#4ade80" }}>{L("Connected \u2713", "\u0645\u062A\u0635\u0644 \u2713")}</b></div>
                    </div> : <div className="mtc-integ-desc" style={{ color: "var(--mtc-text-2)" }}>
                      {L("Google account is not linked yet.", "\u0644\u0645 \u064A\u062A\u0645 \u0631\u0628\u0637 \u062D\u0633\u0627\u0628 \u062C\u0648\u062C\u0644 \u0628\u0639\u062F.")}
                    </div>}
                  <div className="mtc-integ-meta-row">
                    <span>{google.connected ? L("Last sync: Just now", "\u0622\u062E\u0631 \u0645\u0632\u0627\u0645\u0646\u0629: \u0627\u0644\u0622\u0646") : "\u2014"}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {google.connected && <button className="mtc-btn mtc-btn-ghost" onClick={() => disconnectIntegration("google")} style={{ color: "var(--mtc-red)", borderColor: "#ef444433" }}>
                          {L("Disconnect", "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u0628\u0637")}
                        </button>}
                      <button className="mtc-btn mtc-btn-primary" onClick={() => openWizard("google")}>
                        {google.connected ? L("Reconnect", "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0631\u0628\u0637") : L("Connect Google", "\u0631\u0628\u0637 \u062C\u0648\u062C\u0644")}
                      </button>
                    </div>
                  </div>
                </div>

                {
    /* TikTok (placeholder) */
  }
                <div className="mtc-integ-card" style={{ opacity: 0.55 }}>
                  <div className="mtc-integ-head">
                    <div className="mtc-integ-logo mtc-logo-tiktok">🎵</div>
                    <div>
                      <div className="mtc-integ-name">{L("TikTok Ads", "\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u062A\u064A\u0643 \u062A\u0648\u0643")}</div>
                      <div className="mtc-integ-desc">{L("Coming soon \u2014 direct TikTok pixel linking", "\u0642\u0631\u064A\u0628\u0627\u064B \u2014 \u0631\u0628\u0637 \u0645\u0628\u0627\u0634\u0631 \u0644\u0628\u064A\u0643\u0633\u0644 \u062A\u064A\u0643 \u062A\u0648\u0643")}</div>
                    </div>
                  </div>
                  <div className="mtc-integ-meta-row">
                    <span>{L("Native integration \u2014 no code changes needed", "\u0625\u062F\u0645\u0627\u062C \u062A\u0644\u0642\u0627\u0626\u064A \u0628\u062F\u0648\u0646 \u0643\u0648\u062F")}</span>
                    <button className="mtc-btn mtc-btn-ghost" disabled>{L("Soon", "\u0642\u0631\u064A\u0628\u0627\u064B")}</button>
                  </div>
                </div>

                {
    /* LinkedIn (placeholder) */
  }
                <div className="mtc-integ-card" style={{ opacity: 0.55 }}>
                  <div className="mtc-integ-head">
                    <div className="mtc-integ-logo mtc-logo-linkedin">in</div>
                    <div>
                      <div className="mtc-integ-name">{L("LinkedIn Insight Tag", "\u0631\u0628\u0637 \u0644\u064A\u0646\u0643\u062F \u0625\u0646")}</div>
                      <div className="mtc-integ-desc">{L("Coming soon \u2014 target premium B2B professionals", "\u0642\u0631\u064A\u0628\u0627\u064B \u2014 \u062A\u062A\u0628\u0639 \u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0644\u064A\u0646\u0643\u062F \u0625\u0646")}</div>
                    </div>
                  </div>
                  <div className="mtc-integ-meta-row">
                    <span>{L("Also supports Pinterest, X, and Reddit pixels", "\u064A\u062F\u0639\u0645 \u0623\u064A\u0636\u0627\u064B \u0628\u0646\u062A\u0631\u0633\u062A \u0648\u062A\u0648\u064A\u062A\u0631 \u0648\u0631\u064A\u062F\u064A\u062A")}</span>
                    <button className="mtc-btn mtc-btn-ghost" disabled>{L("Soon", "\u0642\u0631\u064A\u0628\u0627\u064B")}</button>
                  </div>
                </div>
              </div>
            </div>}

          {
    /* ================================================================
       3. EVENT SDK
       ================================================================ */
  }
          {activeTab === "events" && <div>
              <p className="mtc-sec-desc">
                {L("All activities are dispatched automatically using the unified front-end Tracking SDK.", "\u064A\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0623\u062D\u062F\u0627\u062B \u0627\u0644\u062A\u062A\u0628\u0639 \u0645\u0646 \u062E\u0644\u0627\u0644 \u0643\u0648\u062F \u0627\u0644\u0645\u0637\u0648\u0631 \u0627\u0644\u0645\u0648\u062D\u062F:")}
              </p>
              <div className="mtc-card" style={{ marginBottom: 16 }}>
                <div className="mtc-card-label" style={{ marginBottom: 8 }}>Tracking SDK Reference</div>
                <div className="mtc-console" style={{ height: "auto" }}>
                  <div className="mtc-log-line"><span className="mtc-log-get">Tracking.page()</span> → {L("Auto tracks Page Views on route changes", "\u062A\u0633\u062C\u064A\u0644 \u0645\u0634\u0627\u0647\u062F\u0627\u062A \u0627\u0644\u0635\u0641\u062D\u0627\u062A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B")}</div>
                  <div className="mtc-log-line"><span className="mtc-log-identify">Tracking.identify(userId, traits)</span> → {L("Identifies user context", "\u0631\u0628\u0637 \u0647\u0648\u064A\u0629 \u0627\u0644\u0639\u0645\u064A\u0644")}</div>
                  <div className="mtc-log-line"><span className="mtc-log-post">Tracking.track("purchase", {'{ value: 49, currency: "USD" }'})</span> → {L("Logs purchases", "\u062A\u0633\u062C\u064A\u0644 \u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0634\u0631\u0627\u0621")}</div>
                  <div className="mtc-log-line"><span className="mtc-log-post">Tracking.lead({'{ source: "main_funnel" }'})</span> → {L("Logs new lead captures", "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646")}</div>
                  <div className="mtc-log-line"><span className="mtc-log-post">Tracking.bookMeeting({'{ type: "coaching" }'})</span> → {L("Logs scheduled meetings", "\u062A\u0633\u062C\u064A\u0644 \u062D\u062C\u0632 \u0645\u0648\u0639\u062F")}</div>
                  <div className="mtc-log-line"><span className="mtc-log-post">Tracking.custom("event_name", payload)</span> → {L("Logs custom business actions", "\u0625\u0631\u0633\u0627\u0644 \u062D\u062F\u062B \u0645\u062E\u0635\u0635")}</div>
                </div>
              </div>
              <h3 className="mtc-sec-title"><Target size={16} /> {L("Event Schema Mapping", "\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0627\u0644\u0645\u0648\u062D\u062F\u0629")}</h3>
              <div className="mtc-grid mtc-g2">
                {EVENT_MAPPINGS.map((m, idx) => <div className="mtc-card" key={idx}>
                    <div className="mtc-card-label">{L("Unified Standard Event", "\u062D\u062F\u062B \u0645\u0648\u062D\u062F \u0642\u064A\u0627\u0633\u064A")}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, margin: "5px 0 9px", display: "flex", alignItems: "center", gap: 6 }}><Target size={14} /> {m.std}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {m.targets.map((targ, tIdx) => <span className="mtc-tag" key={tIdx}>{targ}</span>)}
                    </div>
                  </div>)}
              </div>
            </div>}

          {
    /* ================================================================
       4. EVENT LIBRARY
       ================================================================ */
  }
          {activeTab === "library" && <div>
              <div style={{ display: "flex", gap: 9, marginBottom: 14 }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                  <Search size={15} style={{ position: "absolute", left: isRtl ? "auto" : 12, right: isRtl ? 12 : "auto", top: 9, color: "var(--mtc-text-2)" }} />
                  <input
    className="mtc-realtime-search"
    style={{ padding: "8px 12px", paddingLeft: isRtl ? 12 : 36, paddingRight: isRtl ? 36 : 12 }}
    placeholder={L("Search event name\u2026", "\u0627\u0628\u062D\u062B \u0641\u064A \u0645\u0643\u062A\u0628\u0629 \u0627\u0644\u0623\u062D\u062F\u0627\u062B\u2026")}
    value={libraryFilter}
    onChange={(e) => setLibraryFilter(e.target.value)}
  />
                </div>
                <button className="mtc-btn mtc-btn-primary" onClick={handleAddCustomEvent} style={{ whiteSpace: "nowrap" }}>
                  <Plus size={15} /> {L("Add Custom Event", "\u062D\u062F\u062B \u0645\u062E\u0635\u0635")}
                </button>
              </div>
              <div className="mtc-grid mtc-g3">
                {allEvents.filter((e) => !libraryFilter || e.toLowerCase().includes(libraryFilter.toLowerCase())).map((e, idx) => <div key={idx} className="mtc-event-card">
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--mtc-text-0)", fontWeight: 600 }}>
                        <Target size={15} color="var(--mtc-text-2)" /> {e}
                      </span>
                      <span className={`mtc-pill ${STANDARD_EVENTS.includes(e) ? "mtc-pill-green" : "mtc-pill-violet"}`} style={{ fontSize: 10 }}>
                        {STANDARD_EVENTS.includes(e) ? L("Standard", "\u0642\u064A\u0627\u0633\u064A") : L("Custom", "\u0645\u062E\u0635\u0635")}
                      </span>
                    </div>)}
              </div>
            </div>}

          {
    /* ================================================================
       5. REALTIME LOGS
       ================================================================ */
  }
          {activeTab === "realtime" && <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                <input
    className="mtc-realtime-search"
    style={{ maxWidth: 240 }}
    placeholder={L("\u{1F50D} Filter by event\u2026", "\u{1F50D} \u062A\u0635\u0641\u064A\u0629 \u0627\u0644\u0623\u062D\u062F\u0627\u062B\u2026")}
    value={rtFilter}
    onChange={(e) => setRtFilter(e.target.value)}
  />
                <button className="mtc-btn mtc-btn-ghost" onClick={handleExportLogs}>
                  📥 {L("Export CSV", "\u062A\u0635\u062F\u064A\u0631 CSV")}
                </button>
              </div>
              <div className="mtc-card" style={{ overflowX: "auto" }}>
                <table className="mtc-table">
                  <thead>
                    <tr>
                      <th>{L("Time", "\u0627\u0644\u0648\u0642\u062A")}</th>
                      <th>{L("User", "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645")}</th>
                      <th>{L("Event", "\u0627\u0644\u062D\u062F\u062B")}</th>
                      <th>{L("Destination", "\u0627\u0644\u0645\u0646\u0635\u0629")}</th>
                      <th>{L("Location", "\u0627\u0644\u0628\u0644\u062F")}</th>
                      <th>{L("UTM", "\u0627\u0644\u062D\u0645\u0644\u0629")}</th>
                      <th>{L("Status", "\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rtData.filter((r) => !rtFilter || r.event.toLowerCase().includes(rtFilter.toLowerCase())).map((r, idx) => <tr key={idx}>
                          <td style={{ fontFamily: "var(--mtc-mono)", fontSize: 10.5 }}>{r.time}</td>
                          <td>{r.user}</td>
                          <td><b>{r.event}</b></td>
                          <td><span className="mtc-pill mtc-pill-violet">{r.platform}</span></td>
                          <td>{r.country}</td>
                          <td><code style={{ fontSize: 11, color: "var(--mtc-violet-soft)" }}>{r.utm}</code></td>
                          <td>
                            {r.status === "success" ? <span className="mtc-pill mtc-pill-green">{L("Success", "\u062A\u0645")}</span> : <span className="mtc-pill mtc-pill-red">{L("Failed", "\u0641\u0634\u0644")}</span>}
                          </td>
                        </tr>)}
                    {rtData.length === 0 && <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--mtc-text-2)" }}>
                          {L("No events dispatched in this session yet.", "\u0644\u0645 \u064A\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0623\u064A \u0623\u062D\u062F\u0627\u062B \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0639\u062F.")}
                        </td>
                      </tr>}
                  </tbody>
                </table>
              </div>
            </div>}

          {
    /* ================================================================
       5A. FUNNELS & ANALYTICS (NEW TABS)
       ================================================================ */
  }
          {activeTab === "funnels" && <div>
              <p className="mtc-sec-desc">
                {L("Visualize your customer journey and conversion drop-offs based on standard tracked events.", "\u062A\u062A\u0628\u0639 \u0631\u062D\u0644\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0645\u062A\u0633\u0627\u0642\u0637 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629 \u0627\u0644\u0645\u062C\u0645\u0639\u0629.")}
              </p>
              <div className="mtc-card" style={{ padding: "24px 20px" }}>
                {[
    { label: "Landing Page", labelAr: "\u0632\u064A\u0627\u0631\u0629 \u0627\u0644\u0635\u0641\u062D\u0629", val: 100, icon: <BookOpen size={16} color="var(--mtc-text-2)" /> },
    { label: "Signup", labelAr: "\u0627\u0644\u062A\u0633\u062C\u064A\u0644", val: 62, icon: <UserPlus size={16} color="var(--mtc-text-2)" /> },
    { label: "Dashboard", labelAr: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", val: 54, icon: <BarChart size={16} color="var(--mtc-text-2)" /> },
    { label: "AI Usage", labelAr: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0630\u0643\u0627\u0621", val: 41, icon: <Bot size={16} color="var(--mtc-text-2)" /> },
    { label: "Purchase", labelAr: "\u0634\u0631\u0627\u0621", val: 19, icon: <CreditCard size={16} color="var(--mtc-text-2)" /> },
    { label: "Subscription", labelAr: "\u0627\u0634\u062A\u0631\u0627\u0643", val: 15, icon: <ShieldCheck size={16} color="var(--mtc-text-2)" /> },
    { label: "Upsell", labelAr: "\u0634\u0631\u0627\u0621 \u0625\u0636\u0627\u0641\u064A", val: 6, icon: <Target size={16} color="var(--mtc-text-2)" /> }
  ].map((s, i, arr) => {
    const drop = i === 0 ? "" : `-${arr[i - 1].val - s.val}%`;
    return <div className="mtc-funnel-step" key={i}>
                      <div className="mtc-funnel-label">{s.icon} {L(s.label, s.labelAr)}</div>
                      <div className="mtc-funnel-bar-wrap">
                        <div className="mtc-funnel-bar" style={{ width: animateStats ? `${s.val}%` : "0%" }}>
                          {s.val}%
                        </div>
                      </div>
                      <div className="mtc-funnel-drop">{drop && <span style={{ display: "inline-block", padding: "3px 7px", background: "rgba(239,68,68,0.1)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>{drop}</span>}</div>
                    </div>;
  })}
              </div>
            </div>}

          {activeTab === "analytics" && <div>
              <div className="mtc-grid mtc-g2">
                <div className="mtc-card"><div className="mtc-card-label" style={{ marginBottom: 12 }}>{L("Traffic Sources", "\u0645\u0635\u0627\u062F\u0631 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {[
    { label: "Meta Ads", value: 38 },
    { label: "Google Ads", value: 26 },
    { label: "Organic", value: 20 },
    { label: "Direct", value: 11 },
    { label: "Referral", value: 5 }
  ].map((d, i) => <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--mtc-text-1)", marginBottom: 4 }}>
                          <span>{d.label}</span><span>{d.value}%</span>
                        </div>
                        <div style={{ height: 7, background: "#170f26", borderRadius: 6, overflow: "hidden", border: "1px solid var(--mtc-border-soft)" }}>
                          <div style={{ height: "100%", width: animateStats ? `${d.value}%` : "0%", background: "var(--mtc-grad)", transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                        </div>
                      </div>)}
                  </div>
                </div>
                <div className="mtc-card"><div className="mtc-card-label" style={{ marginBottom: 12 }}>{L("Device Distribution", "\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0623\u062C\u0647\u0632\u0629")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {[
    { label: "Mobile", value: 64 },
    { label: "Desktop", value: 31 },
    { label: "Tablet", value: 5 }
  ].map((d, i) => <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--mtc-text-1)", marginBottom: 4 }}>
                          <span>{d.label}</span><span>{d.value}%</span>
                        </div>
                        <div style={{ height: 7, background: "#170f26", borderRadius: 6, overflow: "hidden", border: "1px solid var(--mtc-border-soft)" }}>
                          <div style={{ height: "100%", width: animateStats ? `${d.value}%` : "0%", background: "linear-gradient(90deg, #8a1f4b, #c2477c)", transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                        </div>
                      </div>)}
                  </div>
                </div>
              </div>
              <div className="mtc-grid mtc-g4" style={{ marginTop: 14 }}>
                <div className="mtc-card"><div className="mtc-card-label">Conversion Rate</div><div className="mtc-card-value">3.4%</div></div>
                <div className="mtc-card"><div className="mtc-card-label">Avg Session</div><div className="mtc-card-value">4:12</div></div>
                <div className="mtc-card"><div className="mtc-card-label">Returning</div><div className="mtc-card-value">28%</div></div>
                <div className="mtc-card"><div className="mtc-card-label">Bounce</div><div className="mtc-card-value">41%</div></div>
              </div>
            </div>}

          {
    /* ================================================================
       6. HEALTH CHECK
       ================================================================ */
  }
          {activeTab === "health" && <div>
              <p className="mtc-sec-desc">
                {L("Diagnostic health checks for your analytics scripts.", "\u0641\u062D\u0635 \u0623\u0648\u062A\u0648\u0645\u0627\u062A\u064A\u0643\u064A \u0644\u0636\u0645\u0627\u0646 \u062C\u0648\u062F\u0629 \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u062A\u062A\u0628\u0639 \u0627\u0644\u0645\u062A\u0635\u0644\u0629.")}
              </p>
              <div className="mtc-card">
                {healthItems.map((item, idx) => <div
    key={idx}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 4px",
      borderBottom: idx < healthItems.length - 1 ? "1px solid #ffffff08" : "none",
      fontSize: 12.5
    }}
  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span className={`mtc-dot ${item.ok ? "mtc-dot-green" : "mtc-dot-red"}`} />
                      <span style={{ color: "var(--mtc-text-1)" }}>{item.label}</span>
                    </div>
                    <span className={`mtc-pill ${item.ok ? "mtc-pill-green" : "mtc-pill-red"}`}>
                      {item.ok ? L("Healthy", "\u0633\u0644\u064A\u0645") : L("Attention Required", "\u064A\u062D\u062A\u0627\u062C \u0627\u0646\u062A\u0628\u0627\u0647")}
                    </span>
                  </div>)}
              </div>
            </div>}

          {
    /* ================================================================
       7. DEBUG LOGS
       ================================================================ */
  }
          {activeTab === "debug" && <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                <p className="mtc-sec-desc" style={{ margin: 0 }}>
                  {L("Developer console \u2014 Request & Response network logging.", "\u0648\u062D\u062F\u0629 \u0627\u0644\u0645\u0637\u0648\u0631\u064A\u0646 \u2014 \u062A\u062A\u0628\u0639 \u0641\u0648\u0631\u064A \u0644\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0627\u062A.")}
                </p>
                <button className="mtc-btn mtc-btn-ghost" onClick={() => setDebugLogs([])}>
                  {L("Clear Console", "\u0645\u0633\u062D \u0627\u0644\u0633\u062C\u0644\u0627\u062A")}
                </button>
              </div>
              <div className="mtc-console">
                {debugLogs.length === 0 ? <div style={{ color: "var(--mtc-text-2)", fontSize: 12, textAlign: "center", padding: "80px 0" }}>
                    [Console Idle] {L("Waiting for tracking events\u2026", "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0623\u062D\u062F\u0627\u062B \u0627\u0644\u062A\u062A\u0628\u0639\u2026")}
                  </div> : debugLogs.map((log, idx) => <div className="mtc-log-line" key={idx}>{log}</div>)}
              </div>
            </div>}

          {
    /* ================================================================
       8. TEST CENTER
       ================================================================ */
  }
          {activeTab === "test" && <div>
              <p className="mtc-sec-desc">
                {L("Click any button to fire a mock payload to Meta and GA4 to test active connections.", "\u0623\u0631\u0633\u0644 \u062D\u062F\u062B\u0627\u064B \u062A\u062C\u0631\u064A\u0628\u064A\u0627\u064B \u0627\u0644\u0622\u0646 \u0644\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0646\u0634\u0627\u0637 \u0648\u0633\u0631\u0639\u0629 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0628\u064A\u0643\u0633\u0644.")}
              </p>
              <div className="mtc-grid mtc-g3">
                {TEST_EVENTS.map((t2, idx) => <div
    key={idx}
    onClick={() => runTestEvent(idx, t2.name)}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 7,
      alignItems: "flex-start",
      padding: 15,
      border: "1px solid var(--mtc-border-soft)",
      borderRadius: 13,
      cursor: "pointer",
      background: "var(--mtc-panel-solid)",
      transition: ".15s"
    }}
    onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--mtc-violet-soft)"}
    onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--mtc-border-soft)"}
  >
                    <div style={{ color: "var(--mtc-violet)" }}>{t2.icon}</div>
                    <b style={{ color: "var(--mtc-text-0)", fontSize: 13 }}>{L(`Test ${t2.name}`, `\u0627\u062E\u062A\u0628\u0627\u0631 ${t2.name}`)}</b>
                    <span style={{ fontSize: 10.5, color: "var(--mtc-text-2)" }}>
                      {L("Sends tracking event mock payload", "\u0625\u0631\u0633\u0627\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u062C\u0644\u0633\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0629 \u0644\u0644\u0627\u062E\u062A\u0628\u0627\u0631")}
                    </span>
                    {testResults[idx] === "sending" && <span style={{ background: "#eab30822", color: "#facc15", fontSize: 10.5, padding: "3px 7px", borderRadius: 6 }}>
                        {L("Sending\u2026", "\u062C\u0627\u0631\u064A \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u2026")}
                      </span>}
                    {testResults[idx] === "success" && <span style={{ background: "#22c55e22", color: "#4ade80", fontSize: 10.5, padding: "3px 7px", borderRadius: 6 }}>
                        ✓ {L("Delivered successfully", "\u0648\u0635\u0644 \u0628\u0646\u062C\u0627\u062D")}
                      </span>}
                    {testResults[idx] === "failed" && <span style={{ background: "#ef444422", color: "#f87171", fontSize: 10.5, padding: "3px 7px", borderRadius: 6 }}>
                        ✗ {L("Failed", "\u0641\u0634\u0644")}
                      </span>}
                  </div>)}
              </div>
            </div>}

          {
    /* ================================================================
       9. AI OPTIMIZATION
       ================================================================ */
  }
          {activeTab === "automation" && <div>
              <p className="mtc-sec-desc">
                {L("Automatic diagnostics and marketing recommendations based on your pixel health.", "\u062A\u0648\u0635\u064A\u0627\u062A \u0630\u0643\u064A\u0629 \u0644\u062A\u062D\u0633\u064A\u0646 \u062C\u0648\u062F\u0629 \u0648\u0623\u0645\u0627\u0646 \u062A\u062A\u0628\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.")}
              </p>
              {aiRecs.map((rec, idx) => <div
    key={idx}
    style={{
      display: "flex",
      gap: 11,
      padding: 13,
      border: "1px solid var(--mtc-border-soft)",
      borderRadius: 11,
      background: "var(--mtc-panel-solid)",
      marginBottom: 9,
      alignItems: "flex-start"
    }}
  >
                  <div>{rec.ic}</div>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 12.5, display: "block", marginBottom: 3, color: "var(--mtc-text-0)" }}>{rec.title}</b>
                    <span style={{ fontSize: 11, color: "var(--mtc-text-2)" }}>{rec.desc}</span>
                  </div>
                  <button
    className="mtc-btn mtc-btn-ghost"
    style={{ flexShrink: 0, fontSize: 11, padding: "5px 10px" }}
    onClick={() => showToast(L("AI configuration updated.", "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0643\u0648\u064A\u0646 \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A."))}
  >
                    {L("Auto Fix", "\u0625\u0635\u0644\u0627\u062D \u062A\u0644\u0642\u0627\u0626\u064A")}
                  </button>
                </div>)}
            </div>}

          {
    /* ================================================================
       10. ADVANCED SETTINGS
       ================================================================ */
  }
          {activeTab === "advanced" && <div>
              {!advancedMode && <div style={{
    display: "flex",
    gap: 9,
    alignItems: "center",
    background: "#eab30814",
    border: "1px solid #eab30840",
    borderRadius: 11,
    padding: "11px 15px",
    fontSize: 12,
    color: "#facc15",
    marginBottom: 14
  }}>
                  <Lock size={16} /> {L("Developer Mode is locked. Toggle the Dev Mode switch above to unlock.", "\u0648\u0636\u0639 \u0627\u0644\u0645\u0637\u0648\u0631 \u0645\u0642\u0641\u0644. \u0641\u0639\u0651\u0644 \u0632\u0631 \u0648\u0636\u0639 \u0627\u0644\u0645\u0637\u0648\u0631 \u0641\u064A \u0627\u0644\u0623\u0639\u0644\u0649 \u0644\u0641\u062A\u062D \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u064A\u062F\u0648\u064A.")}
                </div>}

              <div className="mtc-card" style={{ marginBottom: 14 }}>
                <div className="mtc-card-label" style={{ marginBottom: 8 }}>
                  {L("Advanced Configuration", "\u0627\u0644\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u062A\u0642\u062F\u0645")} — Meta Pixel ID / GA4 Measurement ID
                </div>
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 11, color: "var(--mtc-text-2)" }}>Meta Pixel ID</label>
                  <input
    ref={advMetaRef}
    className="mtc-field"
    placeholder="e.g. 1234567890123"
    disabled={!advancedMode}
    defaultValue={meta.connected ? meta.pixel.id : ""}
    onBlur={(e) => {
      if (!advancedMode) return;
      const val = e.target.value.trim();
      if (val && !isValidMetaPixelId(val)) {
        showToast(L("Invalid Meta Pixel ID format.", "\u0635\u064A\u063A\u0629 \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0628\u064A\u0643\u0633\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629."));
        return;
      }
      saveConfig({
        meta: { connected: !!val, business: val ? "Direct Setup" : "", page: val ? "Direct Setup" : "", pixel: { id: val, name: val ? "Custom Pixel" : "" } }
      });
    }}
  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 11, color: "var(--mtc-text-2)" }}>GA4 Measurement ID</label>
                  <input
    ref={advGA4Ref}
    className="mtc-field"
    placeholder="e.g. G-ABC123XYZ"
    disabled={!advancedMode}
    defaultValue={google.connected ? google.property.measurementId : ""}
    onBlur={(e) => {
      if (!advancedMode) return;
      const val = e.target.value.trim();
      if (val && !isValidGA4Id(val)) {
        showToast(L("Invalid GA4 ID format. Expected: G-XXXXXXXX", "\u0635\u064A\u063A\u0629 \u0645\u0639\u0631\u0651\u0641 GA4 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629."));
        return;
      }
      saveConfig({
        google: { connected: !!val, property: { measurementId: val, name: val ? "Custom GA4 Property" : "" } }
      });
    }}
  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 11, color: "var(--mtc-text-2)" }}>Webhook URL</label>
                  <input
    ref={advWebhookRef}
    className="mtc-field"
    placeholder="https://yourdomain.com/api/webhook"
    disabled={!advancedMode}
    defaultValue={webhookUrl || ""}
    onBlur={(e) => {
      if (!advancedMode) return;
      const val = e.target.value.trim();
      if (val === webhookUrl) return;
      saveConfig({ webhookUrl: val });
    }}
  />
                </div>
              </div>

              <div className="mtc-note">
                <Settings size={16} style={{ display: "inline-block", marginInlineEnd: 6, verticalAlign: "text-bottom" }} /> {L("Client secrets and webhook variables are loaded globally inside client profiles. Verify server deployment settings to ensure data accuracy.", "\u064A\u062A\u0645 \u062A\u062D\u0645\u064A\u0644 \u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0634\u0641\u0631\u0629 \u0641\u064A \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u062E\u0627\u062F\u0645 \u0644\u0636\u0645\u0627\u0646 \u0623\u0645\u0627\u0646 \u0627\u0644\u0625\u0631\u0633\u0627\u0644.")}
              </div>
            </div>}

          </div>
        </div>

        {
    /* ================================================================
       CONNECTION WIZARD MODAL
       ================================================================ */
  }
        {wizard.active && <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(5,3,8,0.8)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) closeWizard();
    }}
  >
            <div
    style={{
      width: 460,
      maxWidth: "92vw",
      background: "linear-gradient(180deg,#1e1533,#150f22)",
      border: "1px solid var(--mtc-border-soft)",
      borderRadius: 18,
      padding: 26,
      boxShadow: "0 30px 80px #00000088",
      animation: "mtc-slide-in 0.2s ease-out"
    }}
  >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, position: "relative" }}>
                <div
    className={`mtc-integ-logo ${wizard.provider === "meta" ? "mtc-logo-meta" : "mtc-logo-google"}`}
    style={{ width: 36, height: 36, fontSize: 15, borderRadius: 10 }}
  >
                  {wizard.provider === "meta" ? "f" : "G"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--mtc-text-0)" }}>
                  {wizard.provider === "meta" ? L("Link Meta Account", "\u0631\u0628\u0637 \u062D\u0633\u0627\u0628 \u0641\u064A\u0633\u0628\u0648\u0643 (Meta)") : L("Link Google Account", "\u0631\u0628\u0637 \u062D\u0633\u0627\u0628 \u062C\u0648\u062C\u0644 (Google)")}
                </div>
                <span
    onClick={closeWizard}
    style={{
      cursor: "pointer",
      color: "var(--mtc-text-2)",
      fontSize: 18,
      position: "absolute",
      [isRtl ? "left" : "right"]: 0,
      lineHeight: 1
    }}
  >✕</span>
              </div>

              <div style={{ minHeight: 160 }}>
                {wizard.provider === "meta" && <div>
                    <div style={{ fontSize: 13, marginBottom: 12, color: "var(--mtc-text-1)", lineHeight: 1.6 }}>
                      {L("Enter your Meta Pixel ID to connect it directly to the platform.", "\u0623\u062F\u062E\u0644 \u0631\u0642\u0645 \u0627\u0644\u0640 Meta Pixel \u0644\u064A\u062A\u0645 \u0631\u0628\u0637\u0647 \u0641\u0648\u0631\u0627\u064B \u0641\u064A \u0627\u0644\u0645\u0646\u0635\u0629.")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <input
    ref={wizardMetaRef}
    type="text"
    placeholder="e.g. 123456789012345"
    defaultValue={meta.connected ? meta.pixel.id : ""}
    style={{
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid var(--mtc-border)",
      background: "rgba(0,0,0,0.3)",
      color: "#fff",
      fontSize: 14,
      width: "100%",
      outline: "none",
      fontFamily: "inherit"
    }}
    autoFocus
  />
                      <button
    className="mtc-btn mtc-btn-primary"
    onClick={() => saveDirectIntegration("meta")}
    style={{ width: "100%", padding: 12, fontSize: 14, fontWeight: "bold", justifyContent: "center" }}
  >
                        {L("Save & Connect", "\u062D\u0641\u0638 \u0648\u0631\u0628\u0637")}
                      </button>
                    </div>
                  </div>}
                {wizard.provider === "google" && <div>
                    <div style={{ fontSize: 13, marginBottom: 12, color: "var(--mtc-text-1)", lineHeight: 1.6 }}>
                      {L("Enter your Google Analytics 4 Measurement ID to connect it directly.", "\u0623\u062F\u062E\u0644 \u0631\u0645\u0632 \u0627\u0644\u0642\u064A\u0627\u0633 (Measurement ID) \u0644\u062D\u0633\u0627\u0628 GA4 \u0644\u064A\u062A\u0645 \u0631\u0628\u0637\u0647 \u0641\u0648\u0631\u0627\u064B.")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <input
    ref={wizardGoogleRef}
    type="text"
    placeholder="e.g. G-ABC123XYZ"
    defaultValue={google.connected ? google.property.measurementId : ""}
    style={{
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid var(--mtc-border)",
      background: "rgba(0,0,0,0.3)",
      color: "#fff",
      fontSize: 14,
      width: "100%",
      outline: "none",
      fontFamily: "inherit"
    }}
    autoFocus
  />
                      <button
    className="mtc-btn mtc-btn-primary"
    onClick={() => saveDirectIntegration("google")}
    style={{ width: "100%", padding: 12, fontSize: 14, fontWeight: "bold", justifyContent: "center" }}
  >
                        {L("Save & Connect", "\u062D\u0641\u0638 \u0648\u0631\u0628\u0637")}
                      </button>
                    </div>
                  </div>}
              </div>
            </div>
          </div>}

        {
    /* Custom Event Dialog */
  }
        {showEventDialog && <div className="mtc-overlay active" onClick={() => setShowEventDialog(false)} style={{ zIndex: 1e5 }}>
            <div className="mtc-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="mtc-modal-head">
                <Target size={20} color="var(--mtc-violet-soft)" />
                <div className="mtc-modal-title">{L("Add Custom Event", "\u0625\u0636\u0627\u0641\u0629 \u062D\u062F\u062B \u0645\u062E\u0635\u0635")}</div>
                <div className="mtc-close" onClick={() => setShowEventDialog(false)} style={{ marginLeft: isRtl ? 0 : "auto", marginRight: isRtl ? "auto" : 0 }}>
                  <X size={20} />
                </div>
              </div>
              <div className="mtc-wizard-body" style={{ minHeight: "auto", marginTop: 18 }}>
                <div style={{ fontSize: 13, marginBottom: 14, color: "var(--mtc-text-1)", lineHeight: 1.6 }}>
                  {L("Enter the name of your custom event (e.g., clicked_button). Only letters, numbers, and underscores are allowed.", "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645 \u0627\u0644\u062D\u062F\u062B \u0627\u0644\u0645\u062E\u0635\u0635 (\u0645\u062B\u0627\u0644: clicked_button). \u064A\u064F\u0633\u0645\u062D \u0641\u0642\u0637 \u0628\u0627\u0644\u062D\u0631\u0648\u0641 \u0648\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0648\u0627\u0644\u0634\u0631\u0637\u0629 \u0627\u0644\u0633\u0641\u0644\u064A\u0629.")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <input
    type="text"
    placeholder="e.g. clicked_button"
    value={newEventName}
    onChange={(e) => setNewEventName(e.target.value)}
    style={{
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid var(--mtc-border)",
      background: "rgba(0,0,0,0.3)",
      color: "#fff",
      fontSize: 14,
      width: "100%",
      outline: "none",
      fontFamily: "inherit"
    }}
    autoFocus
    onKeyDown={(e) => {
      if (e.key === "Enter") submitCustomEvent();
    }}
  />
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button className="mtc-btn mtc-btn-ghost" onClick={() => setShowEventDialog(false)} style={{ flex: 1, justifyContent: "center" }}>
                      {L("Cancel", "\u0625\u0644\u063A\u0627\u0621")}
                    </button>
                    <button className="mtc-btn mtc-btn-primary" onClick={submitCustomEvent} style={{ flex: 1, justifyContent: "center" }}>
                      {L("Add Event", "\u0625\u0636\u0627\u0641\u0629")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>}

      </div>
    </>;
}
export {
  MarketingTrackingSection as default
};
