import axios from "axios";

interface LoginCredentials {
  email: string;
  password: string;
}

export const handleLogin = async ({ email, password }: LoginCredentials) => {
  try {
    const response = await axios.post(
      "http://localhost:3001/auth/login",
      { email, password },
      { withCredentials: true } 
    );

    console.log("Login successful", response.data);
  } catch (error: any) {
    console.error("Login failed", error.response?.data?.message || error.message);
  }
};
