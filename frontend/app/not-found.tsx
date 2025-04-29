import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, BookOpen } from 'lucide-react'; // Import icons explicitly

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button className="flex items-center gap-2">
            <Home size={16} /> <span>Go Home</span>
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" className="flex items-center gap-2">
            <BookOpen size={16} /> <span>Browse Books</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}