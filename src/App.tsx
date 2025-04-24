
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ViewLeads from "@/pages/ViewLeads";
import AddLead from "@/pages/AddLead";
import EditLead from "@/pages/EditLead";
import ClosedDeals from "@/pages/ClosedDeals";
import Reports from "@/pages/Reports";
import TeamManagement from "@/pages/TeamManagement";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leads" element={<ViewLeads />} />
                <Route path="/leads/new" element={<AddLead />} />
                <Route path="/leads/edit/:id" element={<EditLead />} />
                <Route path="/closed-deals" element={<ClosedDeals />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/team-management" element={<TeamManagement />} />
              </Route>
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
