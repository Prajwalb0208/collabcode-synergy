
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, getCurrentUser } from "@/services/firebaseService";
import { onAuthStateChanged } from "firebase/auth";
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
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our User type
        const formattedUser = formatUser(firebaseUser);
        setUser(formattedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

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
