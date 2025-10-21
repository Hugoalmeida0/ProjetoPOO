import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient, setToken } from "@/integrations/api/client";

type AuthUser = { id: string; email: string; full_name?: string } | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, full_name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // tenta recuperar usuário via /me se houver token salvo
    const bootstrap = async () => {
      try {
        const me = await apiClient.auth.me();
        setUser(me.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { token, user } = await apiClient.auth.login({ email, password });
    setToken(token);
    setUser(user);
  };

  const signUp = async (email: string, password: string, full_name?: string) => {
    const { token, user } = await apiClient.auth.register({ email, password, full_name });
    setToken(token);
    setUser(user);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
  };

  const value = { user, loading, signIn, signUp, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};