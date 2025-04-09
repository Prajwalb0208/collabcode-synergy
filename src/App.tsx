
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoomHistoryProvider } from "@/contexts/RoomHistoryContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Room from "./pages/Room";
import Rooms from "./pages/Rooms";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RoomHistoryProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/room/:roomId" element={
                  <ProtectedRoute>
                    <Room />
                  </ProtectedRoute>
                } />
                <Route path="/new-room" element={
                  <ProtectedRoute>
                    <Room />
                  </ProtectedRoute>
                } />
                <Route path="/rooms" element={
                  <ProtectedRoute>
                    <Rooms />
                  </ProtectedRoute>
                } />
                
                <Route path="/docs" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </RoomHistoryProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
