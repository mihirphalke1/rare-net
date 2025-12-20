import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || '';
console.log("API_URL =", API_URL || "(using proxy)");

// Types
export interface User {
  id: string;
  email: string;
  role: 'doctor' | 'admin';
  hospital: string | null;
  full_name: string | null;
  is_active: boolean;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  hospital: string | null;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = 'rarenet_token';
const REFRESH_TOKEN_KEY = 'rarenet_refresh_token';
const USER_KEY = 'rarenet_user';

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode<TokenPayload>(storedToken);
        const now = Date.now() / 1000;

        if (decoded.exp > now) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Token expired, try refresh
          // Guard refreshToken in case it's not defined or fails
          if (typeof refreshToken === "function") {
            refreshToken().catch(() => clearAuth());
          } else {
            clearAuth();
          }
        }
      } catch {
        clearAuth();
      }
    }

    setIsLoading(false);
  }, []);

  // Clear auth state
  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    let response: Response;

    try {
      response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      throw new Error("Network error: backend not reachable");
    }

    if (!response.ok) {
      const text = await response.text();
      // Try to parse JSON error if possible
      try {
        const jsonError = JSON.parse(text);
        if (jsonError.detail) {
          throw new Error(jsonError.detail);
        }
      } catch (e) {
        // If not JSON, use text
      }
      throw new Error(`Login failed (${response.status}): ${text}`);
    }

    const data = await response.json();

    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    setToken(data.access_token);
    setUser(data.user);
  };

  // Logout function
  const logout = () => {
    clearAuth();
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();

      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);

      return true;
    } catch {
      clearAuth();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to get auth header
export function getAuthHeader(token: string | null): HeadersInit {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

