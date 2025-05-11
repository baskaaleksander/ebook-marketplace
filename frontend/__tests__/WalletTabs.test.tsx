import { render, screen, fireEvent } from '@testing-library/react';
import WalletTabs from '@/components/wallet-tabs';
import { Order, OrderStatus, Payout, PayoutStatus } from '@/lib/definitions';

// Mock the child components
jest.mock('@/components/sold-orders-table', () => ({
  __esModule: true,
  default: () => <div data-testid="sold-orders-table">Sold Orders Table</div>,
}));

jest.mock('@/components/payouts-table', () => ({
  __esModule: true,
  default: () => <div data-testid="payouts-table">Payouts Table</div>,
}));

describe('WalletTabs', () => {
  const mockSetActiveTab = jest.fn();
  
  const mockOrders: Order[] = [
    {
      id: '1',
      sellerId: 'seller-1',
      buyerId: 'buyer-1',
      isReviewed: true,
      productId: 'book-1',
      product: {
        id: 'book-1',
        title: 'Advanced JavaScript Patterns',
        description: 'Learn advanced JavaScript design patterns',
        price: 1999,
        imageUrl: 'https://example.com/book1.jpg',
        views: 250,
        fileUrl: 'https://example.com/files/book1.pdf',
        sellerId: 'seller-1',
        isFeatured: true,
        featuredForTime: null,
        isFavourite: false,
        seller: {
          id: 'seller-1',
          name: 'John',
          surname: 'Smith',
          email: 'john@example.com',
          stripeStatus: 'ACTIVE',
          rating: 4.8,
          createdAt: '2022-01-15T00:00:00.000Z'
        },
        reviews: [],
        createdAt: '2023-01-10T00:00:00.000Z'
      },
      refundId: null,
      amount: 1999,
      status: OrderStatus.COMPLETED,
      checkoutSessionId: 'cs_123456789',
      paymentUrl: null,
      createdAt: '2023-05-01T00:00:00.000Z',
      updatedAt: '2023-05-01T01:30:00.000Z'
    },
    {
      id: '2',
      sellerId: 'seller-1',
      buyerId: 'buyer-2',
      isReviewed: false,
      productId: 'book-2',
      product: {
        id: 'book-2',
        title: 'React Performance Optimization',
        description: 'Techniques for optimizing React applications',
        price: 2499,
        imageUrl: 'https://example.com/book2.jpg',
        views: 175,
        fileUrl: 'https://example.com/files/book2.pdf',
        sellerId: 'seller-1',
        isFeatured: false,
        featuredForTime: null,
        isFavourite: false,
        seller: {
          id: 'seller-1',
          name: 'John',
          surname: 'Smith',
          email: 'john@example.com',
          stripeStatus: 'ACTIVE',
          rating: 4.8,
          createdAt: '2022-01-15T00:00:00.000Z'
        },
        reviews: [],
        createdAt: '2023-02-15T00:00:00.000Z'
      },
      refundId: null,
      amount: 2499,
      status: OrderStatus.COMPLETED,
      checkoutSessionId: 'cs_987654321',
      paymentUrl: null,
      createdAt: '2023-05-15T00:00:00.000Z',
      updatedAt: '2023-05-15T02:15:00.000Z'
    },
    {
      id: '3',
      sellerId: 'seller-1',
      buyerId: 'buyer-3',
      isReviewed: false,
      productId: 'book-3',
      product: {
        id: 'book-3',
        title: 'TypeScript for Beginners',
        description: 'A comprehensive guide to TypeScript',
        price: 1799,
        imageUrl: 'https://example.com/book3.jpg',
        views: 320,
        fileUrl: 'https://example.com/files/book3.pdf',
        sellerId: 'seller-1',
        isFeatured: false,
        featuredForTime: null,
        isFavourite: false,
        seller: {
          id: 'seller-1',
          name: 'John',
          surname: 'Smith',
          email: 'john@example.com',
          stripeStatus: 'ACTIVE',
          rating: 4.8,
          createdAt: '2022-01-15T00:00:00.000Z'
        },
        reviews: [],
        createdAt: '2023-03-20T00:00:00.000Z'
      },
      refundId: null,
      amount: 1799,
      status: OrderStatus.PENDING,
      checkoutSessionId: 'cs_abcdefghi',
      paymentUrl: 'https://checkout.stripe.com/pay/cs_test_abcdefghi',
      createdAt: '2023-06-01T00:00:00.000Z',
      updatedAt: '2023-06-01T00:00:00.000Z'
    },
    {
      id: '4',
      sellerId: 'seller-1',
      buyerId: 'buyer-4',
      isReviewed: false,
      productId: 'book-4',
      product: {
        id: 'book-4',
        title: 'Next.js in Action',
        description: 'Building production-ready apps with Next.js',
        price: 2999,
        imageUrl: 'https://example.com/book4.jpg',
        views: 150,
        fileUrl: 'https://example.com/files/book4.pdf',
        sellerId: 'seller-1',
        isFeatured: true,
        featuredForTime: new Date('2023-06-15T00:00:00.000Z'),
        isFavourite: false,
        seller: {
          id: 'seller-1',
          name: 'John',
          surname: 'Smith',
          email: 'john@example.com',
          stripeStatus: 'ACTIVE',
          rating: 4.8,
          createdAt: '2022-01-15T00:00:00.000Z'
        },
        reviews: [],
        createdAt: '2023-04-05T00:00:00.000Z'
      },
      refundId: 'ref_123456',
      amount: 2999,
      status: OrderStatus.REFUNDED,
      checkoutSessionId: 'cs_refunded123',
      paymentUrl: null,
      createdAt: '2023-06-10T00:00:00.000Z',
      updatedAt: '2023-06-12T10:30:00.000Z'
    }
  ];
  
  const mockPayouts: Payout[] = [
    {
      id: 'payout-1',
      userId: 'seller-1', 
      amount: 5000,
      stripePayoutId: 'po_123456789abcdef',
      status: PayoutStatus.COMPLETED,
      createdAt: '2023-05-02T00:00:00.000Z',
      updatedAt: '2023-05-05T00:00:00.000Z',
    },
    {
      id: 'payout-2',
      userId: 'seller-1',
      amount: 3500,
      stripePayoutId: 'po_987654321zyxwvu',
      status: PayoutStatus.PENDING,
      createdAt: '2023-06-15T00:00:00.000Z',
      updatedAt: '2023-06-15T00:00:00.000Z',
    }
  ];

  it('renders the orders tab by default', () => {
    render(
      <WalletTabs
        activeTab="orders"
        setActiveTab={mockSetActiveTab}
        soldOrders={mockOrders}
        payouts={mockPayouts}
      />
    );
    
    expect(screen.getByText('Sold Orders')).toBeInTheDocument();
    expect(screen.getByTestId('sold-orders-table')).toBeInTheDocument();
  });

  it('renders the payouts tab when selected', () => {
    render(
      <WalletTabs
        activeTab="payouts"
        setActiveTab={mockSetActiveTab}
        soldOrders={mockOrders}
        payouts={mockPayouts}
      />
    );
    
    expect(screen.getByText('Payout History')).toBeInTheDocument();
    expect(screen.getByTestId('payouts-table')).toBeInTheDocument();
  });

  it('displays empty state when no orders', () => {
    render(
      <WalletTabs
        activeTab="orders"
        setActiveTab={mockSetActiveTab}
        soldOrders={[]}
        payouts={mockPayouts}
      />
    );
    
    expect(screen.getByText("You haven't sold any orders yet.")).toBeInTheDocument();
  });

  it('displays empty state when no payouts', () => {
    render(
      <WalletTabs
        activeTab="payouts"
        setActiveTab={mockSetActiveTab}
        soldOrders={mockOrders}
        payouts={[]}
      />
    );
    
    expect(screen.getByText("You haven't made any payout requests yet.")).toBeInTheDocument();
  });


});