import UserProducts from "@/components/user-products";
import { Product } from "@/lib/definitions";
import api from "@/utils/axios";

async function CategoryPage({ params }: { params: { name: string } }) {

    const categoryName = params.name;
  
  let products: Product[] = [];
  let error: string | null = null;
  
  try {
    const category = categoryName.split('%20').shift();
    console.log(category);
    const response = await api.get(`/listing?category=${category}`);
    products = response.data.data.listings;
    
  } catch (err) {
    console.error(`Error fetching products for category ${categoryName}:`, err);
    error = 'Failed to load products';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">{decodeURIComponent(categoryName)} Products</h1>
        <a href="/products/" className="text-blue-600 hover:underline text-sm">
          View all &rarr;
        </a>
      </div>
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <UserProducts
          products={products}
          emptyMessage={`No products found in the "${decodeURIComponent(categoryName)}" category`} 
        />
      )}
    </div>
  );
}

export default CategoryPage;