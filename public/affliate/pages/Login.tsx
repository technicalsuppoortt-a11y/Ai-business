import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Handshake,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
  }, []);

  // --- Typewriter state ---
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedSub, setDisplayedSub] = useState("");
  const [showPartner, setShowPartner] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  const titlePrefix = "Welcome back,";
  const titleHighlight = "partner.";
  const descriptionText =
    "Your command center for referrals, analytics, and growth – built to help you succeed in every partnership.";

  useEffect(() => {
    // 1. Type the prefix "Welcome back,"
    let index = 0;
    const prefixTimer = setInterval(() => {
      if (index <= titlePrefix.length) {
        setDisplayedTitle(titlePrefix.slice(0, index));
        index++;
      } else {
        clearInterval(prefixTimer);
        // 2. Show "partner." with a fade-in after a short pause
        setTimeout(() => {
          setShowPartner(true);
        }, 300);
        // 3. Start typing the description after partner appears
        setTimeout(() => {
          let descIndex = 0;
          const descTimer = setInterval(() => {
            if (descIndex <= descriptionText.length) {
              setDisplayedSub(descriptionText.slice(0, descIndex));
              descIndex++;
            } else {
              clearInterval(descTimer);
              // 4. Show features and footer with a fade
              setTimeout(() => {
                setShowFeatures(true);
              }, 400);
              setTimeout(() => {
                setShowFooter(true);
              }, 600);
            }
          }, 30);
          // store descTimer to clean up
          return () => clearInterval(descTimer);
        }, 1200);
      }
    }, 40);

    return () => {
      clearInterval(prefixTimer);
    };
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      // Error toast is already triggered inside signIn
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Visual panel – with typewriter effect */}
        <div
          className="relative hidden overflow-hidden lg:block"
          style={{ backgroundColor: "#07090e" }}
        >
          {/* Animated gradient orbs mapped to new premium values */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(5,189,145,0.12),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(3,195,168,0.08),transparent_50%),radial-gradient(circle_at_50%_100%,rgba(2,142,193,0.08),transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

          {/* Floating decorative elements aligned with verified palette */}
          <div
            className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl animate-pulse"
            style={{ backgroundColor: "rgba(5,189,145,0.15)" }}
          />
          <div
            className="absolute bottom-1/3 right-10 h-80 w-80 rounded-full blur-3xl animate-pulse delay-1000"
            style={{ backgroundColor: "rgba(3,195,168,0.1)" }}
          />
          <div
            className="absolute top-2/3 left-10 h-56 w-56 rounded-full blur-3xl animate-pulse delay-2000"
            style={{ backgroundColor: "rgba(2,142,193,0.08)" }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/5 shadow-lg">
                <Handshake className="h-5.5 w-5.5" style={{ color: "var(--green)" }} />
              </div>
              <span className="text-xl font-semibold tracking-tight">Joe-Partner</span>
            </div>

            {/* Central content – typewriter area */}
            <div className="space-y-8 max-w-lg">
              <div className="space-y-2">
                <h1 className="text-5xl font-bold leading-tight tracking-tight">
                  {/* Display the prefix character by character */}
                  <span>{displayedTitle}</span>
                  {/* Cursor for the prefix */}
                  {displayedTitle.length < titlePrefix.length && (
                    <span
                      className="inline-block w-0.5 h-8 animate-pulse ml-1"
                      style={{ backgroundColor: "var(--green)" }}
                    />
                  )}
                  {/* Show "partner." with a smooth fade-in using verified 120deg gradient stop tokens */}
                  {showPartner && (
                    <span className="bg-gradient-to-r from-[#05bd91] via-[#03c3a8] to-[#028ec1] bg-clip-text text-transparent transition-opacity duration-1000 opacity-100">
                      &nbsp;{titleHighlight}
                    </span>
                  )}
                </h1>
                <p className="mt-4 text-base text-slate-350 leading-relaxed max-w-md min-h-[4.5rem]">
                  {displayedSub}
                  {displayedSub.length < descriptionText.length && (
                    <span
                      className="inline-block w-0.5 h-5 animate-pulse ml-1"
                      style={{ backgroundColor: "var(--green)" }}
                    />
                  )}
                </p>
              </div>

              {/* Decorative divider */}
              <div className="flex items-center gap-3 text-slate-400/60">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />
                <div className="flex gap-4">
                  <Sparkles className="h-4 w-4" style={{ color: "var(--green)" }} />
                  <Shield className="h-4 w-4" style={{ color: "var(--green)" }} />
                  <Zap className="h-4 w-4" style={{ color: "var(--green)" }} />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />
              </div>

              {/* Feature list – fades in after description */}
              <div
                className={`space-y-4 text-sm text-slate-300/70 transition-opacity duration-700 ${showFeatures ? "opacity-100" : "opacity-0"}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 rounded-full p-0.5"
                    style={{ backgroundColor: "rgba(5, 189, 145, 0.15)" }}
                  >
                    <Shield className="h-3.5 w-3.5" style={{ color: "var(--green)" }} />
                  </div>
                  <span>Secure & enterprise‑grade infrastructure</span>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 rounded-full p-0.5"
                    style={{ backgroundColor: "rgba(3, 195, 168, 0.15)" }}
                  >
                    <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--green-2)" }} />
                  </div>
                  <span>Real‑time analytics and payout tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 rounded-full p-0.5"
                    style={{ backgroundColor: "rgba(2, 142, 193, 0.15)" }}
                  >
                    <Zap className="h-3.5 w-3.5" style={{ color: "var(--green)" }} />
                  </div>
                  <span>Instant access to your partner dashboard</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`text-xs text-slate-400/60 transition-opacity duration-700 ${showFooter ? "opacity-100" : "opacity-0"}`}
            >
              © {new Date().getFullYear()} Joe-Partner. All rights reserved.
            </div>
          </div>
        </div>

        {/* Form panel – forced global semantic colors mapping */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "var(--txt)", color: "var(--bg)" }}
              >
                <Handshake className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Joe-Partner</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Enter your credentials to access the partner portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[var(--green)] focus:ring-2 focus:ring-[rgba(5,189,145,0.2)] dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus:border-[var(--green)] dark:focus:ring-[rgba(5,189,145,0.2)] ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder="you@company.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-[rgba(5,189,145,0.2)] dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus:border-[var(--green)] dark:focus:ring-[rgba(5,189,145,0.2)] ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Unified brand primary button action wrapper built with new dynamic variables overrides */}
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: "var(--grad)",
                  color: "#03110d",
                  boxShadow: "0 10px 30px -8px rgba(5, 189, 145, 0.55)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Secure partner access · Protected by Joe-Partner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
