### 🚨 CRITICAL FIX: Resolve `UNAUTHORIZED_DOMAIN` Error in `sendPasswordResetEmail`

Even though `digital-product-3a97c.web.app` is already listed in Firebase Authorized Domains, Firebase Identity Toolkit rejects the reset password request with `UNAUTHORIZED_DOMAIN`.

This happens when `actionCodeSettings.url` is improperly formatted or includes complex dynamic paths that Firebase fails to match against allowed root origins.

Please fix `actionCodeSettings` in `AuthContext.jsx` immediately.

---

### 🛠️ REQUIRED CODE CHANGES:

1. **Clean & Validate `actionCodeSettings.url`**:
   - Ensure the `url` string passed to `sendPasswordResetEmail` matches a clean, strict origin URL explicitly listed in Firebase Console.
   - Update `actionCodeSettings` to use `https://digital-product-3a97c.web.app/auth` directly as a fallback, or clean up `window.location.origin`:

```javascript
// Clean baseline URL for Firebase actionCodeSettings
const baseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '[https://digital-product-3a97c.web.app](https://digital-product-3a97c.web.app)'
  : window.location.origin;

const actionCodeSettings = {
  url: `${baseUrl}/auth`,
  handleCodeInApp: true,
};

await sendPasswordResetEmail(authInstance, cleanEmail, actionCodeSettings);