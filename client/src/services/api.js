import axios from "axios";
import { API_BASE_URL } from "@/utils/constants";

let accessToken = null;
let isRefreshing = false;
let refreshSubscribers = [];

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Stores the in-memory access token.
 * @param {string | null} token
 */
export function setAccessToken(token) {
  accessToken = token;
}

/**
 * Reads the in-memory access token.
 * @returns {string | null}
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Clears the in-memory access token.
 */
export function clearAccessToken() {
  accessToken = null;
}

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function notifySubscribers(token) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function handleAuthFailure() {
  clearAccessToken();
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await refreshClient.post("/auth/refresh");
      const token = response.data?.data?.accessToken;

      setAccessToken(token || null);
      notifySubscribers(token || null);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;

      return api(originalRequest);
    } catch (refreshError) {
      notifySubscribers(null);
      handleAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

