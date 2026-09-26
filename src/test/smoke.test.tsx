import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Milestone 0 Smoke Test', () => {
  it('renders application title without errors', () => {
    render(<App />);
    expect(screen.getByText(/Charitas IT System/i)).toBeInTheDocument();
    expect(screen.getByText(/Charitas IT Issue & FAQ Portal/i)).toBeInTheDocument();
  });
});
