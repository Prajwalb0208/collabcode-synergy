
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, getCurrentUser } from "@/services/firebaseService";
import { AuthContextType, User } from "@/types/auth";
import { formatUser } from "@/utils/userUtils";
import { useAuthMethods } from "@/hooks/useAuthMethods";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a default logged-in user
  const defaultUser: User = {
    id: "default-user-id",
    name: "Default User",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    provider: "default"
  };

  const [user, setUser] = useState<User | null>(defaultUser);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, loginWithProvider, logout } = useAuthMethods(setUser, setIsLoading);

  // Always return success for auth methods
  const alwaysSuccessLogin = async () => {
    console.log("Auto login success");
    return true;
  };

  const alwaysSuccessRegister = async () => {
    console.log("Auto register success");
    return true;
  };

  const alwaysSuccessLoginWithProvider = async () => {
    console.log("Auto provider login success");
    return true;
  };

  const alwaysSuccessLogout = () => {
    console.log("Logout attempted but user remains logged in");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login: alwaysSuccessLogin, 
        register: alwaysSuccessRegister, 
        loginWithProvider: alwaysSuccessLoginWithProvider, 
        logout: alwaysSuccessLogout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
