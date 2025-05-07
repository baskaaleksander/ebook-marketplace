'use client';
import dynamic from "next/dynamic";

const FeaturedProducts = dynamic(() => import('@/components/featured-products'), {
  ssr: false,
})
const HomeProducts = dynamic(() => import('@/components/all-home-products'), {
  ssr: false,
})
const LastViewed = dynamic(() => import('@/components/last-viewed'), {
  ssr: false,
})
export default function Home() {

  return (
    <div className="p-8 min-h-screen">
      <LastViewed />
      <FeaturedProducts />
      <HomeProducts />
    </div>
  );
}
