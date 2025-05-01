
import React, { createContext, useContext, useState } from "react";
import { AuthContextType, User } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simple mock login
    const mockUser: User = {
      id: "mock-user-id",
      name: email.split('@')[0],
      email: email,
    };
    setUser(mockUser);
    setIsLoading(false);
    return true;
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    // Simple mock registration
    const mockUser: User = {
      id: "mock-user-id",
      name: name,
      email: email,
    };
    setUser(mockUser);
    setIsLoading(false);
    return true;
  };

  const loginWithProvider = async (provider: "google" | "github") => {
    setIsLoading(true);
    // Simple mock social login
    const mockUser: User = {
      id: "mock-social-user-id",
      name: `User from ${provider}`,
      email: `user@${provider}.com`,
      provider: provider,
    };
    setUser(mockUser);
    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        register, 
        loginWithProvider, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
