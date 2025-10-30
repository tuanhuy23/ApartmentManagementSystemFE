import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { getApartmentBuildingIdFromToken } from "../utils/token";

interface ApartmentBuildingGuardProps {
  children: React.ReactNode;
}

const ApartmentBuildingGuard: React.FC<ApartmentBuildingGuardProps> = ({ children }) => {
  const { apartmentBuildingId } = useParams<{ apartmentBuildingId?: string }>();
  const tokenApartmentId = getApartmentBuildingIdFromToken();

  if (apartmentBuildingId && tokenApartmentId && apartmentBuildingId !== tokenApartmentId) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default ApartmentBuildingGuard;

