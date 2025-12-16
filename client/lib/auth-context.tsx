import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "@shared/api";
import { apiClient } from "./api-client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check server health
        try {
          await apiClient.healthCheck();
        } catch (error) {
          console.warn("Server health check failed:", error);
        }

        if (apiClient.isAuthenticated()) {
          const profile = await apiClient.getProfile();
          setUser(profile);
        }
      } catch (error: any) {
        console.error("Failed to load user profile:", error?.message);
        apiClient.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    apiClient.setToken(response.token);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const response = await apiClient.register({
      name,
      email,
      password,
      role: role as "doctor" | "patient" | "admin",
    });
    apiClient.setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
