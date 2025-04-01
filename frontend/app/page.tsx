'use client';
import { useAuth } from "@/providers/authprovider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();



  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <p>Welcome, {user.name}!</p> 
          {/* <pre className="bg-gray-100 p-4 rounded mt-4">
            {JSON.stringify(user, null, 2)}
          </pre> */}
          <button 
            onClick={logout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login (Test)
          </button>        
          </div>
      )}
    </div>
  );
}
