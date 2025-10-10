import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { tokenStorage } from "../utils/storage";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const hasToken = tokenStorage.getToken() !== null;
      const isValid = tokenStorage.isTokenValid();
      
      setIsAuthenticated(hasToken && isValid);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
