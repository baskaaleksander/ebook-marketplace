'use client';
import UserProducts from "@/components/user-products";
import api from "@/utils/axios"
import { useEffect, useState } from "react"

function RecentlyViewed() {

  const [viewed, setViewed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await api.get('/listing/viewed')
        setViewed(response.data.data)
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
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && <h1 className="text-3xl font-bold mb-6">Recently Viewed</h1>}
      <UserProducts products={viewed} emptyMessage="No viewed products found" loading={loading} />
    </div>
  )
}

export default RecentlyViewed