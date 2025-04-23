import FeaturedProducts from "@/components/featured-products";
import HomeProducts from "@/components/all-home-products";
import LastViewed from "@/components/last-viewed";

export default function Home() {

  return (
    <div className="p-8">
      <LastViewed />
      <FeaturedProducts />
      <HomeProducts />
    </div>
  );
}
