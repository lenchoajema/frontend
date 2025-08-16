import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import CartPage from '../CartPage';
import cartReducer from '../../redux/cartSlice';
import authReducer from '../../redux/authSlice';

// Mock axios
jest.mock('axios', () => ({
  defaults: { baseURL: 'http://localhost:5000' },
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  post: jest.fn(),
}));

// Mock alert
global.alert = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => 'fake-token'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component, initialState = {}) => {
  const store = createTestStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('CartPage Component', () => {
  const mockCartData = {
    items: [
      {
        productId: '1',
        name: 'Test Product',
        price: 29.99,
        quantity: 2,
        pictures: ['test-image.jpg']
      }
    ],
    total: 59.98
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty cart message when cart is empty', async () => {
    axios.get.mockResolvedValue({ data: { items: [], total: 0 } });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });
  });

  test('renders cart items correctly', async () => {
    axios.get.mockResolvedValue({ data: mockCartData });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Price: $29.99')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
      expect(screen.getByText('Total: $59.98')).toBeInTheDocument();
    });
  });

  test('updates item quantity', async () => {
    axios.get.mockResolvedValue({ data: mockCartData });
    axios.put.mockResolvedValue({ 
      data: { 
        cart: { 
          items: [{ ...mockCartData.items[0], quantity: 3 }], 
          total: 89.97 
        } 
      } 
    });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      const increaseButton = screen.getByText('+');
      fireEvent.click(increaseButton);
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/user/cart/1',
        { quantity: 3 },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });

  test('removes item from cart', async () => {
    axios.get.mockResolvedValue({ data: mockCartData });
    axios.delete.mockResolvedValue({ data: { message: 'Item removed' } });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        '/api/user/cart/1',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });

  test('places order successfully', async () => {
    axios.get.mockResolvedValue({ data: mockCartData });
    axios.post.mockResolvedValue({ data: { message: 'Order placed successfully' } });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/orders',
        {},
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(global.alert).toHaveBeenCalledWith('Order placed successfully!');
    });
  });

  test('navigates to checkout page', async () => {
    axios.get.mockResolvedValue({ data: mockCartData });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      const checkoutButton = screen.getByText('Checkout');
      fireEvent.click(checkoutButton);
    });

    // Navigation would be tested in integration tests
  });
});
