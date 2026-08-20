import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Guards admin-only routes — visitors bounce to the login page. */
export default function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
