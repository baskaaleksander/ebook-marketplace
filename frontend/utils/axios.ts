/**
 * Axios API Client Configuration
 * 
 * This file configures a centralized axios instance for making HTTP requests
 * to the backend API. Using a single instance ensures consistent configuration
 * across the application and simplifies making authenticated requests.
 */
import axios from "axios";

/**
 * Create a preconfigured axios instance with application defaults
 * This instance will be used for all API calls throughout the application
 */
const api = axios.create({
  // Base URL for all requests, falls back to localhost in development
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1/",
  
  // Default headers sent with every request
  headers: {
    // API key for authentication and rate limiting
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "default_api_key",
  },
  
  // Enable sending and receiving cookies in cross-origin requests
  // Required for maintaining session-based authentication
  withCredentials: true,
});

export default api;
