import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/login-form';
import { useAuth } from '@/providers/auth-provider';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/providers/auth-provider', () => ({
  useAuth: jest.fn(),
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: mockLogin,
    });
  });

  it('renders the form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
    expect(screen.getByText('Enter your email below to login to your account')).toBeInTheDocument();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it('validates email format correctly', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.input(emailInput, { target: { value: 'invalid-email' } });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates password length correctly', async () => {
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.input(passwordInput, { target: { value: '1234' } });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('shows validation errors for all fields on empty submission', async () => {
    render(<LoginForm />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('calls login function with correct data on valid submission', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    
    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });

  it('shows error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    
    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
  });

  it('redirects to home page if user is already logged in', () => {
    const mockRouter = { push: mockPush };
    (require('next/navigation').useRouter).mockReturnValue(mockRouter);
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      login: mockLogin,
    });
    
    render(<LoginForm />);
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});