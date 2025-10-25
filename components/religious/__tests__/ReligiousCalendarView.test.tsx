import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReligiousCalendarView from '../ReligiousCalendarView';
import { Location } from '../../../types';

// Mock all religious services
vi.mock('../../../services/religious/IslamicCalendarService', () => ({
  IslamicCalendarService: vi.fn().mockImplementation(() => ({
    getIslamicHolidays: vi.fn().mockResolvedValue([
      {
        id: 'islamic-1447-9-1',
        name: 'First Day of Ramadan',
        tradition: 'islam',
        date: new Date('2025-10-25'),
        description: 'The beginning of the holy month of fasting.',
        significance: 'Muslims fast from dawn to sunset throughout this month.',
        astronomicalBasis: 'Based on the sighting of the new moon of Ramadan',
        observanceType: 'fast'
      }
    ])
  }))
}));

vi.mock('../../../services/religious/JewishCalendarService', () => ({
  JewishCalendarService: vi.fn().mockImplementation(() => ({
    getJewishObservances: vi.fn().mockResolvedValue([])
  }))
}));

vi.mock('../../../services/religious/ChristianCalendarService', () => ({
  ChristianCalendarService: vi.fn().mockImplementation(() => ({
    getLiturgicalEvents: vi.fn().mockResolvedValue([])
  }))
}));

describe('ReligiousCalendarView', () => {
  const mockLocation: Location = {
    latitude: 40.7128,
    longitude: -74.0060,
    elevation: 10,
    timezone: 'America/New_York'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );
    expect(screen.getByText(/loading calendar/i)).toBeInTheDocument();
  });

  it('renders calendar in month view by default', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    // Should show month/year header
    const monthYear = screen.getByText(/\w+ \d{4}/);
    expect(monthYear).toBeInTheDocument();
  });

  it('renders week day headers', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('renders navigation buttons', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /month view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /week view/i })).toBeInTheDocument();
  });

  it('switches to week view when week button is clicked', async () => {
    const mockOnViewModeChange = vi.fn();
    
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
        onViewModeChange={mockOnViewModeChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    const weekButton = screen.getByRole('button', { name: /week view/i });
    fireEvent.click(weekButton);

    expect(mockOnViewModeChange).toHaveBeenCalledWith('week');
  });

  it('navigates to previous month when previous button is clicked', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    const initialMonth = screen.getByText(/\w+ \d{4}/);
    const initialMonthText = initialMonth.textContent;

    const previousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(previousButton);

    await waitFor(() => {
      const newMonth = screen.getByText(/\w+ \d{4}/);
      expect(newMonth.textContent).not.toBe(initialMonthText);
    });
  });

  it('navigates to next month when next button is clicked', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    const initialMonth = screen.getByText(/\w+ \d{4}/);
    const initialMonthText = initialMonth.textContent;

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      const newMonth = screen.getByText(/\w+ \d{4}/);
      expect(newMonth.textContent).not.toBe(initialMonthText);
    });
  });

  it('applies correct ARIA labels for accessibility', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    const monthButton = screen.getByRole('button', { name: /month view/i });
    expect(monthButton).toHaveAttribute('aria-pressed');

    const weekButton = screen.getByRole('button', { name: /week view/i });
    expect(weekButton).toHaveAttribute('aria-pressed');
  });

  it('displays events on calendar days', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    // Should show the event name on the calendar
    await waitFor(() => {
      expect(screen.getByText('First Day of Ramadan')).toBeInTheDocument();
    });
  });

  it('supports multiple traditions overlay', async () => {
    render(
      <ReligiousCalendarView
        location={mockLocation}
        selectedTraditions={['islam', 'judaism', 'christianity']}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading calendar/i)).not.toBeInTheDocument();
    });

    // Component should load without errors when multiple traditions are selected
    expect(screen.getByText(/\w+ \d{4}/)).toBeInTheDocument();
  });
});
