import FeaturedProducts from "@/components/featured-products";

export default function Home() {

  const mockProduct = {
    id: "cm906osis0001il7kdwdsf5cd",
    title: "sadad",
    description: "asdasdad",
    price: 50,
    sellerId: "cm92nodda00006mwfk9tyt43j",
    createdAt: "2025-04-02T17:11:25.540Z",
  }
  return (
    <div className="p-8">
      <FeaturedProducts />
    </div>
  );
}
