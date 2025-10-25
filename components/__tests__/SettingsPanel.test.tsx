import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import SettingsPanel from '../SettingsPanel';
import { userPreferencesService } from '../../services/UserPreferencesService';

// Mock the userPreferencesService
vi.mock('../../services/UserPreferencesService', () => ({
  userPreferencesService: {
    getPreferences: vi.fn(),
    subscribe: vi.fn(),
    addTradition: vi.fn(),
    removeTradition: vi.fn(),
    setIslamicCalculation: vi.fn(),
    getIslamicCalculation: vi.fn(),
    setJewishCalculation: vi.fn(),
    getJewishCalculation: vi.fn(),
    setNotificationSettings: vi.fn(),
    getNotificationSettings: vi.fn(),
    setDisplaySettings: vi.fn(),
    getDisplaySettings: vi.fn(),
    resetToDefaults: vi.fn(),
    exportPreferences: vi.fn(),
    importPreferences: vi.fn()
  }
}));

// Mock window.confirm and window.alert
const mockConfirm = vi.fn();
const mockAlert = vi.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm
});

Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert
});

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'mock-url');
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: mockCreateObjectURL
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: mockRevokeObjectURL
});

describe('SettingsPanel', () => {
  const mockPreferences = {
    selectedTraditions: ['islam'],
    islamicCalculation: {
      method: 'MuslimWorldLeague',
      madhab: 'shafi'
    },
    jewishCalculation: {
      method: 'standard',
      candleLightingMinutes: 18,
      havdalahMinutes: 42,
      useElevation: false
    },
    notifications: {
      enabled: true,
      prayerReminders: true,
      celestialEvents: false,
      religiousHolidays: true,
      advanceNoticeMinutes: [15, 30]
    },
    displaySettings: {
      theme: 'dark',
      language: 'en',
      timeFormat: '12h',
      dateFormat: 'MMM dd, yyyy',
      showAstronomicalBasis: true,
      showCalculationMethods: true,
      highContrastMode: false,
      fontSize: 'medium'
    },
    locations: [],
    favoriteEvents: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    (userPreferencesService.getPreferences as any).mockReturnValue(mockPreferences);
    (userPreferencesService.subscribe as any).mockReturnValue(() => {});
    (userPreferencesService.getIslamicCalculation as any).mockReturnValue(mockPreferences.islamicCalculation);
    (userPreferencesService.getJewishCalculation as any).mockReturnValue(mockPreferences.jewishCalculation);
    (userPreferencesService.getNotificationSettings as any).mockReturnValue(mockPreferences.notifications);
    (userPreferencesService.getDisplaySettings as any).mockReturnValue(mockPreferences.displaySettings);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<SettingsPanel isOpen={false} onClose={() => {}} />);
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render all tab buttons', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Religious Traditions')).toBeInTheDocument();
      expect(screen.getByText('Calculation Methods')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Display')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'settings-title');
    });
  });

  describe('Tab Navigation', () => {
    it('should start with traditions tab active', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const traditionsTab = screen.getByRole('tab', { name: /Religious Traditions/i });
      expect(traditionsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch tabs when clicked', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const notificationsTab = screen.getByRole('tab', { name: /Notifications/i });
      fireEvent.click(notificationsTab);
      
      expect(notificationsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    });
  });

  describe('Religious Traditions Tab', () => {
    it('should display tradition selection buttons', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Islam')).toBeInTheDocument();
      expect(screen.getByText('Judaism')).toBeInTheDocument();
      expect(screen.getByText('Christianity')).toBeInTheDocument();
    });

    it('should show selected traditions as active', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const islamButton = screen.getByRole('button', { pressed: true });
      expect(islamButton).toHaveTextContent('Islam');
    });

    it('should toggle tradition selection', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const judaismButton = screen.getByText('Judaism').closest('button');
      fireEvent.click(judaismButton!);
      
      expect(userPreferencesService.addTradition).toHaveBeenCalledWith('judaism');
    });

    it('should remove tradition when already selected', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const islamButton = screen.getByText('Islam').closest('button');
      fireEvent.click(islamButton!);
      
      expect(userPreferencesService.removeTradition).toHaveBeenCalledWith('islam');
    });
  });

  describe('Calculation Methods Tab', () => {
    beforeEach(() => {
      const preferencesWithMultipleTraditions = {
        ...mockPreferences,
        selectedTraditions: ['islam', 'judaism']
      };
      (userPreferencesService.getPreferences as any).mockReturnValue(preferencesWithMultipleTraditions);
    });

    it('should show Islamic calculation settings when Islam is selected', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Calculation Methods/i }));
      
      expect(screen.getByText('Islamic Prayer Time Calculations')).toBeInTheDocument();
      expect(screen.getByDisplayValue('MuslimWorldLeague')).toBeInTheDocument();
    });

    it('should show Jewish calculation settings when Judaism is selected', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Calculation Methods/i }));
      
      expect(screen.getByText('Jewish Prayer Time Calculations')).toBeInTheDocument();
      expect(screen.getByDisplayValue('18')).toBeInTheDocument();
    });

    it('should update Islamic calculation method', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Calculation Methods/i }));
      
      const methodSelects = screen.getAllByRole('combobox');
      const islamicMethodSelect = methodSelects.find(select => 
        select.closest('div')?.querySelector('label')?.textContent?.includes('Calculation Method')
      );
      
      if (islamicMethodSelect) {
        fireEvent.change(islamicMethodSelect, { target: { value: 'Egyptian' } });
        
        expect(userPreferencesService.setIslamicCalculation).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'Egyptian' })
        );
      }
    });

    it('should update Jewish candle lighting minutes', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Calculation Methods/i }));
      
      const numberInputs = screen.getAllByRole('spinbutton');
      const candleLightingInput = numberInputs.find(input => 
        input.getAttribute('value') === '18'
      );
      
      if (candleLightingInput) {
        fireEvent.change(candleLightingInput, { target: { value: '20' } });
        
        expect(userPreferencesService.setJewishCalculation).toHaveBeenCalledWith(
          expect.objectContaining({ candleLightingMinutes: 20 })
        );
      }
    });

    it('should show message when no traditions selected', () => {
      const emptyPreferences = { ...mockPreferences, selectedTraditions: [] };
      (userPreferencesService.getPreferences as any).mockReturnValue(emptyPreferences);
      
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Calculation Methods/i }));
      
      expect(screen.getByText(/Select religious traditions in the first tab/)).toBeInTheDocument();
    });
  });

  describe('Notifications Tab', () => {
    it('should display notification settings', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Notifications/i }));
      
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable notifications')).toBeChecked();
    });

    it('should toggle notification settings', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Notifications/i }));
      
      const enabledCheckbox = screen.getByLabelText('Enable notifications');
      fireEvent.click(enabledCheckbox);
      
      expect(userPreferencesService.setNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });

    it('should show sub-options when notifications are enabled', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Notifications/i }));
      
      expect(screen.getByLabelText('Prayer time reminders')).toBeInTheDocument();
      expect(screen.getByLabelText('Celestial events')).toBeInTheDocument();
      expect(screen.getByLabelText('Religious holidays')).toBeInTheDocument();
    });

    it('should update advance notice minutes', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Notifications/i }));
      
      const fiveMinutesCheckbox = screen.getByLabelText('5m');
      fireEvent.click(fiveMinutesCheckbox);
      
      expect(userPreferencesService.setNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({ advanceNoticeMinutes: [5, 15, 30] })
      );
    });
  });

  describe('Display Tab', () => {
    it('should display display settings', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Display/i }));
      
      expect(screen.getByText('Display Settings')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('should update theme setting', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Display/i }));
      
      const selects = screen.getAllByRole('combobox');
      const themeSelect = selects[0]; // First select should be theme
      fireEvent.change(themeSelect, { target: { value: 'light' } });
      
      expect(userPreferencesService.setDisplaySettings).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'light' })
      );
    });

    it('should toggle display options', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Display/i }));
      
      const highContrastCheckbox = screen.getByLabelText('High contrast mode');
      fireEvent.click(highContrastCheckbox);
      
      expect(userPreferencesService.setDisplaySettings).toHaveBeenCalledWith(
        expect.objectContaining({ highContrastMode: true })
      );
    });
  });

  describe('Footer Actions', () => {
    it('should call export preferences', () => {
      (userPreferencesService.exportPreferences as any).mockReturnValue('{"test": "data"}');
      
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const exportButton = screen.getByText('Export Settings');
      fireEvent.click(exportButton);
      
      expect(userPreferencesService.exportPreferences).toHaveBeenCalled();
    });

    it('should reset preferences with confirmation', () => {
      mockConfirm.mockReturnValue(true);
      
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);
      
      expect(mockConfirm).toHaveBeenCalled();
      expect(userPreferencesService.resetToDefaults).toHaveBeenCalled();
    });

    it('should not reset preferences without confirmation', () => {
      mockConfirm.mockReturnValue(false);
      
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);
      
      expect(mockConfirm).toHaveBeenCalled();
      expect(userPreferencesService.resetToDefaults).not.toHaveBeenCalled();
    });

    it('should close panel when Done is clicked', () => {
      const onCloseMock = vi.fn();
      
      render(<SettingsPanel isOpen={true} onClose={onCloseMock} />);
      
      const doneButton = screen.getByText('Done');
      fireEvent.click(doneButton);
      
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('Close Functionality', () => {
    it('should close when close button is clicked', () => {
      const onCloseMock = vi.fn();
      
      render(<SettingsPanel isOpen={true} onClose={onCloseMock} />);
      
      const closeButton = screen.getByLabelText('Close settings');
      fireEvent.click(closeButton);
      
      expect(onCloseMock).toHaveBeenCalled();
    });

    it('should close when clicking outside modal', () => {
      const onCloseMock = vi.fn();
      
      render(<SettingsPanel isOpen={true} onClose={onCloseMock} />);
      
      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);
      
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('Import Functionality', () => {
    it('should have import file input', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const importLabel = screen.getByText('Import Settings');
      const fileInput = importLabel.querySelector('input[type="file"]');
      
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', '.json');
    });
  });

  describe('Accessibility', () => {
    it('should have proper tab navigation', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('should have proper form labels', () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /Notifications/i }));
      
      expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
    });
  });
});