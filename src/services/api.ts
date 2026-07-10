import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL; // Change this to your backend URL

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types for API requests and responses
export type LoginRequest = {
  username: string;
  password: string;
};

export type SignUpRequest = {
  username: string;
  password: string;
  email: string;
};

export type AuthResponse = {
  success: boolean;
  token?: string;
  username: string;
  /* -- TEST FIELDS THAT DON'T MATCH API STRUCTURES -- */ 
  /*
  user?: {
    id: string;
    username: string;
    email: string;
  };
  message?: string;
  */
};

// API Functions
export const api = {
  // Login function
  login: async (username: string, password: string): Promise<AuthResponse> => {
      const payload = {
        "idx": 0,
        "username": username,
        "password_hash": password,
        "email": ""
      };
      try {
        const response = await axiosInstance.post('/login', payload);
        // Store token in localStorage if retrieval was successful
          if (response.status == 200) {
            localStorage.setItem('authToken', response.data);
            const claims = jwtDecode(response.data);
            const loggedIn: AuthResponse =  {
                success: true,
                token: response.data,
                username: claims['username']
            };
            return loggedIn;
        }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      console.error('Login error:', error);
      throw error;
    }
  },

  getTestPolyline: async(): Promise<string> => {
    try {
      const path = "/api/getPolyline/43acd555-eb65-4eec-8e30-684547a516ff";
      const response = await axiosInstance.get(path);
      if (response.status == 200 ) {
        return response.data;
      } else {
        return "Couldn't get polyline";
      }
    } catch (error) {
      console.log(error);
      return "Couldn't get polyline";
    }
  },

  getPolyline: async(tripId): Promise<string> => {
    try {
      const path = "/api/getPolyline/" + tripId;
      const response = await axiosInstance.get(path);
      if (response.status == 200 ) {
        return response.data;
      } else {
        return "Couldn't get polyline";
      }
    } catch (error) {
      console.log(error);
      return "Couldn't get polyline";
    }
  },
  
  getMostRecentLocations: async(): Promise<Array<[number, number]>> => {
    const token = jwtDecode(localStorage.getItem("authToken"));
    const currUser = token["username"];
    try {
      const path = "/api/getRecentUser/" + currUser;
      const response = await axiosInstance.get(path);
      if (response.status == 200) {
        return response.data;
      } else {
        return "Couldn't get user locations";
      }
    } catch (error) {
      console.log(error);
      return "Couldn't get user locations";
    }
    return currUser;
  },

  // Sign up function
  signUp: async (username: string, password: string, email: string): Promise<AuthResponse> => {
    try {
      const signUpResponse = await axiosInstance.post('/register', {
        "idx":0,
        "username": username,
        "password_hash": password,
        "email": email
      });
      if (signUpResponse.status==201) {
          const loginResponse = await api.login(username, password);
          console.log("Logged In: ", loginResponse.username);
          if (loginResponse.success == true) {
              const response: AuthResponse = {
                success: true,
                username: loginResponse.username
              }
              console.log("Response: ", response.username);
              return response;
          }
      }
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Sign up error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Sign up failed');
      }
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};
