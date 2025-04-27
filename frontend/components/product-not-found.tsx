import { Button } from './ui/button'
import { Link } from 'lucide-react'

function ProductNotFound() {
  return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
          <div className="animate-pulse mb-6">
            <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Product Not Found</h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            The product you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <div className="flex gap-4">
          <Button>
            <Link href="/">
              Go Home
            </Link>
          </Button>
          <Button variant="outline">
            <Link href="/products">
              Browse Books
            </Link>
          </Button>
        </div>
  
        </div>
    )
}

export default ProductNotFound