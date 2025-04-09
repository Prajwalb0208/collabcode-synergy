
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  auth, 
  signInWithGoogle, 
  signInWithGithub, 
  signInWithEmail, 
  registerWithEmail, 
  signOutUser, 
  getCurrentUser 
} from "@/services/firebaseService";
import { User as FirebaseUser } from "firebase/auth";
import { FirebaseError } from "firebase/app";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: "google" | "github") => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Get error message from Firebase error code
const getErrorMessage = (error: any): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/email-already-in-use':
        return 'Email is already in use';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/popup-closed-by-user':
        return 'Authentication popup was closed before completion';
      case 'auth/cancelled-popup-request':
        return 'Multiple popup requests were made - please try again';
      case 'auth/popup-blocked':
        return 'Authentication popup was blocked by the browser';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials';
      default:
        return error.message || 'Authentication error';
    }
  }
  return 'An unexpected error occurred';
};

// Convert Firebase user to our User type
const formatUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.uid,
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || undefined,
    provider: firebaseUser.providerData[0]?.providerId || 'email'
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const firebaseUser = await signInWithEmail(email, password);
      const formattedUser = formatUser(firebaseUser);
      setUser(formattedUser);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${formattedUser.name}!`,
      });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const firebaseUser = await registerWithEmail(email, password);
      const formattedUser = formatUser(firebaseUser);
      setUser(formattedUser);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      let firebaseUser;
      
      if (provider === "google") {
        firebaseUser = await signInWithGoogle();
      } else {
        firebaseUser = await signInWithGithub();
      }
      
      const formattedUser = formatUser(firebaseUser);
      setUser(formattedUser);
      
      toast({
        title: "Login successful",
        description: `Welcome, ${formattedUser.name}!`,
      });
      return true;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast({
        title: "Login failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithProvider, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
