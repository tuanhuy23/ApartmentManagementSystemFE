import { tokenStorage } from "./storage";

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getApartmentBuildingIdFromToken(): string | null {
  const token = tokenStorage.getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return (
    payload.ApartmentBuildingId ||
    null
  );
}

// Helper function to get appartmentBuildingId (with 2 'p') for API endpoints
export function getAppartmentBuildingId(): string | null {
  return getApartmentBuildingIdFromToken();
}


