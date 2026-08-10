// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { StateProvider, useAppState } from "./context/StateContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PublicBooking from "./pages/PublicBooking";
import RulesPage from "./pages/RulesPage";
import LoadingScreen from "./components/LoadingScreen"; // ← Import the new loading component
import { type ReactNode } from "react";

// Protected Route Wrapper using Firebase Auth State
function Protected({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { loading: stateLoading } = useAppState();

  if (authLoading || stateLoading) {
    return <LoadingScreen />; // ← Use professional loading screen
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Redirect if already authenticated
function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />; // ← Use professional loading screen
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <StateProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/login"
                element={
                  <GuestOnly>
                    <Login />
                  </GuestOnly>
                }
              />
              <Route
                path="/home"
                element={
                  <Protected>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Protected>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/rules"
                element={
                  <Protected>
                    <RulesPage />
                  </Protected>
                }
              />
              <Route
                path="/affiliate-rules"
                element={
                  <Protected>
                    <RulesPage />
                  </Protected>
                }
              />
              <Route path="/book/:calendarId" element={<PublicBooking />} />
              <Route path="/book/:userId/:calendarId" element={<PublicBooking />} />
              <Route path="/preview/:calendarId" element={<PublicBooking />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </StateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
