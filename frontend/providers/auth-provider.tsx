'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/axios';

/**
 * Interface defining the authentication context shape
 * Provides type definitions for authentication state and methods
 */
interface AuthContextType {
  user: any | null;              // Current authenticated user data or null if not authenticated
  loading: boolean;              // Loading state for authentication operations
  login: (email: string, password: string) => Promise<void>;  // Function to authenticate user with credentials
  logout: () => Promise<void>;   // Function to end the current user session
  register: (userData: any) => Promise<void>;  // Function to create a new user account
}

/**
 * Create the authentication context with undefined default value
 * This context will be populated by the AuthProvider component
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component manages authentication state and operations
 * Provides login, logout, and register functions to children
 * Automatically checks for existing authentication on mount
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to auth context
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Authentication state
  const [user, setUser] = useState<any | null>(null);  // Stores authenticated user data
  const [loading, setLoading] = useState(true);  // Controls global loading state for auth operations

  /**
   * Effect to check authentication status on component mount
   * Attempts to retrieve the current user session from the API
   * Updates user state based on API response
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Request current authentication status
        const response = await api.get('/auth/me');
        // If authenticated, fetch complete user data using returned ID
        const user = await api.get(`/user/${response.data}`);
        setUser(user.data);
      } catch (error) {
        // If API call fails, user is not authenticated
        setUser(null);
      } finally {
        // Always mark loading as complete when auth check finishes
        setLoading(false);
      }
    };

    // Run the auth check immediately when component mounts
    checkAuthStatus();
  }, []);

  /**
   * Authenticates a user with email and password
   * Updates user state with authenticated user data on success
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<void>} Promise that resolves when login completes
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Send login request with credentials
      const response = await api.post('/auth/login', { email, password });
      // Fetch complete user data using returned user ID
      const user = await api.get(`/user/${response.data.user}`);
      // Update authentication state with user data
      setUser(user.data);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ends the current user session
   * Clears user state and invalidates the session cookie
   * 
   * @returns {Promise<void>} Promise that resolves when logout completes
   */
  const logout = async () => {
    setLoading(true);
    try {
      // Send logout request to invalidate server-side session
      await api.post('/auth/logout');
      // Clear user data from state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new user account and automatically logs in
   * Updates user state with the newly created user data
   * 
   * @param {Object} userData - New user data including name, email, password, etc.
   * @returns {Promise<void>} Promise that resolves when registration completes
   */
  const register = async (userData: any) => {
    setLoading(true);
    try {
      // Send registration request with user data
      await api.post('/auth/register', userData);

    } finally {
      setLoading(false);
      // After registration, automatically log in the new user
      await login(userData.email, userData.password);
      
    }
  };

  /**
   * Provide auth context value to all child components
   * Includes current user, loading state, and auth functions
   */
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * Ensures the hook is used within an AuthProvider
 * Provides strongly-typed access to auth state and functions
 * 
 * @returns {AuthContextType} Authentication context with user state and auth functions
 * @throws {Error} If used outside of an AuthProvider component
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};