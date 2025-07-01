import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status when component mounts or updates
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Save the current location to redirect back after login
      navigate('/login', { 
        replace: true, 
        state: { from: location.pathname } 
      });
    }
  }, [isAuthenticated, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;