import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Guards admin-only routes — visitors bounce back to the home page. */
export default function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
