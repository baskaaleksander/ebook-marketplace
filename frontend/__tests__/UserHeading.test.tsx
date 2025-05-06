import { render, screen } from '@testing-library/react';
import UserHeading from '../components/user-heading';
import { useAuth } from '@/providers/auth-provider';
import { UserData } from '@/lib/definitions';

// Mock dependencies
jest.mock('@/providers/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../components/user-heading-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="skeleton-loader">Loading skeleton</div>,
}));

jest.mock('../components/star-rating', () => ({
  __esModule: true,
  default: ({ rating }: { rating: number }) => (
    <div data-testid="star-rating">Rating: {rating}</div>
  ),
}));

// Mock the tooltip components
jest.mock('../components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="tooltip-trigger" className={className || ''}>{children}</div>
  ),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} data-testid="next-link">{children}</a>
  ),
}));

describe('UserHeading', () => {
  // Sample user data for testing
  const mockUserData: UserData = {
    id: 'user123',
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    stripeStatus: 'verified',
    avatarUrl: 'https://example.com/avatar.jpg',
    description: 'Test user description',
    rating: 4.5,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default auth state - not the profile user
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'different-user' },
    });
  });

  test('renders skeleton loader when loading=true', () => {
    render(<UserHeading userData={mockUserData} loading={true} />);
    
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('renders skeleton loader when userData is undefined', () => {
    render(<UserHeading userData={undefined as unknown as UserData} loading={false} />);
    
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  test('renders user information correctly', () => {
    render(<UserHeading userData={mockUserData} loading={false} />);
    
    // Check user name
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check user ID in tooltip
    expect(screen.getByText('user123')).toBeInTheDocument();
    
    // Check star rating
    expect(screen.getByTestId('star-rating')).toBeInTheDocument();
    expect(screen.getByText('Rating: 4.5')).toBeInTheDocument();
    expect(screen.getByText('(4.5)')).toBeInTheDocument();
    
    // Check description
    expect(screen.getByText('Test user description')).toBeInTheDocument();
    
    // Check email
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com').closest('a')).toHaveAttribute('href', 'mailto:john.doe@example.com');
    
    // Check member since date
    expect(screen.getByText('Member since: 1/1/2024')).toBeInTheDocument();
  });

  test('shows verification badge when stripeStatus is verified', () => {
    render(<UserHeading userData={mockUserData} loading={false} />);
    
    // Check that verification icon is present
    // Since we can't easily target the FaCheckCircle component directly,
    // we can check that it's rendered by looking at the parent element structure
    const nameElement = screen.getByText('John Doe').closest('h2');
    expect(nameElement?.innerHTML).toContain('text-blue-500');
  });

  test('does not show verification badge when stripeStatus is not verified', () => {
    const unverifiedUser = { ...mockUserData, stripeStatus: 'pending' };
    render(<UserHeading userData={unverifiedUser} loading={false} />);
    
    // Check that verification icon is not present
    const nameElement = screen.getByText('John Doe').closest('h2');
    expect(nameElement?.innerHTML).not.toContain('text-blue-500');
  });

  test('does not show edit profile button when viewing another user', () => {
    // Set current user as different from profile
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'different-user' },
    });
    
    render(<UserHeading userData={mockUserData} loading={false} />);
    
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  test('shows edit profile button when viewing own profile', () => {
    // Set current user as same as profile
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user123' },
    });
    
    render(<UserHeading userData={mockUserData} loading={false} />);
    
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile').closest('a')).toHaveAttribute('href', '/user/dashboard/settings');
  });

  test('does not show description when it is not provided', () => {
    const userWithoutDescription = { ...mockUserData, description: undefined };
    render(<UserHeading userData={userWithoutDescription} loading={false} />);
    
    expect(screen.queryByText('Test user description')).not.toBeInTheDocument();
  });

  test('uses avatar URL when provided', () => {
    render(<UserHeading userData={mockUserData} loading={false} />);
    
    const avatar = screen.getByAltText('User Avatar');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('uses generated avatar when avatarUrl is not provided', () => {
    const userWithoutAvatar = { ...mockUserData, avatarUrl: undefined };
    render(<UserHeading userData={userWithoutAvatar} loading={false} />);
    
    const avatar = screen.getByAltText('User Avatar');
    expect(avatar).toHaveAttribute('src', 'https://ui-avatars.com/api/?name=John+Doe&bold=true');
  });

  test('links to user reviews page', () => {
    render(<UserHeading userData={mockUserData} loading={false} />);
    
    // Find the link that contains the star rating
    const links = screen.getAllByTestId('next-link');
    const reviewsLink = links.find(link => 
      link.getAttribute('href') === `/user/${mockUserData.id}/reviews`
    );
    
    expect(reviewsLink).toBeInTheDocument();
    expect(reviewsLink).toContainElement(screen.getByTestId('star-rating'));
  });

  test('has tooltip for user rating', () => {
    render(<UserHeading userData={mockUserData} loading={false} />);
    
    const ratingTooltipTrigger = screen.getAllByTestId('tooltip-trigger')
      .find(element => element.textContent?.includes('4.5'));
      
    expect(ratingTooltipTrigger).toBeInTheDocument();
    
    const tooltipContent = screen.getAllByTestId('tooltip-content')
      .find(element => element.textContent === 'Average rating');
      
    expect(tooltipContent).toBeInTheDocument();
  });
});