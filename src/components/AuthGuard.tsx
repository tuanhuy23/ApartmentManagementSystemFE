import React from "react";
import { Navigate } from "react-router-dom";
import { tokenStorage } from "../utils/storage";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const hasToken = tokenStorage.getToken();
  const isValid = tokenStorage.isTokenValid();

  if (!hasToken || !isValid) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
