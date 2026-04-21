import { Navigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RegisterForm />;
}
