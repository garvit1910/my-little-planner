import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthCallback } from "@/components/auth/AuthCallback";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HeroDemo from "./pages/HeroDemo";
import Dashboard from "./pages/Dashboard";
import Pomodoro from "./pages/Pomodoro";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
            }}
          />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/demo" element={<HeroDemo />} />
              <Route path="/auth/login" element={<LoginForm />} />
              <Route path="/auth/signup" element={<SignupForm />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/tasks"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/pomodoro"
                element={
                  <ProtectedRoute>
                    <Pomodoro />
                  </ProtectedRoute>
                }
              />
              {/* Placeholder routes for future features */}
              <Route
                path="/app/blocker"
                element={
                  <ProtectedRoute>
                    <ComingSoon feature="Website Blocker" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/reports"
                element={
                  <ProtectedRoute>
                    <ComingSoon feature="AI-Assisted Reports" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/sounds"
                element={
                  <ProtectedRoute>
                    <ComingSoon feature="AI Focus Sounds" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/analytics"
                element={
                  <ProtectedRoute>
                    <ComingSoon feature="AI Analytics & Insight" />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;