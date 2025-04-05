import FeaturedProducts from "@/components/featured-products";
import HomeProducts from "@/components/all-home-products";

export default function Home() {

  return (
    <div className="p-8">
      <FeaturedProducts />
      <HomeProducts />
    </div>
  );
}
