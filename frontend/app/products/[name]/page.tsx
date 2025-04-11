import UserProducts from "@/components/user-products";
import { Product } from "@/lib/definitions";
import api from "@/utils/axios";

async function CategoryPage({ params }: { params: { name: string } }) {

    const categoryName = params.name;
  
  let products: Product[] = [];
  let error: string | null = null;
  
  try {

    console.log(`Fetching products for category: ${categoryName}`);
    
    const response = await api.get(`/listing/categories/${encodeURIComponent(categoryName)}/products`);
    products = response.data;
    

    console.log(`Received ${products.length} products for category ${categoryName}`);
  } catch (err) {
    console.error(`Error fetching products for category ${categoryName}:`, err);
    error = 'Failed to load products';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{decodeURIComponent(categoryName)} Products</h1>
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