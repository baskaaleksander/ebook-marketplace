import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import UserProductsTable from '../components/user-products-table';
import { Product } from '@/lib/definitions';
import api from '@/utils/axios';

// Mock API
jest.mock('@/utils/axios', () => ({
  delete: jest.fn().mockResolvedValue({}),
  post: jest.fn().mockResolvedValue({ 
    data: { 
      data: { 
        url: 'https://stripe.com/checkout/test' 
      } 
    }
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock window.location.href assignment
Object.defineProperty(window, 'location', {
  value: { href: jest.fn() },
  writable: true,
});

describe('UserProductsTable', () => {
  // Generate mock products for testing
  const generateMockProducts = (count: number): Product[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `product-${i + 1}`,
      title: `Product ${i + 1}`,
      description: `Description for Product ${i + 1}`,
      price: 10 + i * 5,
      imageUrl: `image-${i + 1}.jpg`,
      fileUrl: `file-${i + 1}.pdf`,
      views: i * 10,
      sellerId: 'seller-1',
      isFeatured: i % 3 === 0, // Every third product is featured
      featuredForTime: i % 3 === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
      isFavourite: false,
      seller: {
        id: 'seller-1',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        stripeStatus: 'ACTIVE',
        rating: 4.5,
        createdAt: '2024-01-01T00:00:00Z',
      },
      reviews: [],
      createdAt: `2024-0${i + 1}-01T00:00:00Z`,
    }));
  };

  const mockProducts = generateMockProducts(5);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with product data', () => {
    render(<UserProductsTable products={mockProducts} />);
    
    // Check if table caption is rendered
    expect(screen.getByText('All your products')).toBeInTheDocument();
    
    // Check if table headers are rendered
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Views')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /featured/i })).toBeInTheDocument();
    expect(screen.getByText('Modify')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /delete/i })).toBeInTheDocument();
    
    // Check if product data is rendered
    mockProducts.forEach(product => {
      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(`${product.price.toFixed(2)}PLN`)).toBeInTheDocument();
    });
    
    // Check if delete buttons are rendered
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    expect(deleteButtons).toHaveLength(mockProducts.length);
    
    // Check if edit links are rendered
    const editLinks = screen.getAllByText('Edit');
    expect(editLinks).toHaveLength(mockProducts.length);
  });



  test('displays "Featured" for featured products', () => {
    render(<UserProductsTable products={mockProducts} />);
    
    // Get featured products from mock data
    const featuredProducts = mockProducts.filter(p => p.isFeatured);
    
    // Check if "Featured" text is shown for featured products - use role to be more specific
    const featuredButtons = screen.getAllByRole('button', { name: /Featured/i });
    expect(featuredButtons).toHaveLength(featuredProducts.length);
  });

  test('displays "Feature" for non-featured products', () => {
    render(<UserProductsTable products={mockProducts} />);
    
    // Get non-featured products from mock data
    const nonFeaturedProducts = mockProducts.filter(p => !p.isFeatured);
    
    // Check if "Feature" text is shown for non-featured products
    const featureButtons = screen.getAllByText('Feature');
    expect(featureButtons).toHaveLength(nonFeaturedProducts.length);
  });

  test('opens feature dialog when feature button is clicked', () => {
    render(<UserProductsTable products={mockProducts} />);
    
    // Find a non-featured product button
    const featureButtons = screen.getAllByText('Feature');
    fireEvent.click(featureButtons[0]);
    
    // Check if dialog is opened
    expect(screen.getByText('Feature Your Product')).toBeInTheDocument();
    expect(screen.getByText('Featuring your product will give it special placement and visibility to potential buyers.')).toBeInTheDocument();
  });

  test('initiates payment when feature dialog is confirmed', async () => {
    render(<UserProductsTable products={mockProducts} />);
    
    // Find a non-featured product
    const nonFeaturedProductIndex = mockProducts.findIndex(p => !p.isFeatured);
    const nonFeaturedProduct = mockProducts[nonFeaturedProductIndex];
    
    // Click feature button for the non-featured product
    const featureButtons = screen.getAllByText('Feature');
    fireEvent.click(featureButtons[0]);
    
    const dialogElement = screen.getByText('Feature Your Product').closest('div[role="dialog"]');
    if (dialogElement) {
      expect(within(dialogElement as HTMLElement).getByText(nonFeaturedProduct.title)).toBeInTheDocument();
    } else {
      throw new Error('Dialog element not found');
    }
    
    // Check if cost is displayed
    expect(screen.getByText('15.00 PLN')).toBeInTheDocument();
    
    // Click on proceed to payment button
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    // Check if API was called with correct product ID
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(`/stripe/checkout-featuring/${nonFeaturedProduct.id}/`, {time: 30});
    });
    
    // Check if redirect happens
    expect(window.location.href).toBe('https://stripe.com/checkout/test');
  });

  test('cancels feature dialog when cancel button is clicked', () => {
    render(<UserProductsTable products={mockProducts} />);
    
    // Click feature button
    const featureButtons = screen.getAllByText('Feature');
    fireEvent.click(featureButtons[0]);
    
    // Dialog should be open
    expect(screen.getByText('Feature Your Product')).toBeInTheDocument();
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Dialog should be closed
    expect(screen.queryByText('Feature Your Product')).not.toBeInTheDocument();
  });



  test('displays error message when feature payment fails', async () => {
    // Mock console.error to capture error message
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock API to throw error
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Payment failed'));
    
    render(<UserProductsTable products={mockProducts} />);
    
    // Click feature button
    const featureButtons = screen.getAllByText('Feature');
    fireEvent.click(featureButtons[0]);
    
    // Click on proceed to payment button
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error initiating feature payment:', 
        expect.any(Error)
      );
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles case when no payment URL is returned', async () => {
    // Mock console.error to capture error message
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock API to return no URL
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { data: {} }
    });
    
    render(<UserProductsTable products={mockProducts} />);
    
    // Click feature button
    const featureButtons = screen.getAllByText('Feature');
    fireEvent.click(featureButtons[0]);
    
    // Click on proceed to payment button
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error initiating feature payment:', 
        expect.any(Error)
      );
    });
    
    consoleErrorSpy.mockRestore();
  });
});