import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ProductCard from '../ProductCard';

// Mock axios
jest.mock('axios', () => ({
  defaults: { baseURL: 'http://localhost:5000' },
  post: jest.fn(),
}));

// Mock alert
global.alert = jest.fn();

describe('ProductCard Component', () => {
  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    price: 29.99,
    description: 'Test product description',
    pictures: ['test-image.jpg'],
    stock: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('Test product description')).toBeInTheDocument();
    expect(screen.getByText('Stock: 10')).toBeInTheDocument();
  });

  test('adds product to cart when button is clicked', async () => {
    axios.post.mockResolvedValue({
      data: { cart: { items: [], total: 0 } }
    });

    render(<ProductCard product={mockProduct} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/user/cart',
        { productId: '1', quantity: 1 },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });

    expect(global.alert).toHaveBeenCalledWith('Item added to cart!');
  });

  test('handles add to cart error', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: 'Failed to add to cart' } }
    });

    render(<ProductCard product={mockProduct} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Should not show success alert
    expect(global.alert).not.toHaveBeenCalledWith('Item added to cart!');
  });

  test('shows View Cart button after adding to cart', async () => {
    axios.post.mockResolvedValue({
      data: { cart: { items: [], total: 0 } }
    });

    render(<ProductCard product={mockProduct} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(screen.getByText('View Cart')).toBeInTheDocument();
    });
  });
});
