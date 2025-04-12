
import { FirebaseError } from "firebase/app";

// Get error message from Firebase error code
export const getAuthErrorMessage = (error: any): string => {
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
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for OAuth operations - please update your Firebase settings';
      default:
        return error.message || 'Authentication error';
    }
  }
  return 'An unexpected error occurred';
};
