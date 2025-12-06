import React, { createContext, useState, useEffect } from "react";
import { accountApi } from "../api/accountApi";
import { tokenStorage } from "../utils/storage";
import type { AccountInfoResponseDto } from "../types/user";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccountInfoResponseDto | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AccountInfoResponseDto | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = tokenStorage.getToken();
      
      if (!hasToken || !tokenStorage.isTokenValid()) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await accountApi.getAccount();
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          tokenStorage.removeToken();
          setIsAuthenticated(false);
          window.location.href = "/login";
        }
      } catch {
        tokenStorage.removeToken();
        setIsAuthenticated(false);
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    (async () => {
      try {
        const response = await accountApi.getAccount();
        if (response.data) {
          setUser(response.data);
        }
      } catch {
      }
    })();
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

