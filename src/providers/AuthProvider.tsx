import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type User } from "@/services/api";

type AuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          setIsAdmin(profile.roles?.includes('ADMIN') || false);
        } catch (error) {
          api.logout();
        }
      }
      setLoading(false);
    };

    void checkAuth();
  }, []);

  const signOut = async () => {
    api.logout();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
