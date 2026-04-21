import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthProvider from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import NewReportPage from './pages/NewReportPage';
import RegisterPage from './pages/RegisterPage';
import ReportDetailPage from './pages/ReportDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports/new" element={<NewReportPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
