import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/login-form';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

// Mock the auth provider
jest.mock('@/providers/auth-provider', () => ({
  useAuth: jest.fn(
    () => ({
      login: jest.fn(),
      user: null,
    })
  ),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      user: null
    });
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  test('renders login form correctly', () => {
    render(<LoginForm />);
    
    // Check for main elements
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    render(<LoginForm />);
    
    // Get form elements
    const emailInput = screen.getByLabelText(/Email/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    // Input invalid email and submit
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  test('validates password length', async () => {
    render(<LoginForm />);
    
    // Get form elements
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    // Input too short password and submit
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    // Mock login to be slow
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LoginForm />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Check loading state
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    
    // Wait for promise to resolve
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('shows error message when login fails', async () => {
    mockLogin.mockRejectedValue({
      message: 'Invalid credentials',
      response: {
        status: 401,
        data: { message: 'Invalid credentials' }
      }
    });
    
    render(<LoginForm />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Add a more robust way to detect errors
    await waitFor(() => {
      // Look for any elements that might contain error messages
      const errorElements = document.querySelectorAll('[class*="text-red"], [class*="bg-red"]');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  test('redirects to home page when user is already authenticated', async () => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      user: { id: '123', email: 'test@example.com' }
    });
    
    render(<LoginForm />);
    
    // Check if router.push was called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

test('submits form with valid data', async () => {

  mockLogin.mockResolvedValue({});

  
  render(<LoginForm />);

  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/Password/i), {
    target: { value: 'password123' },
  });

  fireEvent.click(screen.getByRole('button', { name: /Login/i }));

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});

  test('forgot password link exists', () => {
    render(<LoginForm />);
    
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.tagName.toLowerCase()).toBe('a');
    expect(forgotPasswordLink).toHaveAttribute('href', '#');
  });

  test('sign up link navigates to register page', () => {
    render(<LoginForm />);
    
    const signUpLink = screen.getByText('Sign up');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/register');
  });
});