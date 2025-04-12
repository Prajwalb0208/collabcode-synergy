
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { login, register, loginWithProvider, logout } = useAuthMethods(setUser, setIsLoading);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const firebaseUser = await getCurrentUser();
        if (firebaseUser) {
          const formattedUser = formatUser(firebaseUser);
          setUser(formattedUser);
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        const formattedUser = formatUser(firebaseUser);
        setUser(formattedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithProvider, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
