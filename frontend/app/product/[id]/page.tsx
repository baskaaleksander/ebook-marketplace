function ProductPage({ params }: { params: { id: string } }) {
  return <div>Product Page {params.id}</div>;
}

export default ProductPage;