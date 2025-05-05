import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BoughtProductsTable from '../components/bought-products-table';
import { Order, OrderStatus } from '@/lib/definitions';
import api from '@/utils/axios';

// Mock the axios API
jest.mock('@/utils/axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { message: 'Success' } })
}));

// Mock the star rating component
jest.mock('../components/star-rating', () => ({
  __esModule: true,
  default: ({ rating, onChange }: { rating: number, onChange: (rating: number) => void }) => (
    <div data-testid="star-rating">
      <span>Rating: {rating}</span>
      <button onClick={() => onChange(4)}>Change Rating</button>
    </div>
  )
}));

describe('BoughtProductsTable', () => {
  // Create mock orders for testing
  const createMockOrders = (count: number): Order[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `order-${i + 1}`,
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      productId: `product-${i + 1}`,
      isReviewed: i % 2 === 0, // Every other order is reviewed
      refundId: i % 3 === 0 ? `refund-${i}` : null, // Every third order has refund
      status: i % 4 === 0 ? OrderStatus.REFUNDED : i % 4 === 1 ? OrderStatus.PENDING : OrderStatus.COMPLETED,
      amount: (i + 1) * 1000, // Amount in cents
      checkoutSessionId: `session-${i + 1}`,
      paymentUrl: `https://payment.url/${i + 1}`,
      createdAt: new Date(2025, 0, i + 1).toISOString(),
      updatedAt: new Date(2025, 0, i + 1).toISOString(),
      product: {
        id: `product-${i + 1}`,
        title: `Product ${i + 1}`,
        description: `Description ${i + 1}`,
        price: (i + 1) * 10,
        imageUrl: `image-${i + 1}.jpg`,
        fileUrl: `file-${i + 1}.pdf`,
        views: i + 10,
        sellerId: 'seller-1',
        isFeatured: false,
        featuredForTime: null,
        isFavourite: false,
        seller: {
          id: 'seller-1',
          name: 'John',
          surname: 'Doe',
          email: 'john@example.com',
          stripeStatus: 'ACTIVE',
          rating: 4.5,
          createdAt: new Date(2025, 0, 1).toISOString(),
        },
        reviews: [],
        createdAt: new Date(2025, 0, i + 1).toISOString(),
      }
    }));
  };

  const mockOrders = createMockOrders(15); // Create 15 orders for pagination testing
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the table with correct headers', () => {
    render(<BoughtProductsTable orders={mockOrders} />);
    
    // Check for table headers
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Product title')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Refund ID')).toBeInTheDocument();
    expect(screen.getByText('Seller ID')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('displays the first page of orders', () => {
    render(<BoughtProductsTable orders={mockOrders} />);
    
    // Should show first 10 orders
    expect(screen.getByText('order-1')).toBeInTheDocument();
    expect(screen.getByText('order-10')).toBeInTheDocument();
    expect(screen.queryByText('order-11')).not.toBeInTheDocument();
  });

  test('handles pagination correctly', () => {
    render(<BoughtProductsTable orders={mockOrders} />);
    
    // Navigate to second page
    fireEvent.click(screen.getByText('2'));
    
    // Should show next 5 orders (11-15)
    expect(screen.queryByText('order-1')).not.toBeInTheDocument();
    expect(screen.getByText('order-11')).toBeInTheDocument();
    expect(screen.getByText('order-15')).toBeInTheDocument();
  });

  test('opens refund dialog when refund button is clicked', () => {
    render(<BoughtProductsTable orders={mockOrders.filter(o => o.status === OrderStatus.COMPLETED)} />);
    
    // Find and click refund button for completed order
    const refundButton = screen.getAllByText('Refund')[0];
    fireEvent.click(refundButton);
    
    // Check if dialog is open
    expect(screen.getByText('Confirm Refund')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to request a refund for this product?')).toBeInTheDocument();
  });

  test('opens review dialog when review button is clicked', () => {
    // Use only non-reviewed completed orders
    const nonReviewedOrders = mockOrders.filter(o => o.status === OrderStatus.COMPLETED && !o.isReviewed);
    render(<BoughtProductsTable orders={nonReviewedOrders} />);
    
    // Find and click review button
    const reviewButton = screen.getAllByText('Review')[0];
    fireEvent.click(reviewButton);
    
    // Check if dialog is open
    expect(screen.getByText('Write a Review')).toBeInTheDocument();
    expect(screen.getByText('Share your thoughts about this product')).toBeInTheDocument();
  });

  test('submits review when form is completed', async () => {
    const nonReviewedOrders = mockOrders.filter(o => o.status === OrderStatus.COMPLETED && !o.isReviewed);
    render(<BoughtProductsTable orders={nonReviewedOrders} />);
    
    // Open review dialog
    fireEvent.click(screen.getAllByText('Review')[0]);
    
    // Change rating using mocked star rating component
    fireEvent.click(screen.getByText('Change Rating'));
    
    // Enter review comment
    fireEvent.change(screen.getByPlaceholderText('Write your review here...'), {
      target: { value: 'This is a test review' }
    });
    
    // Submit review
    fireEvent.click(screen.getByText('Submit Review'));
    
    // Check if API was called with correct parameters
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/listing\/order-\d+\/reviews/),
        expect.objectContaining({
          rating: 4,
          comment: 'This is a test review'
        })
      );
    });
  });

  test('submits refund request when confirmed', async () => {
    render(<BoughtProductsTable orders={mockOrders.filter(o => o.status === OrderStatus.COMPLETED)} />);
    
    // Open refund dialog
    fireEvent.click(screen.getAllByText('Refund')[0]);
    
    // Confirm refund
    fireEvent.click(screen.getByText('Request Refund'));
    
    // Check if API was called correctly
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/stripe/order/refund',
        expect.objectContaining({
          id: expect.stringMatching(/order-\d+/)
        })
      );
    });
  });

  test('displays download links only for completed orders', () => {
    render(<BoughtProductsTable orders={mockOrders} />);
    
    const completedOrdersFirstPage = mockOrders
      .slice(0, 10) // first page shows 10 items
      .filter(o => o.status === OrderStatus.COMPLETED);
        
    const downloadLinks = screen.getAllByText('Download');
    expect(downloadLinks.length).toBe(completedOrdersFirstPage.length);
  });

  test('shows "Already reviewed" for reviewed orders', () => {
    render(<BoughtProductsTable orders={mockOrders.filter(o => o.status === OrderStatus.COMPLETED && o.isReviewed)} />);
    
    const alreadyReviewedTexts = screen.getAllByText('Already reviewed');
    expect(alreadyReviewedTexts.length).toBeGreaterThan(0);
  });

  test('shows "Already refunded" for refunded orders', () => {
    render(<BoughtProductsTable orders={mockOrders.filter(o => o.status === OrderStatus.REFUNDED)} />);
    
    const alreadyRefundedTexts = screen.getAllByText('Already refunded');
    expect(alreadyRefundedTexts.length).toBeGreaterThan(0);
  });

  test('displays proper pagination info', () => {
    render(<BoughtProductsTable orders={mockOrders} />);
    
    expect(screen.getByText('Your purchased orders - Page 1 of 2')).toBeInTheDocument();
  });

  test('disables previous button on first page', () => {
    render(<BoughtProductsTable orders={mockOrders} />);
    
    const prevLink = screen.getByLabelText('Go to previous page');
    expect(prevLink).toHaveClass('pointer-events-none opacity-50');
  });

  test('enables next button when not on last page', () => {
    render(<BoughtProductsTable orders={mockOrders} />);
    
    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).not.toHaveClass('pointer-events-none');
  });
});