export const storage = {
    set: (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key: string) => {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    },
    remove: (key: string) => localStorage.removeItem(key),
  };

export const tokenStorage = {
  setToken: (accessToken: string, refreshToken: string, expireTime?: string, ) => {
    localStorage.setItem("accessToken", accessToken);
    if (expireTime) {
      localStorage.setItem("expireTime", expireTime);
    }
    localStorage.setItem("refreshToken", refreshToken);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },
  
  removeToken: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("expireTime");
    localStorage.removeItem("refreshToken");
  },
  
  isTokenValid: (): boolean => {
    const accessToken = localStorage.getItem("accessToken");
    const expireTime = localStorage.getItem("expireTime");
    
    if (!accessToken) return false;
    
    if (expireTime) {
      const expiryDate = new Date(expireTime);
      return expiryDate > new Date();
    }
    
    return true;
  },
  
  getTokenExpiry: (): Date | null => {
    const expireTime = localStorage.getItem("expireTime");
    return expireTime ? new Date(expireTime) : null;
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },
  
  hasRefreshToken: (): boolean => {
    return localStorage.getItem("refreshToken") !== null;
  }
};