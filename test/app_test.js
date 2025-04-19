import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('Matches Statistics App', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'Football', description: 'Team sport' },
          { id: 2, name: 'Basketball', description: 'Team sport with ball' }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10
        }
      }
    });
  });

  test('renders disciplines list', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Football')).toBeInTheDocument();
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });
  });

  test('handles login successfully', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt-token' }
    });

    render(<App />);
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'testpass' }
    });
    fireEvent.click(screen.getByText(/login/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/login',
        { username: 'testuser', password: 'testpass' }
      );
    });
  });

  test('shows error on failed login', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } }
    });

    render(<App />);
    
    fireEvent.click(screen.getByText(/login/i));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});