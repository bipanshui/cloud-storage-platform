import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { clearAccessToken, setAccessToken } from "@/services/api";
import { getErrorMessage } from "@/utils/helpers";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getMe();
      setUser(response.data.user);
    } catch (_error) {
      clearAccessToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    async login(email, password) {
      const response = await authService.login(email, password);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      return response;
    },
    async register(firstName, lastName, email, password) {
      const response = await authService.register(
        firstName,
        lastName,
        email,
        password
      );
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      return response;
    },
    async logout() {
      try {
        await authService.logout();
      } catch (_error) {
        // Keep client state consistent even if the server logout request fails.
      } finally {
        clearAccessToken();
        setUser(null);
        navigate("/login", { replace: true });
      }
    },
    async checkAuth() {
      try {
        await checkAuth();
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
