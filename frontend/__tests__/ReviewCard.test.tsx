import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewCard from '../components/review-card';
import { Review } from '@/lib/definitions';
import { useAuth } from '@/providers/auth-provider';
import api from '@/utils/axios';

// Mock dependencies
jest.mock('@/providers/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/utils/axios', () => ({
  put: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}));

jest.mock('../components/star-rating', () => ({
  __esModule: true,
  default: ({ rating, editable, onChange }) => (
    <div data-testid="star-rating" data-rating={rating} data-editable={editable || false}>
      {editable && <button onClick={() => onChange && onChange(4)} data-testid="change-rating">Change Rating</button>}
      Star Rating: {rating}
    </div>
  ),
}));

// Mock window.location
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    reload: mockReload,
  },
  writable: true,
});

describe('ReviewCard', () => {
  // Define a sample review for testing
  const mockReview: Review = {
    id: 'review-1',
    rating: 4.5,
    comment: 'This is a great product!',
    productId: 'product-1',
    createdAt: '2025-05-01T10:30:00Z',
    buyer: {
      id: 'user-1',
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      avatarUrl: undefined,
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Default auth state - not logged in
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });
  });
  
  test('renders review information correctly', () => {
    render(<ReviewCard review={mockReview} withProductLink={false} />);
    
    // Check user information
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(new Date(mockReview.createdAt).toLocaleDateString())).toBeInTheDocument();
    
    // Check review content
    expect(screen.getByText('This is a great product!')).toBeInTheDocument();
    expect(screen.getByTestId('star-rating')).toHaveAttribute('data-rating', '4.5');
    
    // Avatar should be present
    expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
  });
  
  test('does not show edit/delete buttons when user is not the review author', () => {
    // Set current user as different from review author
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'different-user' },
    });
    
    render(<ReviewCard review={mockReview} withProductLink={false} />);
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
  
  test('shows edit/delete buttons when user is the review author', () => {
    // Set current user as the review author
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
    });
    
    render(<ReviewCard review={mockReview} withProductLink={false} />);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
  
  test('shows "View Product" button when withProductLink is true', () => {
    render(<ReviewCard review={mockReview} withProductLink={true} />);
    
    expect(screen.getByText('View Product')).toBeInTheDocument();
  });
  
  test('does not show "View Product" button when withProductLink is false', () => {
    render(<ReviewCard review={mockReview} withProductLink={false} />);
    
    expect(screen.queryByText('View Product')).not.toBeInTheDocument();
  });
  
  test('opens edit dialog when Edit button is clicked', () => {
    // Set current user as the review author
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
    });
    
    render(<ReviewCard review={mockReview} withProductLink={false} />);
    // Click the Edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Check if dialog is opened
    expect(screen.getByText('Edit review')).toBeInTheDocument();
    expect(screen.getAllByTestId('star-rating')[1]).toHaveAttribute('data-editable', 'true');
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
  
  test('edits review when edit form is submitted', async () => {
    // Set current user as the review author
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
    });
    
    render(<ReviewCard review={mockReview} withProductLink={false} />);
    
    // Open edit dialog
    fireEvent.click(screen.getByText('Edit'));
    
    // Edit the review
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Updated comment' } });
    fireEvent.click(screen.getByTestId('change-rating')); // Changes rating to 4
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check if API call was made correctly
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        `/listing/reviews/${mockReview.id}`,
        {
          comment: 'Updated comment',
          rating: 4
        }
      );
    });
  });
  
  
  
  test('redirects to product page when "View Product" button is clicked', () => {
    render(<ReviewCard review={mockReview} withProductLink={true} />);
    
    // Click the "View Product" button
    fireEvent.click(screen.getByText('View Product'));
    
    // Check if redirect was triggered
    expect(window.location.href).toBe(`/product/${mockReview.productId}`);
  });
  
  
  test('handles error when updating review', async () => {
    // Mock console.error to check error logging
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock API to throw error
    (api.put as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));
    
    // Set current user as the review author
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
    });
    
    render(<ReviewCard review={mockReview} withProductLink={false} />);
    
    // Open edit dialog
    fireEvent.click(screen.getByText('Edit'));
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check if error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update review:',
        expect.any(Error)
      );
    });
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});