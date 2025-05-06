'use client';
import UserProducts from "@/components/user-products";
import api from "@/utils/axios"
import { useEffect, useState } from "react"

/**
 * Favourites component displays all products that the user has marked as favorites
 * It fetches the user's favorited products from the API and displays them in a grid
 */
function Favourites() {
  // State for storing the fetched favorite products
  const [favourites, setFavourites] = useState([])
  
  // Loading state to show loading indicators while fetching data
  const [loading, setLoading] = useState(true)
  
  // Error state to handle and display API request failures
  const [error, setError] = useState<string | null>(null)

  /**
   * Effect hook to fetch user's favorite products when component mounts
   * Makes API call to get all products marked as favorites by the current user
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Request favorites data for the authenticated user
        const response = await api.get('/listing/favourites')
        // Update state with fetched favorites
        setFavourites(response.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data")
      } finally {
        // Always turn off loading state when request completes
        setLoading(false)
      }
    }
    fetchData()
  }, []) // Empty dependency array ensures this runs once on component mount

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Display error message if API request failed */}
      {error && <div className="text-red-500">{error}</div>}
      
      {/* Only show heading when data has loaded and there's no error */}
      {!loading && !error && <h1 className="text-3xl font-bold mb-6">Favourites</h1>}

      {/* Products grid with loading state and empty message if needed */}
      <UserProducts 
        products={favourites} 
        emptyMessage="No favourites found" 
        loading={loading} 
      />
    </div>
  )
}

export default Favourites