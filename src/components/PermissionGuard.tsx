import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string | null;
  action: "Read" | "ReadWrite" | "ReadRetrict";
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children, permission, action }) => {
  const { user } = useAuth();

  if (permission === null) {
    return <>{children}</>;
  }

  if (!user || !user.permissions || user.permissions.length === 0) {
    return <Navigate to="/403" replace />;
  }

  const hasPermission = 
    user.permissions.includes(`${permission}.${action}`);

  if (!hasPermission) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default PermissionGuard;

