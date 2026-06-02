import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './api-config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.REQUEST_CONFIG.timeout,
  headers: API_CONFIG.REQUEST_CONFIG.headers,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ errors?: { name?: string; message?: string }; message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (unauthorized/token expired)
    if (error.response?.status === 401) {
      const errorData = error.response.data;
      const isTokenExpired = errorData?.errors?.name === 'TokenExpiredError' || 
                            errorData?.message?.toLowerCase().includes('token expired');

      // If token is expired, clear everything and force re-login
      if (isTokenExpired) {
        console.warn('Token expired, clearing session and redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Dispatch custom event for logout
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        
        // Redirect to sign-in page
        if (window.location.pathname !== '/sign-in' && window.location.pathname !== '/sign-up') {
          window.location.href = '/sign-in?reason=expired';
        }
        
        return Promise.reject(error);
      }

      // For other 401 errors, try to refresh token (only once)
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REFRESH_TOKEN}`,
              { refreshToken }
            );

            const { token } = response.data;
            localStorage.setItem('authToken', token);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect
            console.error('Token refresh failed:', refreshError);
          }
        }

        // No refresh token or refresh failed — clear session and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Dispatch custom event for logout
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        
        if (window.location.pathname !== '/sign-in' && window.location.pathname !== '/sign-up') {
          window.location.href = '/sign-in?reason=session-expired';
        }
        
        return Promise.reject(error);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    if (axiosError.response) {
      // Server responded with error
      return axiosError.response.data?.message || axiosError.response.data?.error || 'An error occurred';
    } else if (axiosError.request) {
      // Request made but no response
      return 'No response from server. Please check your connection.';
    } else {
      // Error setting up request
      return axiosError.message || 'Failed to make request';
    }
  }
  
  return 'An unexpected error occurred';
};

// Export typed request methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get<T>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.post<T>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.put<T>(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.patch<T>(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.delete<T>(url, config),
};
