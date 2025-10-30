import { useParams } from "react-router-dom";
import { getApartmentBuildingIdFromToken } from "../utils/token";

export const useApartmentBuildingId = (): string | null => {
  const params = useParams<{ apartmentBuildingId?: string }>();
  
  if (params.apartmentBuildingId) {
    return params.apartmentBuildingId;
  }
  
  return getApartmentBuildingIdFromToken();
};

