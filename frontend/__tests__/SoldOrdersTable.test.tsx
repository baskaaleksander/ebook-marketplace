import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SoldOrdersTable from '../components/sold-orders-table';
import { Order, OrderStatus } from '@/lib/definitions';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

const mockProduct: any = {
  id: uuidv4(),
  title: "Mock Product",
  price: 49.99
};

const statuses = Object.values(OrderStatus);

const mockOrders: Order[] = Array(25).fill(null).map((_, index) => {
  const now = new Date();
  const createdAt = new Date(now.getTime() - index * 86400000).toISOString(); // Different days
  const updatedAt = new Date(now.getTime() - index * 43200000).toISOString(); // Different update times

  return {
    id: uuidv4(),
    sellerId: uuidv4(),
    buyerId: uuidv4(),
    isReviewed: Math.random() < 0.5,
    productId: mockProduct.id,
    product: mockProduct,
    refundId: Math.random() < 0.2 ? uuidv4() : null,
    amount: parseFloat((Math.random() * 100).toFixed(2)),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    checkoutSessionId: Math.random() < 0.5 ? uuidv4() : null,
    paymentUrl: Math.random() < 0.5 ? `https://pay.example.com/${uuidv4()}` : null,
    createdAt,
    updatedAt
  };
});


describe('SoldOrdersTable Component', () => {
  test('renders table with correct headers', () => {
    render(<SoldOrdersTable orders={mockOrders} />);
    
    expect(screen.getByRole('columnheader', { name: /order id/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /amount/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /refund id/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /buyer id/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /created/i })).toBeInTheDocument();
  });

  test('shows correct pagination info and first page items', () => {
    render(<SoldOrdersTable orders={mockOrders} />);
    
    // Check pagination caption
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    
    // Should display first 10 items
    expect(screen.getByText('order-1')).toBeInTheDocument();
    expect(screen.getByText('order-10')).toBeInTheDocument();
    expect(screen.queryByText('order-11')).not.toBeInTheDocument();
  });

  test('formats currency amounts correctly', () => {
    render(<SoldOrdersTable orders={mockOrders} />);
    
    // First item amount should be 10.00 (1000 cents)
    expect(screen.getByText('10.00')).toBeInTheDocument();
  });

  test('pagination controls change page correctly', () => {
    render(<SoldOrdersTable orders={mockOrders} />);
    
    // Initial page is 1
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText('order-1')).toBeInTheDocument();
    
    // Click next page
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Should now be on page 2
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText('order-11')).toBeInTheDocument();
    expect(screen.queryByText('order-1')).not.toBeInTheDocument();
    
    // Click page number 3
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    
    // Should now be on page 3
    expect(screen.getByText(/page 3 of 3/i)).toBeInTheDocument();
    expect(screen.getByText('order-21')).toBeInTheDocument();
    
    // Click previous page
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    
    // Should now be on page 2 again
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
  });

  test('pagination controls are disabled at boundaries', () => {
    render(<SoldOrdersTable orders={mockOrders} />);
    
    // On first page, Previous should be disabled
    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toHaveClass('pointer-events-none');
    
    // Go to last page
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    
    // On last page, Next should be disabled
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toHaveClass('pointer-events-none');
  });

  test('displays empty state correctly with no orders', () => {
    render(<SoldOrdersTable orders={[]} />);
    
    // No pagination should be shown
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    
    // Should show page 0 of 0
    expect(screen.getByText(/page 1 of 0/i)).toBeInTheDocument();
    
    // Should not have any order rows
    const tableBody = screen.getByRole('rowgroup', { name: '' });
    expect(within(tableBody).queryAllByRole('row')).toHaveLength(0);
  });

  test('handles orders with and without refund IDs', () => {
    render(<SoldOrdersTable orders={mockOrders.slice(0, 5)} />);
    
    // Check that refunded orders show refund ID
    const refundedOrderIndex = mockOrders.findIndex((order) => order.status === OrderStatus.REFUNDED);
    if (refundedOrderIndex < 5) {
      const expectedRefundId = mockOrders[refundedOrderIndex].refundId;
      expect(screen.getByText(expectedRefundId as string)).toBeInTheDocument();
    }
    
    // Check that completed orders show empty refund ID
    const completedOrderIndex = mockOrders.findIndex((order) => order.status === OrderStatus.COMPLETED);
    if (completedOrderIndex < 5) {
      // In the table, empty cells still have "" as content
      const cells = screen.getAllByText("");
      expect(cells.length).toBeGreaterThan(0);
    }
  });

  test('correctly formats dates', () => {
    render(<SoldOrdersTable orders={mockOrders.slice(0, 3)} />);
    
    // Check date formatting for the first order (created on 2023-01-01)
    const firstOrderDate = new Date(2023, 0, 1).toLocaleDateString();
    expect(screen.getByText(firstOrderDate)).toBeInTheDocument();
  });
});