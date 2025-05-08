import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../components/register-form';
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

describe('RegisterForm', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      register: jest.fn(),
    });
  });

  it('renders the form correctly', () => {
    render(<RegisterForm />);
    
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    
    const passwordInputs = screen.getAllByLabelText(/password/i);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
    
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('validates specific fields correctly', async () => {
    const { container } = render(<RegisterForm />);
  
    fireEvent.input(screen.getByPlaceholderText('John'), { target: { value: 'J' } }); // name
    fireEvent.input(screen.getByPlaceholderText('Doe'), { target: { value: 'D' } }); // surname
    fireEvent.input(screen.getByPlaceholderText('john.doe@example.com'), { target: { value: 'john.doe' } }); // email
    fireEvent.input(screen.getByLabelText(/^Password$/i), { target: { value: '123' } }); // password
    fireEvent.input(screen.getByLabelText(/Confirm Password/i), { target: { value: '123' } }); // confirmPassword
  
    // const registerButton = screen.getByRole('button', { name: /register/i });
    // fireEvent.click(registerButton);
    
    await waitFor(() => {
      const formText = container.textContent;
      
      expect(formText).toContain('Name must be at least 2 characters');
      expect(formText).toContain('Surname must be at least 2 characters');
      expect(formText).toContain('Please enter a valid email address');
      expect(formText).toContain('Password must be at least 6 characters');
      expect(formText).toContain('You must accept the terms and conditions');
    });
  });

  it('shows validation errors for all fields on empty submission', async () => {
    const { container } = render(<RegisterForm />);
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      const formText = container.textContent;
      
      expect(formText).toContain('Name must be at least 2 characters');
      expect(formText).toContain('Surname must be at least 2 characters');
      expect(formText).toContain('Please enter a valid email address');
      expect(formText).toContain('Password must be at least 6 characters');
      expect(formText).toContain('You must accept the terms and conditions');
    });
  });
});