import './global.css';

import { Toaster } from '@/components/ui/toaster';
import { createRoot } from 'react-dom/client';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth-context';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';

// Pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Records from './pages/Records';
import Predict from './pages/Predict';
import Predict3d from './pages/Predict3d';
import Unauthorized from './pages/Unauthorized';
import LabPortal from './pages/LabPortal';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* ── Public ─────────────────────────────────────── */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* ── All authenticated users ────────────────────── */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/chat" element={
                  <ProtectedRoute permission="USE_CHAT">
                    <Chat />
                  </ProtectedRoute>
                } />

                <Route path="/predict" element={
                  <ProtectedRoute permission="PREDICT_2D">
                    <Predict />
                  </ProtectedRoute>
                } />

                {/* ── Doctor + Admin only ────────────────────────── */}
                <Route path="/predict3d" element={
                  <ProtectedRoute permission="PREDICT_3D">
                    <Predict3d />
                  </ProtectedRoute>
                } />

                <Route path="/records" element={
                  <ProtectedRoute permission="VIEW_RECORDS">
                    <Records />
                  </ProtectedRoute>
                } />

                {/* ── Lab / Radiology Center ─────────────────────── */}
                <Route path="/lab" element={
                  <ProtectedRoute permission="SEND_MRI_TO_DOCTOR">
                    <LabPortal />
                  </ProtectedRoute>
                } />

                {/* ── Catch-all ──────────────────────────────────── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById('root')!).render(<App />);
