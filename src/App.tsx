
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import ViewLeads from '@/pages/ViewLeads';
import AddLead from '@/pages/AddLead';
import EditLead from '@/pages/EditLead';
import ViewLeadDetails from '@/pages/ViewLeadDetails';
import ClosedDeals from '@/pages/ClosedDeals';
import Reports from '@/pages/Reports';
import NotFound from '@/pages/NotFound';
import TeamManagement from '@/pages/TeamManagement';
import { Toaster } from '@/components/ui/toaster';
import '@/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<ViewLeads />} />
            <Route path="/leads/new" element={<AddLead />} />
            <Route path="/leads/edit/:id" element={<EditLead />} />
            <Route path="/leads/view/:id" element={<ViewLeadDetails />} />
            <Route path="/closed-deals" element={<ClosedDeals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/team-management" element={<TeamManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
