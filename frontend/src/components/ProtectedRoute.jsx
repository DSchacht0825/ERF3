import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isAuthenticated }) {
  // Check if user is authenticated
  const authToken = localStorage.getItem('erf3_authenticated');
  const authTime = localStorage.getItem('erf3_auth_time');

  // Check if authentication is valid (within 24 hours)
  const isValid = authToken === 'true' && authTime &&
    (new Date().getTime() - parseInt(authTime)) < 24 * 60 * 60 * 1000;

  if (!isValid) {
    // Clear invalid auth
    localStorage.removeItem('erf3_authenticated');
    localStorage.removeItem('erf3_auth_time');

    // Redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
