import { render, screen, waitFor } from '@testing-library/react';
import AllHomeProducts from '../components/all-home-products';
import { Category } from '@/lib/definitions';
import api from '@/utils/axios';

// Mock the axios API
jest.mock('@/utils/axios', () => ({
  get: jest.fn(),
}));

// Mock the child components
jest.mock('../components/categories-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="categories-skeleton">Loading categories...</div>,
}));

jest.mock('../components/product-card', () => ({
  __esModule: true,
  default: ({ id, title }: { id: string; title: string }) => (
    <div data-testid={`product-card-${id}`}>{title}</div>
  ),
}));

describe('AllHomeProducts', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat1',
      name: 'Fiction',
      products: [
        {
          id: 'prod1',
          title: 'Product 1',
          description: 'Description 1',
          price: 9.99,
          imageUrl: 'image1.jpg',
          views: 10,
          sellerId: 'seller1',
          seller: {
            id: 'seller1',
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
            stripeStatus: 'ACTIVE',
            rating: 4.5,
            createdAt: '2025-01-01T00:00:00Z',
          },
          fileUrl: 'file1.pdf',
          isFeatured: false,
          featuredForTime: null,
          isFavourite: false,
          reviews: [],
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'prod2',
          title: 'Product 2',
          description: 'Description 2',
          price: 19.99,
          imageUrl: 'image2.jpg',
          views: 5,
          sellerId: 'seller2',
          seller: {
            id: 'seller2',
            name: 'Jane',
            surname: 'Smith',
            email: 'jane@example.com',
            stripeStatus: 'ACTIVE',
            rating: 4.2,
            createdAt: '2025-01-02T00:00:00Z',
          },
          fileUrl: 'file2.pdf',
          isFeatured: false,
          featuredForTime: null,
          isFavourite: true,
          reviews: [],
          createdAt: '2025-01-02T00:00:00Z',
        },
      ],
    },
    {
      id: 'cat2',
      name: 'Non-Fiction',
      products: [
        {
          id: 'prod3',
          title: 'Product 3',
          description: 'Description 3',
          price: 14.99,
          imageUrl: 'image3.jpg',
          views: 15,
          sellerId: 'seller1',
          seller: {
            id: 'seller1',
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
            stripeStatus: 'ACTIVE',
            rating: 4.5,
            createdAt: '2025-01-01T00:00:00Z',
          },
          fileUrl: 'file3.pdf',
          isFeatured: true,
          featuredForTime: new Date(),
          isFavourite: false,
          reviews: [],
          createdAt: '2025-01-03T00:00:00Z',
        },
      ],
    },
    {
      id: 'cat3',
      name: 'Empty Category',
      products: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading skeleton initially', () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
    
    render(<AllHomeProducts />);
    
    expect(screen.getByTestId('categories-skeleton')).toBeInTheDocument();
  });

  test('renders error message when API call fails', async () => {
    const errorMessage = 'Failed to load products. Please try again later.';
    (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<AllHomeProducts />);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('renders categories and their products when API call succeeds', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockCategories } });
    
    render(<AllHomeProducts />);
    
    // Wait for the API call to resolve
    await waitFor(() => {
      expect(screen.queryByTestId('categories-skeleton')).not.toBeInTheDocument();
    });
    
    // Check for category headers
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('Non-Fiction')).toBeInTheDocument();
    expect(screen.getByText('Empty Category')).toBeInTheDocument();
    
    // Check for products in each category
    expect(screen.getByTestId('product-card-prod1')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-prod2')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-prod3')).toBeInTheDocument();
    
    // Check for empty category message
    expect(screen.getByText('No products available in this category yet.')).toBeInTheDocument();
  });

  test('renders the correct number of product cards', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockCategories } });
    
    render(<AllHomeProducts />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('categories-skeleton')).not.toBeInTheDocument();
    });
    
    // Total products across all categories is 3
    const productCards = screen.getAllByTestId(/product-card-prod/);
    expect(productCards).toHaveLength(3);
  });

  test('renders links to category pages', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockCategories } });
    
    render(<AllHomeProducts />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('categories-skeleton')).not.toBeInTheDocument();
    });
    
    // Check that category links have the correct hrefs
    const links = screen.getAllByRole('link');
    
    // Find links with category names
    const fictionLink = links.find(link => link.textContent === 'Fiction');
    const nonFictionLink = links.find(link => link.textContent === 'Non-Fiction');
    
    expect(fictionLink).toHaveAttribute('href', '/products/Fiction');
    expect(nonFictionLink).toHaveAttribute('href', '/products/Non-Fiction');
  });

  test('renders "View all" link correctly', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockCategories } });
    
    render(<AllHomeProducts />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('categories-skeleton')).not.toBeInTheDocument();
    });
    
    const viewAllLink = screen.getByText('View all →');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink.closest('a')).toHaveAttribute('href', '/products');
  });
});