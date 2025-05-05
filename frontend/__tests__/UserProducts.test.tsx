import { render, screen } from '@testing-library/react';
import UserProducts from '../components/user-products';
import { Product, UserData } from '@/lib/definitions';

jest.mock('../components/product-card', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="product-card">Product Card</div>)
}));

jest.mock('../components/product-card-skeleton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="product-card-skeleton">Loading Skeleton</div>)
}));

describe('UserProducts', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'Test Product 1',
      description: 'Description 1',
      price: 10.99,
      imageUrl: 'image1.jpg',
      views: 5,
      fileUrl: 'file1.pdf',
      sellerId: 'seller1',
      isFeatured: false,
      featuredForTime: null,
      isFavourite: true,
      seller: {
        id: 'seller1',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        stripeStatus: 'ACTIVE',
        rating: 4.5,
        createdAt: '2025-01-01T00:00:00Z',
      },
      reviews: [],
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Product 2',
      description: 'Description 2',
      price: 20.99,
      imageUrl: 'image2.jpg',
      views: 10,
      fileUrl: 'file2.pdf',
      sellerId: 'seller2',
      isFeatured: false,
      featuredForTime: null,
      isFavourite: false,
      seller: {
        id: 'seller2',
        name: 'Jane',
        surname: 'Smith',
        email: 'jane@example.com',
        stripeStatus: 'ACTIVE',
        rating: 4.2,
        createdAt: '2025-01-02T00:00:00Z',
      },
      reviews: [],
      createdAt: '2025-01-02T00:00:00Z',
    },
  ];

  const mockUserData: UserData = {
    id: 'user1',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    stripeStatus: 'ACTIVE',
    rating: 4.7,
    createdAt: '2025-01-01T00:00:00Z',
  };

  test('renders loading skeletons when loading is true', () => {
    render(<UserProducts products={[]} loading={true} />);
    
    const skeletons = screen.getAllByTestId('product-card-skeleton');
    expect(skeletons).toHaveLength(4);
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });

  test('renders empty message when no products are available', () => {
    const emptyMessage = 'No products found';
    render(<UserProducts products={[]} emptyMessage={emptyMessage} />);
    
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });

  test('renders product cards when products are available', () => {
    render(<UserProducts products={mockProducts} />);
    
    const productCards = screen.getAllByTestId('product-card');
    expect(productCards).toHaveLength(2);
    expect(screen.queryByText(/No products/i)).not.toBeInTheDocument();
  });

  test('renders with userData when provided', () => {
    const { container } = render(<UserProducts products={mockProducts} userData={mockUserData} />);
    
    // Since we're mocking the ProductCard component, we can't directly test its props
    // But we can verify the correct number of cards is rendered
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
  });

  test('renders default values when optional props are not provided', () => {
    render(<UserProducts products={mockProducts} />);
    
    // Even without userData or emptyMessage, component should render without errors
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
  });

  test('renders with proper grid layout class', () => {
    const { container } = render(<UserProducts products={mockProducts} />);
    
    const gridDiv = container.querySelector('div');
    expect(gridDiv).toHaveClass('grid');
    expect(gridDiv).toHaveClass('grid-cols-1');
    expect(gridDiv).toHaveClass('sm:grid-cols-2');
    expect(gridDiv).toHaveClass('md:grid-cols-3');
    expect(gridDiv).toHaveClass('lg:grid-cols-4');
    expect(gridDiv).toHaveClass('gap-6');
  });
});