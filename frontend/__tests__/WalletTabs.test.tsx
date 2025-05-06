import { render, screen, fireEvent } from '@testing-library/react';
import WalletTabs from '@/components/wallet-tabs';
import { Order, Payout } from '@/lib/definitions';

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
      productId: 'book-1',
      amount: 1000,
      status: 'completed',
      createdAt: '2023-05-01T00:00:00.000Z',
      title: 'Book 1',
    }
  ];
  
  const mockPayouts: Payout[] = [
    {
      id: 'payout-1',
      amount: 5000,
      status: 'paid',
      createdAt: '2023-05-02T00:00:00.000Z',
      arrivalDate: '2023-05-05T00:00:00.000Z',
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