/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { setAuthToken, usersApi } from "./lib/api";
import { useUserStore } from "./store/userStore";

// Pages
import Landing from "./features/index/Landing";
import Login from "./features/login/Login";
import Onboarding from "./features/onboarding/Onboarding";
import Dashboard from "./features/dashboard/Dashboard";
import Passport from "./features/passport/Passport";
import Quests from "./pages/Quests";
import Leaderboard from "./features/Leaderboard/Leaderboard";
import DashboardLayout from "./components/layouts/dashboard/DashboardLayout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy();
  const { isOnboarded } = useUserStore();

  if (!ready) return <div className="loading">Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy();
  const { isOnboarded } = useUserStore();

  if (!ready) return <div className="loading">Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  if (isOnboarded) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function App() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const { setUser, setLoading, reset } = useUserStore();

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      setAuthToken(null);
      reset();
      return;
    }

    // Get Privy token and sync user with our backend
    async function syncUser() {
      try {
        setLoading(true);
        const token = await getAccessToken();
        setAuthToken(token);

        const response = await usersApi.me();
        setUser(response.data.data);
      } catch (err: any) {
        // 404 means user exists in Privy but not yet in our DB
        // They need to complete onboarding
        if (err.response?.status === 404) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }

    syncUser();
  }, [ready, authenticated, reset, setLoading, getAccessToken, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Login />} />
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          }
        />
        {import.meta.env.DEV && (
          <Route path="/onboarding-dev" element={<Onboarding />} />
        )}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/passport"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Passport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Quests />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Leaderboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
