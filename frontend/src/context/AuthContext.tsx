import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<any>;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set axios default header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      localStorage.setItem("access_token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("access_token");
    }
  }, [token]);

  // Check if user is already logged in
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/profile/`);
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setToken(null);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE}/auth/register/`,
        {
          username,
          email,
          password,
        }
      );

      return response.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.error ||
        "Registration failed";

      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE}/auth/login/`,
        {
          username,
          password,
        }
      );

      const accessToken = response.data.access;

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      localStorage.setItem("access_token", accessToken);

      setToken(accessToken);

      const profileRes = await axios.get(
        `${API_BASE}/auth/profile/`
      );

      setUser(profileRes.data);

      return response.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.detail || "Login failed";

      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout/`);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};