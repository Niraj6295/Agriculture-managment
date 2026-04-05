import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CropsPage from './pages/CropsPage';
import SoilPage from './pages/SoilPage';
import WeatherPage from './pages/WeatherPage';
import IrrigationPage from './pages/IrrigationPage';
import AlertsPage from './pages/AlertsPage';
import AIChatPage from './pages/AIChatPage';
import DiseasePage from './pages/DiseasePage';
import AdminPage from './pages/AdminPage';
import ExpertPage from './pages/ExpertPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import MapPage from './pages/MapPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/shared/Layout';

// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="crops" element={<CropsPage />} />
      <Route path="soil" element={<SoilPage />} />
      <Route path="weather" element={<WeatherPage />} />
      <Route path="irrigation" element={<IrrigationPage />} />
      <Route path="alerts" element={<AlertsPage />} />
      <Route path="ai-chat" element={<AIChatPage />} />
      <Route path="disease-detect" element={<DiseasePage />} />
      <Route path="map" element={<MapPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
      <Route path="expert" element={<ProtectedRoute roles={['expert', 'admin']}><ExpertPage /></ProtectedRoute>} />
    </Route>
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
