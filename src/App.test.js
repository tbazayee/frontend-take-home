import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders npm search input and search button', () => {
  render(<App />);
  const searchInput = screen.getByTestId('test-id-input');
  const searchButton = screen.getByTestId('test-id-search-button');

  expect(searchInput).toBeInTheDocument();
  expect(searchButton).toBeInTheDocument();
});

test('should show search suggestions after typing search term', async () => {
  render(<App />);
  const searchInput = screen.getByTestId('test-id-input');

  expect(searchInput.value).toBe('');
  //typing in search input.
  fireEvent.change(searchInput, { target: { value: 'react' } });
  //awaiting for the debounce time after input change.
  await waitFor(
    () => {
      const suggestions = screen.getAllByTestId('suggestion');
      expect(suggestions[0]).toBeInTheDocument();
    },
    { timeout: 1500 }
  );
});

test('should show error message when service return bad request', async () => {
  render(<App />);
  const searchInput = screen.getByTestId('test-id-input');

  expect(searchInput.value).toBe('');
  //typing in bad input.
  fireEvent.change(searchInput, { target: { value: '&*()' } });
  //awaiting for the debounce time after input change.
  await waitFor(
    () => {
      const errorMsg = screen.getByTestId('test-id-error');
      expect(errorMsg).toBeInTheDocument();
    },
    { timeout: 1500 }
  );
});
