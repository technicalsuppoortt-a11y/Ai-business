# AI-Business Platform (GigSniper Tools)

A multi-tenant, white-labeled, and multilingual SaaS application designed to help digital entrepreneurs, agencies, and freelancers launch, manage, and automate their AI-powered freelancing and consulting businesses. The platform offers a complete suite of AI tools, custom branding capabilities, and a multi-level role system with full support for both Arabic (RTL) and English (LTR) locales.

---

## 🚀 Key Features

*   **Three-Portal Hierarchy:** 
    *   **User Portal:** Access to 40+ interactive AI tools for brand generation, Upwork proposal writing, marketing strategies, pricing matrices, and sales scripts.
    *   **Admin Portal:** Whitelabel configuration allowing tenant admins to define custom branding, landing pages, menus, pricing, contact links, and default languages.
    *   **Super Admin Portal:** Master system controls for platform managers to manage registered brands, configure general settings, add employees, and monitor platform metrics.
*   **Dynamic Whitelabeling & Theme Engine:** Reads configuration dynamically from Firestore and applies variables (accent colors, backgrounds, font family, border radius, languages) straight to CSS custom properties (`:root`) at runtime.
*   **Dual-Language Engine:** Full structural support for English (LTR) and Arabic (RTL) layouts, dynamically switching UI layout flow and template defaults.
*   **AI Service Pipeline:** Integrated with Google Gemini API (`gemini-2.0-flash`) using user-provided API keys to generate tailored, context-aware proposals, profiles, contracts, and marketing calendars.
*   **Real-time Synchronization & Seeding:** State is managed via React Context and reducer actions, saved to Firestore via a debounced synchronizer, and populated by a modular Firestore database seeding utility.

---

## 🛠️ Tech Stack & Dependencies

*   **Frontend Framework:** React (v19)
*   **Build System & Bundler:** Vite (v8)
*   **Routing:** React Router DOM (v7) — manages nested, role-protected routes.
*   **Database & Auth:** Google Firebase (Auth, Firestore, Storage)
*   **Icons & Visuals:** Lucide React (vector icon library)
*   **Animations:** Canvas Confetti (UX delight effects)
*   **AI Model:** Google Gemini API (`gemini-2.0-flash` model for intelligent text output)

---

## 📂 Project & Folder Structure

Below is the directory tree of the key source files and folders, excluding build files and external dependencies:

```markdown
Ai-business/
├── public/                       # Static public assets (logos, images, and HTML files)
├── src/
│   ├── assets/                   # Local fonts, brand icons, and styles
│   ├── components/
│   │   ├── common/               # Shared components (e.g., PlatformExplanation.jsx)
│   │   ├── layout/               # App layout frameworks (Sidebar, Topbar, DashboardLayout)
│   │   └── ProtectedRoute.jsx    # Role-based route guard for portal security
│   ├── context/
│   │   ├── AppContext.jsx        # Reducer-based global state synced automatically with Firestore
│   │   ├── AuthContext.jsx       # Multi-Auth instance listener for User/Admin/SuperAdmin sessions
│   │   └── ToastContext.jsx      # Global system notification/toast state
│   ├── data/                     # Local fallback datasets (niches, freelance templates, static lists)
│   ├── pages/
│   │   ├── Admin/                # Tenant Admin dashboards (Sales, Library, Theme Editor)
│   │   ├── SuperAdmin/           # Master dashboards (Tenant Manager, Landing Pages, Staff lists)
│   │   ├── Tools/                # Freelance tools suite (Niche Picker, Brand Naming, Profit Calculator, Website Constructor, etc.)
│   │   │   └── components/       # 40+ modular AI tool implementations
│   │   ├── Landing/              # Multilingual landing pages and brand templates
│   │   ├── Auth/                 # Independent login pages for each portal role
│   │   └── Onboarding/           # Guided setup sequence for new freelance profiles
│   ├── services/
│   │   ├── geminiService.js      # Gemini-2.0-flash API integration layer with template builders
│   │   ├── contentDbService.js   # DB helpers for tools and workspace states
│   │   ├── seedRunner.js         # Entry point for executing Firestore seeding pipelines
│   │   └── seedPart[1-18]...     # Modular Firestore seeding scripts (Part 1 - Part 18)
│   ├── utils/
│   │   └── templateParser.js     # Parses layout structure and variables
│   ├── App.jsx                   # Central routing layout & dynamic theme injector
│   ├── index.css                 # Base stylesheet containing core CSS variables and layouts
│   ├── main.jsx                  # React DOM startup entry point
│   └── firebase.js               # Firebase configuration and Multi-App initialization
├── firebase.json                 # Firebase Hosting/Firestore configurations
├── vite.config.js                # Vite build and plugin configuration
├── package.json                  # Node.js dependencies, metadata, and build scripts
├── export_db.mjs                 # Script to export Firestore collections to local JSON
└── patch.py                      # Developer patching utility for codebase edits
```

---

## 🏛️ Core Architecture & Data Flow

### 🔐 1. Multi-Auth Isolation
To allow administrators to be logged in simultaneously as a customer (User), a tenant administrator (Admin), and a master administrator (Super Admin) on the same domain without session collisions, the app instantiates three independent Firebase Apps:
```javascript
// src/firebase.js
const app = initializeApp(firebaseConfig);
const adminApp = initializeApp(firebaseConfig, 'admin-portal');
const superAdminApp = initializeApp(firebaseConfig, 'superadmin-portal');

export const auth = getAuth(app);
export const adminAuth = getAuth(adminApp);
export const superAdminAuth = getAuth(superAdminApp);
```
`AuthContext.jsx` listens to all three authentication state streams and exports active roles and session variables (`user`, `adminUser`, `superAdminUser`).

### 🎨 2. Dynamic White-Labeling Theme Engine
In `App.jsx`, a `useEffect` hook watches the user's role and brand properties. When loaded, it applies color codes, layout settings, and font weights dynamically to the `:root` element CSS:
```javascript
const theme = brandData?.themeConfig || adminUserData?.themeConfig || superAdminUserData?.themeConfig;
if (theme) {
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--bg2', theme.sidebar);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--font-family', `"${theme.font}", sans-serif`);
}
```

### 💾 3. State Management & Real-time Sync
*   **Reducer Actions:** Standard actions (`SET_USER`, `SET_FIELD`, `ADD_SKILL`, `SAVE_TOOL_RESULT`) update `state` inside `AppContext.jsx`.
*   **State Hydration:** When a user logs in, the app pulls the document from `users/${uid}` and populates the local state with `appState`.
*   **Debounced Cloud Saving:** A `useEffect` hook watches the local state. On modification, it runs a debounced 1-second task saving the serialized state back to `users/${uid}` in Firestore.

### 🤖 4. AI Gemini Pipeline
UI tools invoke services in `geminiService.js`. The logic builds specialized prompt templates mapping details (niche, client demands, skills, custom instructions) and appends a critical instruction:
`[CRITICAL INSTRUCTION: You MUST generate the final response entirely in Arabic/English.]`
The prompt is dispatched via `fetch` to Google's API, returning structured Markdown or JSON to be displayed on the page.

---

## 🚀 Setup & Execution

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Installation
Clone the repository and install the dependencies:
```powershell
npm install
```

### 2. Running Locally (Development Mode)
To start the Vite local development server:
```powershell
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 3. Production Build
To bundle the application for production deployment:
```powershell
npm run build
```
The output files will be created in the `dist/` directory, ready to be deployed to Firebase Hosting or any static server.

### 4. Preview the Build
To preview the production build locally before deploying:
```powershell
npm run preview
```

### 5. Seeding Firestore Database
To seed the Firestore database with default platform configurations, niches, and template guidelines:
1. Log in to the **Admin** or **Super Admin** portal.
2. Navigate to the database / seeder controls section.
3. Choose the seed modules you wish to load (e.g. Niche Analysis, Platform Strategies, Content Plans) and click **Run Seeder**. The underlying script in `src/services/seedRunner.js` will populate the Firestore tables.
