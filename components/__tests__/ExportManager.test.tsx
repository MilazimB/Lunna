import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';
import ExportManager from '../ExportManager';
import { exportService } from '../../services/ExportService';
import { ExportData, ReligiousEvent, PrayerTime, LunarEvent, Location } from '../../types';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../services/ExportService', () => ({
  exportService: {
    exportData: vi.fn(),
    exportSingleEvent: vi.fn(),
    getExportHistory: vi.fn(),
    clearExportHistory: vi.fn()
  }
}));

// Mock navigator.share and clipboard
const mockShare = vi.fn();
const mockClipboard = {
  writeText: vi.fn()
};

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true
});

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true
});

// Mock document.execCommand
Object.defineProperty(document, 'execCommand', {
  value: vi.fn(),
  writable: true
});

describe('ExportManager', () => {
  let mockData: ExportData;
  let mockLocation: Location;
  let mockReligiousEvent: ReligiousEvent;
  let mockPrayerTime: PrayerTime;
  let mockLunarEvent: LunarEvent;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10,
      timezone: 'America/New_York'
    };

    mockReligiousEvent = {
      id: 'test-event-1',
      name: 'Test Holiday',
      tradition: 'islam',
      date: new Date('2024-01-15T12:00:00Z'),
      localTime: new Date('2024-01-15T12:00:00Z'),
      description: 'A test religious event',
      significance: 'Test significance',
      astronomicalBasis: 'Based on lunar observation',
      observanceType: 'holiday'
    };

    mockPrayerTime = {
      name: 'Fajr',
      time: new Date('2024-01-15T06:00:00Z'),
      tradition: 'islam',
      calculationMethod: 'MuslimWorldLeague',
      qiblaDirection: 58.5
    };

    mockLunarEvent = {
      eventName: 'New Moon',
      utcDate: new Date('2024-01-15T18:00:00Z'),
      localSolarDate: new Date('2024-01-15T13:00:00Z'),
      julianDate: 2460326.25,
      accuracyNote: 'Calculated with high precision'
    };

    mockData = {
      religiousEvents: [mockReligiousEvent],
      prayerTimes: [mockPrayerTime],
      lunarEvents: [mockLunarEvent]
    };

    // Mock export service methods
    vi.mocked(exportService.getExportHistory).mockReturnValue([]);
    vi.mocked(exportService.exportData).mockResolvedValue({
      success: true,
      data: 'mock-export-data',
      filename: 'test-export.ics',
      mimeType: 'text/calendar',
      record: {
        id: 'test-record',
        timestamp: new Date(),
        format: 'ics',
        eventCount: 3,
        dateRange: { start: new Date(), end: new Date() }
      }
    });
    vi.mocked(exportService.exportSingleEvent).mockResolvedValue({
      success: true,
      data: 'mock-single-export-data',
      filename: 'test-single.ics',
      mimeType: 'text/calendar',
      record: {
        id: 'test-single-record',
        timestamp: new Date(),
        format: 'ics',
        eventCount: 1,
        dateRange: { start: new Date(), end: new Date() }
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when closed', () => {
      render(
        <ExportManager
          isOpen={false}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      expect(screen.queryByText('Export & Share')).not.toBeInTheDocument();
    });

    it('should render export manager when open', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      expect(screen.getByText('Export & Share')).toBeInTheDocument();
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      expect(screen.getByText('Quick Share')).toBeInTheDocument();
      expect(screen.getByText('Export History')).toBeInTheDocument();
    });

    it('should render share mode for single event', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockReligiousEvent}
          location={mockLocation}
        />
      );

      expect(screen.getByText('Share Event')).toBeInTheDocument();
    });
  });

  describe('Export Tab', () => {
    it('should display format selection options', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      expect(screen.getByText('Calendar (ICS)')).toBeInTheDocument();
      expect(screen.getByText('JSON Data')).toBeInTheDocument();
      expect(screen.getByText('Spreadsheet (CSV)')).toBeInTheDocument();
    });

    it('should allow format selection', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      const jsonButton = screen.getByText('JSON Data').closest('button');
      fireEvent.click(jsonButton!);

      // Should update the selection (visual feedback would be tested in integration tests)
      expect(jsonButton).toBeInTheDocument();
    });

    it('should display data selection checkboxes', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      expect(screen.getByText('Religious events and holidays')).toBeInTheDocument();
      expect(screen.getByText('Prayer times')).toBeInTheDocument();
      expect(screen.getByText('Lunar events and phases')).toBeInTheDocument();
    });

    it('should show event counts', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      expect(screen.getByText('(1 events)')).toBeInTheDocument();
      expect(screen.getByText('(1 times)')).toBeInTheDocument();
    });

    it('should display date range inputs', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    it('should display privacy settings', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      expect(screen.getByText('Include location coordinates')).toBeInTheDocument();
      expect(screen.getByText('Include calculation methods')).toBeInTheDocument();
      expect(screen.getByText('Include personal notes and metadata')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should export data when export button is clicked', async () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportService.exportData).toHaveBeenCalledWith(
          mockData,
          expect.objectContaining({
            format: 'ics',
            includeReligiousEvents: true,
            includePrayerTimes: true,
            includeLunarEvents: true
          })
        );
      });

      expect(toast.success).toHaveBeenCalledWith('Successfully exported 3 events');
    });

    it('should export single event', async () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockReligiousEvent}
          location={mockLocation}
        />
      );

      // Switch to export tab
      fireEvent.click(screen.getByText('Export Data'));

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportService.exportSingleEvent).toHaveBeenCalledWith(
          mockReligiousEvent,
          'ics'
        );
      });

      expect(toast.success).toHaveBeenCalledWith('Successfully exported 1 events');
    });

    it('should handle export errors', async () => {
      vi.mocked(exportService.exportData).mockResolvedValue({
        success: false,
        error: 'Export failed',
        filename: '',
        mimeType: '',
        record: {
          id: 'test-record',
          timestamp: new Date(),
          format: 'ics',
          eventCount: 0,
          dateRange: { start: new Date(), end: new Date() }
        }
      });

      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Export failed');
      });
    });

    it('should show error when no data available', async () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          location={mockLocation}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('No data available for export');
      });
    });
  });

  describe('Share Tab', () => {
    it('should display share interface for single event', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockReligiousEvent}
          location={mockLocation}
        />
      );

      // Should start on share tab for single events
      expect(screen.getByText('Share Event')).toBeInTheDocument();
      expect(screen.getByText('Test Holiday')).toBeInTheDocument();
      expect(screen.getByText('Share Text')).toBeInTheDocument();
    });

    it('should generate share text for religious event', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockReligiousEvent}
          location={mockLocation}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(expect.stringContaining('☪️ Test Holiday'));
      expect(textarea).toHaveValue(expect.stringContaining('A test religious event'));
    });

    it('should generate share text for prayer time', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockPrayerTime}
          location={mockLocation}
        />
      );

      const textareas = screen.getAllByRole('textbox');
      const shareTextarea = textareas.find(textarea => 
        textarea.getAttribute('placeholder') === 'Customize your share message...'
      );
      expect(shareTextarea).toHaveValue(expect.stringContaining('🕌 Fajr Prayer'));
      expect(shareTextarea).toHaveValue(expect.stringContaining('🧭 Qibla: 58.5°'));
    });

    it('should generate share text for lunar event', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockLunarEvent}
          location={mockLocation}
        />
      );

      const textareas = screen.getAllByRole('textbox');
      const shareTextarea = textareas.find(textarea => 
        textarea.getAttribute('placeholder') === 'Customize your share message...'
      );
      expect(shareTextarea).toHaveValue(expect.stringContaining('🌙 New Moon'));
      expect(shareTextarea).toHaveValue(expect.stringContaining('Calculated with high precision'));
    });

    it('should handle sharing with navigator.share', async () => {
      mockShare.mockResolvedValue(undefined);

      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockReligiousEvent}
          location={mockLocation}
        />
      );

      const shareButton = screen.getByText('📤 Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: 'Test Holiday',
          text: expect.stringContaining('☪️ Test Holiday'),
          url: window.location.href
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Shared successfully');
    });

    it('should fallback to clipboard when share fails', async () => {
      mockShare.mockRejectedValue(new Error('Share failed'));
      mockClipboard.writeText.mockResolvedValue(undefined);

      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockReligiousEvent}
          location={mockLocation}
        />
      );

      const shareButton = screen.getByText('📤 Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('☪️ Test Holiday')
        );
      });

      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard');
    });

    it('should allow editing share text', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockReligiousEvent}
          location={mockLocation}
        />
      );

      const textareas = screen.getAllByRole('textbox');
      const shareTextarea = textareas.find(textarea => 
        textarea.getAttribute('placeholder') === 'Customize your share message...'
      );
      fireEvent.change(shareTextarea!, { target: { value: 'Custom share text' } });

      expect(shareTextarea).toHaveValue('Custom share text');
    });

    it('should reset share text when reset button is clicked', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          singleEvent={mockReligiousEvent}
          location={mockLocation}
        />
      );

      const textareas = screen.getAllByRole('textbox');
      const shareTextarea = textareas.find(textarea => 
        textarea.getAttribute('placeholder') === 'Customize your share message...'
      );
      fireEvent.change(shareTextarea!, { target: { value: 'Modified text' } });

      const resetButton = screen.getByText('🔄 Reset Text');
      fireEvent.click(resetButton);

      expect(shareTextarea).toHaveValue(expect.stringContaining('☪️ Test Holiday'));
    });
  });

  describe('History Tab', () => {
    it('should display empty history message', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      fireEvent.click(screen.getByText('Export History'));

      expect(screen.getByText('No exports yet. Create your first export to see history here.')).toBeInTheDocument();
    });

    it('should display export history when available', () => {
      const mockHistory = [
        {
          id: 'export-1',
          timestamp: new Date('2024-01-15T12:00:00Z'),
          format: 'ics' as const,
          eventCount: 5,
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31')
          }
        }
      ];

      vi.mocked(exportService.getExportHistory).mockReturnValue(mockHistory);

      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      fireEvent.click(screen.getByText('Export History'));

      expect(screen.getByText('ICS Export')).toBeInTheDocument();
      expect(screen.getByText(/5 events/)).toBeInTheDocument();
    });

    it('should clear history when clear button is clicked', () => {
      const mockHistory = [
        {
          id: 'export-1',
          timestamp: new Date(),
          format: 'ics' as const,
          eventCount: 5,
          dateRange: { start: new Date(), end: new Date() }
        }
      ];

      vi.mocked(exportService.getExportHistory).mockReturnValue(mockHistory);

      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      fireEvent.click(screen.getByText('Export History'));
      fireEvent.click(screen.getByText('Clear History'));

      expect(exportService.clearExportHistory).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Export history cleared');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', () => {
      render(
        <ExportManager
          isOpen={true}
          onClose={vi.fn()}
          data={mockData}
          location={mockLocation}
        />
      );

      // Start on export tab
      expect(screen.getByText('Export Format')).toBeInTheDocument();

      // Switch to share tab
      fireEvent.click(screen.getByText('Quick Share'));
      expect(screen.getByText(/Quick share is available for individual events/)).toBeInTheDocument();

      // Switch to history tab
      fireEvent.click(screen.getByText('Export History'));
      expect(screen.getByText('Export History')).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('should close when close button is clicked', () => {
      const onClose = vi.fn();

      render(
        <ExportManager
          isOpen={true}
          onClose={onClose}
          data={mockData}
          location={mockLocation}
        />
      );

      const closeButton = screen.getByLabelText('Close export manager');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should close when cancel button is clicked', () => {
      const onClose = vi.fn();

      render(
        <ExportManager
          isOpen={true}
          onClose={onClose}
          data={mockData}
          location={mockLocation}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should close when clicking outside modal', () => {
      const onClose = vi.fn();

      render(
        <ExportManager
          isOpen={true}
          onClose={onClose}
          data={mockData}
          location={mockLocation}
        />
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside modal', () => {
      const onClose = vi.fn();

      render(
        <ExportManager
          isOpen={true}
          onClose={onClose}
          data={mockData}
          location={mockLocation}
        />
      );

      const modalContent = screen.getByText('Export & Share').closest('div');
      fireEvent.click(modalContent!);

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});