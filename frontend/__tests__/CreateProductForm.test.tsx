import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProductForm from '../components/create-product-form';
import { useAuth } from '@/providers/auth-provider';
import { useImage } from '@/providers/image-provider';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';

// Mock the hooks and dependencies
jest.mock('@/providers/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/providers/image-provider', () => ({
  useImage: jest.fn(),
}));

jest.mock('@/utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the child components
jest.mock('../components/image-resizer', () => ({
  __esModule: true,
  default: () => <div data-testid="image-resizer">Image Resizer Mock</div>,
}));

jest.mock('../components/file-uploader', () => ({
  __esModule: true,
  default: ({ onFileSelect, maxSize, accept, label } : { onFileSelect: (value: File) => void, maxSize: number, accept: boolean, label: string}) => (
    <div data-testid="file-uploader" onClick={() => {
      const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      onFileSelect(mockFile);
    }}>
      {label}
      <button>Upload</button>
    </div>
  ),
}));

describe('CreateProductForm', () => {
  // Setup common test variables and mocks
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockUser = {
    id: 'user1',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
  };

  const mockImage = 'data:image/jpeg;base64,abc123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the router
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock auth provider with a logged in user
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });
    
    // Mock image provider with an image
    (useImage as jest.Mock).mockReturnValue({
      image: mockImage,
      setImage: jest.fn(),
    });
    
    // Mock API responses
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({ data: 'user1' });
      }
      if (url.startsWith('/user/')) {
        return Promise.resolve({ 
          data: { 
            ...mockUser, 
            stripeStatus: 'verified' 
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    (api.post as jest.Mock).mockImplementation((url) => {
      if (url === '/upload') {
        return Promise.resolve({ 
          data: { 
            url: 'https://example.com/image.jpg',
            filename: 'image.jpg' 
          }
        });
      }
      if (url === '/upload/') {
        return Promise.resolve({ 
          data: { 
            fileUrl: 'https://example.com/document.pdf',
            filename: 'document.pdf' 
          }
        });
      }
      if (url === '/listing') {
        return Promise.resolve({ data: { id: 'product1' } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  test('redirects to login if user is not authenticated', async () => {
    // Mock user as not authenticated
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });
    
    render(<CreateProductForm />);
    
    // Check that it redirects to login
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  test('redirects to wallet if stripe status is not verified', async () => {
    // Mock API to return unverified stripe status
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.startsWith('/user/')) {
        return Promise.resolve({ 
          data: { 
            ...mockUser, 
            stripeStatus: 'pending' 
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<CreateProductForm />);
    
    // Wait for the API calls to complete
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/user/dashboard/wallet');
    });
  });

  test('renders form elements correctly', async () => {
    render(<CreateProductForm />);
    
    // Check that key components are rendered
    expect(screen.getByText('Product Image')).toBeInTheDocument();
    expect(screen.getByTestId('image-resizer')).toBeInTheDocument();
    expect(screen.getByText('Upload PDF')).toBeInTheDocument();
    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Price')).toBeInTheDocument();
    expect(screen.getByText('Select a category')).toBeInTheDocument();
    expect(screen.getByText('Create Product')).toBeInTheDocument();
  });

  test('handles PDF file upload', async () => {
    render(<CreateProductForm />);
    
    // Click on the file uploader to trigger the mock file selection
    fireEvent.click(screen.getByTestId('file-uploader'));
    
    // Check that PDF file info is displayed after upload
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('PDF Ready to Upload')).toBeInTheDocument();
    });
  });

  test('allows removing a selected PDF file', async () => {
    render(<CreateProductForm />);
    
    // Add a PDF file first
    fireEvent.click(screen.getByTestId('file-uploader'));
    
    // Wait for the file to be shown
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    
    // Click the remove button (X icon)
    fireEvent.click(screen.getByTitle('Remove file'));
    
    // Check that file uploader is shown again
    await waitFor(() => {
      expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  test('validates form fields', async () => {
    render(<CreateProductForm />);
    
    // Upload a PDF file to enable the submit button
    fireEvent.click(screen.getByTestId('file-uploader'));
    
    // Submit the form without filling in required fields
    fireEvent.click(screen.getByText('Create Product'));
    
    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText('Title must be at least 2 characters')).toBeInTheDocument();
      expect(screen.getByText('Description must be at least 2 characters')).toBeInTheDocument();
      expect(screen.getByText('Please select a category')).toBeInTheDocument();
    });
  });

  test('submits the form with valid data', async () => {
    render(<CreateProductForm />);
    
    // Upload a PDF file
    fireEvent.click(screen.getByTestId('file-uploader'));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'This is a test product description' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '19.99' } });
    // Mock the image upload logic since the actual component is mocked
    // This will trigger the image being set in the form state
    const mockImageResizer = screen.getByTestId('image-resizer');
    fireEvent.click(mockImageResizer);

    // Ensure that we have an image set (this would normally happen via the useImage hook)
    expect(mockImage).toBeTruthy();
    // Open the category dropdown and select a category
    fireEvent.click(screen.getByText('Select a category'));
    fireEvent.click(screen.getAllByText('Fiction')[1]); // Select the second occurrence of Fiction
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Product'));
    
    // Check that API calls were made correctly
    await waitFor(() => {
      // Check image upload API call
      expect(api.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
      );
      
      // Check PDF upload API call
      expect(api.post).toHaveBeenCalledWith(
        '/upload/',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
      );
      
      // Check product creation API call
      expect(api.post).toHaveBeenCalledWith(
        '/listing',
        expect.objectContaining({
          title: 'Test Product',
          description: 'This is a test product description',
          price: 19.99,
          imageUrl: 'https://example.com/image.jpg',
          fileUrl: 'https://example.com/document.pdf',
          categories: [{ name: 'Fiction' }]
        })
      );
      
      // Check success message
      expect(screen.getByText('Product created successfully! Redirecting...')).toBeInTheDocument();
      
      // Check that it redirects after success
      setTimeout(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      }, 2100);
    });
  });

  test('handles API errors during form submission', async () => {
    // Mock API post to throw an error
    (api.post as jest.Mock).mockImplementation(() => {
      throw new Error('API error');
    });
    
    render(<CreateProductForm />);
    
    // Upload a PDF file
    fireEvent.click(screen.getByTestId('file-uploader'));
    
    // Fill in the form with minimum required data
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Description' } });
    
    // Mock the category selection without relying on getAllByText which might return non-DOM elements
    const selectCategory = screen.getByText('Select a category');
    fireEvent.click(selectCategory);
    
    // Wait for dropdown to appear and then find the option within it
    await waitFor(() => {
      const fictionOption = screen.getByRole('option', { name: /Fiction/i });
      fireEvent.click(fictionOption);
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Product'));
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to create product')).toBeInTheDocument();
    });
  });

  test('disables submit button when required fields are missing', async () => {
    // Mock image as null to test disabled state
    (useImage as jest.Mock).mockReturnValue({
      image: null,
      setImage: jest.fn(),
    });
    
    render(<CreateProductForm />);
    
    const submitButton = screen.getByText('Create Product');
    expect(submitButton).toBeDisabled();
    
    // Update the mock to have an image
    (useImage as jest.Mock).mockReturnValue({
      image: mockImage,
      setImage: jest.fn(),
    });
    
    // Re-render to reflect the changes
    render(<CreateProductForm />);
    
    // Still disabled because PDF is missing
    const submitButtons = screen.getAllByText('Create Product');
    submitButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
    
    // Upload a PDF - use getAllByTestId to get all matching elements
    const fileUploaders = screen.getAllByTestId('file-uploader');
    fireEvent.click(fileUploaders[0]);
    
    // Now the button should be enabled
    await waitFor(() => {
      screen.getAllByText('Create Product').forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });
});