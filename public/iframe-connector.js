/**
 * AI Brand Vision — iframe Connector Script
 * ==========================================
 * Add this script ONCE to your website (any page containing the iframe).
 * It automatically tells the iframe the FULL page URL (including path),
 * so it can load YOUR specific plans and settings from the database.
 *
 * IMPORTANT: Each page URL maps to a different brand.
 * Example:  https://upklick.co/ai-brand-vision-page  →  Brand A
 *           https://upklick.co/sport                  →  Brand B
 *
 * Usage: <script src="https://digital-product-3a97c.web.app/iframe-connector.js"></script>
 */
(function () {
  window.addEventListener('message', function (event) {
    // Only respond to requests from our iframe app
    if (
      event.data &&
      event.data.type === 'REQUEST_PARENT_URL' &&
      event.source
    ) {
      try {
        // Send the FULL URL with path (not just origin)
        // e.g.  https://upklick.co/ai-brand-vision-page
        event.source.postMessage(
          {
            type: 'PARENT_URL',
            url: window.location.href.replace(/\/+$/, '') // strip trailing slash
          },
          event.origin || '*'
        );
      } catch (e) {}
    }
  });
})();
