'use client';
import UserProducts from "@/components/user-products";
import api from "@/utils/axios"
import { useEffect, useState } from "react"

function Favourites() {

  const [favourites, setFavourites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await api.get('/listing/favourites')
        setFavourites(response.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && <h1 className="text-3xl font-bold mb-6">Favourites</h1>}

      <UserProducts products={favourites} emptyMessage="No favourites found" />
    </div>
  )
}

export default Favourites