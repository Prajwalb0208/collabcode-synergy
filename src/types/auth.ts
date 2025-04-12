
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: "google" | "github") => Promise<boolean>;
  logout: () => void;
}
