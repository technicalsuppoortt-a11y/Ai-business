/**
 * Tracking SDK
 *
 * Safely dispatches events to:
 *  - Meta Pixel (window.fbq)
 *  - Google Analytics GA4 (window.gtag)
 *  - Internal realtime dashboard via CustomEvent 'upklick_track'
 *
 * All calls are no-ops when the respective pixel hasn't been loaded yet.
 */

// ---------------------------------------------------------------------------
// Internal helper: notify the dashboard realtime log panel
// ---------------------------------------------------------------------------
const notifyDashboard = (eventName, payload = {}) => {
  if (typeof window === "undefined") return;
  const event = new CustomEvent("upklick_track", {
    detail: {
      event: eventName,
      payload,
      time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    },
  });
  window.dispatchEvent(event);
};

// ---------------------------------------------------------------------------
// Public Tracking API
// ---------------------------------------------------------------------------
export const Tracking = {
  /** Track a standard page view */
  page: (path) => {
    if (typeof window === "undefined") return;
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", path ? { page_path: path } : {});
    }
    notifyDashboard("Page View", path ? { path } : {});
  },

  /** Track a new lead capture / signup */
  lead: (payload = {}) => {
    if (typeof window === "undefined") return;
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", payload);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", payload);
    }
    notifyDashboard("Lead", payload);
  },

  /** Track a scheduled meeting / booking */
  bookMeeting: (payload = {}) => {
    if (typeof window === "undefined") return;
    if (typeof window.fbq === "function") {
      window.fbq("track", "Schedule", payload);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "book_meeting", payload);
    }
    notifyDashboard("Book Meeting", payload);
  },

  /**
   * Track a purchase event
   * @param value  The purchase amount
   * @param currency  Currency code (e.g. "USD")
   */
  purchase: (value, currency = "USD", payload = {}) => {
    if (typeof window === "undefined") return;
    const data = { value, currency, ...payload };
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", data);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", data);
    }
    notifyDashboard("Purchase", data);
  },

  /** Identify / associate a user context */
  identify: (userId, traits = {}) => {
    if (typeof window === "undefined") return;
    if (typeof window.gtag === "function") {
      window.gtag("set", "user_properties", { user_id: userId, ...traits });
    }
    notifyDashboard("Identify User", { userId, ...traits });
  },

  /** Generic custom event tracker */
  track: (eventName, payload = {}) => {
    if (typeof window === "undefined") return;
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, payload);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    }
    notifyDashboard(eventName, payload);
  },

  /** Alias for custom event tracking */
  custom: (eventName, payload = {}) => {
    if (typeof window === "undefined") return;
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, payload);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    }
    notifyDashboard(eventName, payload);
  },
};
