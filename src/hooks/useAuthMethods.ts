
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";
import { 
  signInWithGoogle, 
  signInWithGithub, 
  signInWithEmail, 
  registerWithEmail, 
  signOutUser 
} from "@/services/firebaseService";
import { formatUser } from "@/utils/userUtils";
import { getAuthErrorMessage } from "@/utils/authErrorUtils";

export const useAuthMethods = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
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
        description: getAuthErrorMessage(error),
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
        description: getAuthErrorMessage(error),
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
        description: getAuthErrorMessage(error),
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
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return { login, register, loginWithProvider, logout };
};
