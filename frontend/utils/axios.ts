import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "default_api_key",
  },
  withCredentials: true,
});

export default api;
