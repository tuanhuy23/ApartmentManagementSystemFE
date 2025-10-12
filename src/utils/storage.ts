export const storage = {
    set: (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key: string) => {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    },
    remove: (key: string) => localStorage.removeItem(key),
  };

export const tokenStorage = {
  setToken: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },
  
  removeToken: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  
  isTokenValid: (): boolean => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) return false;
    
    return true;
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },
  
  hasRefreshToken: (): boolean => {
    return localStorage.getItem("refreshToken") !== null;
  }
};