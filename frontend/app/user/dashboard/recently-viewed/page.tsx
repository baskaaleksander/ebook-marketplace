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
        setViewed(response.data)
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
    <div className="container px-4 py-8 min-h-screen">
      <UserProducts products={viewed} emptyMessage="No viewed products found" />
    </div>
  )
}

export default RecentlyViewed