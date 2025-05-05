import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import FilteringBar from '../components/filtering-bar';
import { useFiltering } from '@/providers/filtering-provider';
import { useSearchParams } from 'next/navigation';

// Mock the hooks
jest.mock('@/providers/filtering-provider', () => ({
  useFiltering: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Filter: () => <div data-testid="filter-icon">Filter Icon</div>,
}));

// Mock shadcn/ui components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button data-testid={props.variant === "outline" && children.includes("Filters") ? "filters-button" : undefined} {...props}>{children}</button>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div role="dialog">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children, ...props }: any) => <div role="combobox" data-testid={props['data-testid']} aria-label={props['aria-label']}>{children}</div>,
  SelectValue: ({ children }: any) => <span>{children}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div role="option" data-value={value}>{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

describe('FilteringBar', () => {
  // Setup common mocks and test data
  const mockSetFiltering = jest.fn();
  const defaultFiltering = {
    query: undefined,
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    sortOrder: 'desc',
    sortBy: 'createdAt',
    featured: undefined,
  };

  const mockSearchParams = {
    get: jest.fn((param) => {
      switch (param) {
        case 'query': return null;
        case 'category': return null;
        case 'minPrice': return null;
        case 'maxPrice': return null;
        case 'featured': return null;
        case 'sortBy': return null;
        case 'sortOrder': return null;
        default: return null;
      }
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useFiltering as jest.Mock).mockReturnValue({
      filtering: { ...defaultFiltering },
      setFiltering: mockSetFiltering,
    });
    
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  test('renders filtering and sorting controls', () => {
    render(<FilteringBar />);
    
    // Check filtering button exists
    const filterButton = screen.getByTestId('filters-button');
    expect(filterButton).toBeInTheDocument();
    
    // Check sorting dropdown exists
    const sortDropdown = screen.getByRole('combobox', { name: /sort by/i });
    expect(sortDropdown).toBeInTheDocument();
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
  });

  test('opens filter dialog when filter button is clicked', () => {
    render(<FilteringBar />);
    
    // Click the filter button
    fireEvent.click(screen.getByTestId('filters-button'));
    
    // Check dialog is open with filter content
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Filter Products')).toBeInTheDocument();
    
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    
    expect(screen.getByText('Category')).toBeInTheDocument();
    // Use getAllByRole instead of getByRole since there are multiple comboboxes
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    
    expect(screen.getByText('Featured Only')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  test('updates local filters when search input changes', () => {
    render(<FilteringBar />);
    
    // Open the filter dialog
    fireEvent.click(screen.getByTestId('filters-button'));
    
    // Change the search input
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    // Apply filters
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    
    // Check if setFiltering was called with the updated value
    expect(mockSetFiltering).toHaveBeenCalledWith(expect.objectContaining({
      query: 'test query',
    }));
  });

  test('updates local filters when category is selected', () => {
    render(<FilteringBar />);
    
    // Open the filter dialog
    fireEvent.click(screen.getByTestId('filters-button'));
    
    // First find the category section by its label, then find the nearby combobox
    const categoryLabel = screen.getByText('Category');
    // We need to get the combobox that's near the Category label
    // This can be done by looking at the closest parent element that contains both
    const categorySection = categoryLabel.closest('div');
    const categoryCombobox = categorySection ? within(categorySection).getByRole('combobox') : null;
    
    // Click on the category dropdown
    expect(categoryCombobox).not.toBeNull();
    if (categoryCombobox) {
      fireEvent.click(categoryCombobox);
    }
    
    // Select "Fiction" option
    fireEvent.click(screen.getByRole('option', { name: 'Fiction' }));
    
    // Apply filters
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Check if setFiltering was called with the updated value
    expect(mockSetFiltering).toHaveBeenCalledWith(expect.objectContaining({
      category: 'fiction',
    }));
  });

  test('updates local filters when price range changes', () => {
    render(<FilteringBar />);
    
    // Open the filter dialog
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    
    // Change the min price input
    const minPriceInput = screen.getByPlaceholderText('Min');
    fireEvent.change(minPriceInput, { target: { value: '10' } });
    
    // Change the max price input
    const maxPriceInput = screen.getByPlaceholderText('Max');
    fireEvent.change(maxPriceInput, { target: { value: '50' } });
    
    // Apply filters
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    
    // Check if setFiltering was called with the updated values
    expect(mockSetFiltering).toHaveBeenCalledWith(expect.objectContaining({
      minPrice: 10,
      maxPrice: 50,
    }));
  });

  test('updates filters when featured checkbox is checked', () => {
    render(<FilteringBar />);
    
    // Open the filter dialog
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    
    // Check the featured checkbox
    const featuredCheckbox = screen.getByLabelText('Featured Only');
    fireEvent.click(featuredCheckbox);
    
    // Apply filters
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    
    // Check if setFiltering was called with the featured flag set to true
    expect(mockSetFiltering).toHaveBeenCalledWith(expect.objectContaining({
      featured: true,
    }));
  });

  test('resets filters when reset button is clicked', () => {
    // Set some initial filter values
    (useFiltering as jest.Mock).mockReturnValue({
      filtering: {
        query: 'test',
        category: 'fiction',
        minPrice: 10,
        maxPrice: 50,
        sortOrder: 'desc',
        sortBy: 'title',
        featured: true,
      },
      setFiltering: mockSetFiltering,
    });
    
    render(<FilteringBar />);
    
    // Open the filter dialog
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    
    // Click the reset button
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    
    // Check if setFiltering was called with the default values
    expect(mockSetFiltering).toHaveBeenCalledWith({
      query: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      featured: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  test('changing sort dropdown updates filtering', () => {
    render(<FilteringBar />);
    
    // Open the sort dropdown
    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }));
    
    // Select "Price: Low to High" option
    fireEvent.click(screen.getByRole('option', { name: /price: low to high/i }));
    
    // Check if setFiltering was called with the correct sort parameters
    expect(mockSetFiltering).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'price',
      sortOrder: 'asc',
    }));
  });

  test('initializes filters from URL search params', () => {
    // Mock search params with values
    const mockParamsWithValues = {
      get: jest.fn((param) => {
        switch (param) {
          case 'query': return 'test query';
          case 'category': return 'fiction';
          case 'minPrice': return '10';
          case 'maxPrice': return '50';
          case 'featured': return 'true';
          case 'sortBy': return 'price';
          case 'sortOrder': return 'asc';
          default: return null;
        }
      }),
    };
    
    (useSearchParams as jest.Mock).mockReturnValue(mockParamsWithValues);
    
    render(<FilteringBar />);
    
    // Open the filter dialog to check if values were loaded correctly
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
    
    // Check if search field has value from URL
    expect(screen.getByLabelText('Search')).toHaveValue('test query');
    
    // Check minimum price field
    expect(screen.getByPlaceholderText('Min')).toHaveValue(10);
    
    // Check maximum price field
    expect(screen.getByPlaceholderText('Max')).toHaveValue(50);
    
    // Check if checkbox is checked
    expect(screen.getByLabelText('Featured Only')).toBeChecked();
    
    // Close dialog
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    
    // Check sort value
    expect(screen.getByRole('combobox', { name: /sort by/i })).toHaveTextContent('Price: Low to High');
  });

  test('displays active filter indicator when filters are applied', () => {
    // Set active filters
    (useFiltering as jest.Mock).mockReturnValue({
      filtering: {
        query: 'test',
        category: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortOrder: 'desc',
        sortBy: 'createdAt',
        featured: undefined,
      },
      setFiltering: mockSetFiltering,
    });
    
    render(<FilteringBar />);
    
    // Check if filter button has active indicator
    const filterButton = screen.getByTestId('filters-button');
    expect(filterButton).toContainElement(screen.getByText(''));
  });

  test('closes dialog when applying filters', () => {
    render(<FilteringBar />);
    
    // Open the filter dialog
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Apply filters
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    
    // Check if dialog is closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});