import FeaturedProducts from "@/components/featured-products";

export default function Home() {

  const mockProduct = {
    id: "cm906osis0001il7kdwdsf5cd",
    title: "sadad",
    description: "asdasdad",
    price: 50,
    sellerId: "cm8t4soki0000ilb88th6ou1a",
    createdAt: "2025-04-02T17:11:25.540Z",
  }
  return (
    <div className="p-8">
      <FeaturedProducts />
    </div>
  );
}
