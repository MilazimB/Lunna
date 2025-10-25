import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventList from '../EventList';
import { LunarEvent, ReligiousEvent } from '../../types';
import { beforeEach } from 'node:test';

const mockLunarEvents: LunarEvent[] = [
  {
    eventName: 'New Moon',
    utcDate: new Date('2024-01-01T12:00:00Z'),
    localSolarDate: new Date('2024-01-01T12:00:00Z'),
    julianDate: 2460310.0,
    accuracyNote: 'Test accuracy note'
  },
  {
    eventName: 'Full Moon',
    utcDate: new Date('2024-01-15T18:00:00Z'),
    localSolarDate: new Date('2024-01-15T18:00:00Z'),
    julianDate: 2460325.25,
    accuracyNote: 'Test accuracy note'
  }
];

const mockReligiousEvents: ReligiousEvent[] = [
  {
    id: 'test-islamic-event',
    name: 'Eid al-Fitr',
    tradition: 'islam',
    date: new Date('2024-01-10T00:00:00Z'),
    description: 'Festival of Breaking the Fast',
    significance: 'Marks the end of Ramadan',
    observanceType: 'holiday'
  },
  {
    id: 'test-jewish-event',
    name: 'Shabbat',
    tradition: 'judaism',
    date: new Date('2024-01-12T18:00:00Z'),
    description: 'Weekly day of rest',
    significance: 'Sacred day of rest and spiritual enrichment',
    observanceType: 'sabbath'
  }
];

describe('EventList Component Integration', () => {
  const mockOnDiscoverLore = vi.fn();
  const mockOnReligiousEventClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders lunar events only when no religious events provided', () => {
    render(
      <EventList 
        events={mockLunarEvents} 
        onDiscoverLore={mockOnDiscoverLore}
      />
    );

    // Should show lunar events
    expect(screen.getByText('New Moon')).toBeInTheDocument();
    expect(screen.getByText('Full Moon')).toBeInTheDocument();
    
    // Should not show religious events section
    expect(screen.queryByText('Upcoming Religious Observances')).not.toBeInTheDocument();
  });

  it('renders both lunar and religious events when both provided', () => {
    render(
      <EventList 
        events={mockLunarEvents}
        religiousEvents={mockReligiousEvents}
        onDiscoverLore={mockOnDiscoverLore}
        onReligiousEventClick={mockOnReligiousEventClick}
      />
    );

    // Should show religious events section
    expect(screen.getByText('Upcoming Religious Observances')).toBeInTheDocument();
    
    // Should show religious events
    expect(screen.getByText('Eid al-Fitr')).toBeInTheDocument();
    expect(screen.getByText('Shabbat')).toBeInTheDocument();
    
    // Should show lunar events
    expect(screen.getByText('New Moon')).toBeInTheDocument();
    expect(screen.getByText('Full Moon')).toBeInTheDocument();
  });

  it('applies correct tradition colors to religious events', () => {
    render(
      <EventList 
        events={[]}
        religiousEvents={mockReligiousEvents}
        onDiscoverLore={mockOnDiscoverLore}
        onReligiousEventClick={mockOnReligiousEventClick}
      />
    );

    // Check Islamic event has green styling - need to find the card container
    const islamicEventCard = screen.getByText('Eid al-Fitr').closest('[role="button"]');
    expect(islamicEventCard).toHaveClass('border-green-400');
    expect(islamicEventCard).toHaveClass('bg-green-400/10');

    // Check Jewish event has blue styling
    const jewishEventCard = screen.getByText('Shabbat').closest('[role="button"]');
    expect(jewishEventCard).toHaveClass('border-blue-400');
    expect(jewishEventCard).toHaveClass('bg-blue-400/10');
  });

  it('handles religious event clicks', () => {
    render(
      <EventList 
        events={[]}
        religiousEvents={mockReligiousEvents}
        onDiscoverLore={mockOnDiscoverLore}
        onReligiousEventClick={mockOnReligiousEventClick}
      />
    );

    // Click on Islamic event
    const islamicEvent = screen.getByText('Eid al-Fitr').closest('[role="button"]');
    fireEvent.click(islamicEvent!);
    
    expect(mockOnReligiousEventClick).toHaveBeenCalledWith(mockReligiousEvents[0]);
  });

  it('handles keyboard navigation for religious events', () => {
    render(
      <EventList 
        events={[]}
        religiousEvents={mockReligiousEvents}
        onDiscoverLore={mockOnDiscoverLore}
        onReligiousEventClick={mockOnReligiousEventClick}
      />
    );

    // Test Enter key
    const islamicEvent = screen.getByText('Eid al-Fitr').closest('[role="button"]');
    fireEvent.keyDown(islamicEvent!, { key: 'Enter' });
    
    expect(mockOnReligiousEventClick).toHaveBeenCalledWith(mockReligiousEvents[0]);

    // Test Space key
    const jewishEvent = screen.getByText('Shabbat').closest('[role="button"]');
    fireEvent.keyDown(jewishEvent!, { key: ' ' });
    
    expect(mockOnReligiousEventClick).toHaveBeenCalledWith(mockReligiousEvents[1]);
  });

  it('displays religious event details correctly', () => {
    render(
      <EventList 
        events={[]}
        religiousEvents={mockReligiousEvents}
        onDiscoverLore={mockOnDiscoverLore}
        onReligiousEventClick={mockOnReligiousEventClick}
      />
    );

    // Check event details are displayed
    expect(screen.getByText('Festival of Breaking the Fast')).toBeInTheDocument();
    expect(screen.getByText('Weekly day of rest')).toBeInTheDocument();
    expect(screen.getByText('holiday')).toBeInTheDocument();
    expect(screen.getByText('sabbath')).toBeInTheDocument();
  });

  it('limits religious events display to 4 items', () => {
    const manyReligiousEvents: ReligiousEvent[] = Array.from({ length: 6 }, (_, i) => ({
      id: `event-${i}`,
      name: `Event ${i + 1}`,
      tradition: 'islam',
      date: new Date(`2024-01-${i + 1}T00:00:00Z`),
      description: `Description ${i + 1}`,
      significance: `Significance ${i + 1}`,
      observanceType: 'holiday'
    }));

    render(
      <EventList 
        events={[]}
        religiousEvents={manyReligiousEvents}
        onDiscoverLore={mockOnDiscoverLore}
        onReligiousEventClick={mockOnReligiousEventClick}
      />
    );

    // Should only show first 4 events
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 4')).toBeInTheDocument();
    expect(screen.queryByText('Event 5')).not.toBeInTheDocument();
    expect(screen.queryByText('Event 6')).not.toBeInTheDocument();
  });

  it('maintains responsive grid layout', () => {
    render(
      <EventList 
        events={mockLunarEvents}
        religiousEvents={mockReligiousEvents}
        onDiscoverLore={mockOnDiscoverLore}
        onReligiousEventClick={mockOnReligiousEventClick}
      />
    );

    // Check religious events grid
    const religiousGrid = screen.getByText('Upcoming Religious Observances').nextElementSibling;
    expect(religiousGrid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');

    // Check lunar events grid
    const lunarGrid = screen.getByText('New Moon').closest('.grid');
    expect(lunarGrid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
  });
});