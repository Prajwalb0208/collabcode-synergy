
import { User as FirebaseUser } from "firebase/auth";
import { User } from "@/types/auth";

// Convert Firebase user to our User type
export const formatUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.uid,
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || undefined,
    provider: firebaseUser.providerData[0]?.providerId || 'email'
  };
};
