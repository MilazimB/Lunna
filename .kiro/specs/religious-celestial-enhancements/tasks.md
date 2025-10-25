# Implementation Plan

- [x] 1. Set up project structure and install dependencies











  - Install new dependencies: adhan, hebcal, moment-timezone, ics, react-notification-system, react-responsive
  - Create new directory structure for religious services and components
  - Update TypeScript configuration for new modules
  - _Requirements: 1.1, 3.1, 4.1_


- [x] 2. Implement core data models and types






- [x] 2.1 Create religious event data models


  - Define ReligiousEvent, PrayerTime, and ReligiousTradition interfaces
  - Create enums for prayer types, observance types, and calculation methods
  - Write TypeScript interfaces for user preferences and settings
  - _Requirements: 1.1, 3.1, 4.1_

- [x] 2.2 Extend existing lunar data models


  - Enhance LunarEvent interface with accuracy estimation fields
  - Create AccuracyEstimate and LibrationData interfaces
  - Add AlternativeCalculation and MethodComparison types
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.3 Create user preference and configuration models


  - Define UserPreferences interface with religious settings
  - Create NotificationSettings and DisplaySettings interfaces
  - Implement SavedLocation and LocationManager types
  - _Requirements: 5.1, 6.1, 7.1_

- [x] 3. Implement Islamic calendar and prayer time service




- [x] 3.1 Create IslamicCalendarService class


  - Integrate adhan library for prayer time calculations
  - Implement getPrayerTimes method with configurable calculation methods
  - Add Qibla direction calculation functionality
  - Write unit tests for prayer time accuracy
  - _Requirements: 1.2, 3.1, 3.5_

- [x] 3.2 Add Islamic holiday calculation


  - Implement getIslamicHolidays method for lunar-based holidays
  - Create Hijri calendar conversion utilities
  - Add Islamic observance data and descriptions
  - Write tests for holiday date accuracy
  - _Requirements: 4.1, 4.5_

- [x] 4. Implement Jewish calendar and observance service




- [x] 4.1 Create JewishCalendarService class


  - Integrate hebcal library for Hebrew calendar calculations
  - Implement getJewishObservances method for holidays and observances
  - Add Sabbath time calculations (candle lighting, havdalah)
  - Write unit tests for Hebrew calendar accuracy
  - _Requirements: 1.3, 3.2, 4.2_

- [x] 4.2 Add Jewish prayer time calculations


  - Implement Jewish prayer times (Shacharit, Mincha, Maariv)
  - Add zmanim (halachic times) calculations
  - Create Hebrew date conversion utilities
  - Write tests for prayer time accuracy
  - _Requirements: 3.2, 4.2_

- [x] 5. Implement Christian liturgical calendar service




- [x] 5.1 Create ChristianCalendarService class


  - Implement liturgical calendar calculations for major denominations
  - Add Easter date calculation and moveable feast logic
  - Create getLiturgicalEvents method for feast days and seasons
  - Write unit tests for liturgical date accuracy
  - _Requirements: 1.4, 4.3_

- [x] 5.2 Add canonical hours calculation


  - Implement traditional prayer hours (Lauds, Prime, Terce, Sext, None, Vespers, Compline)
  - Add seasonal adjustments for prayer times
  - Create liturgical season detection logic
  - Write tests for canonical hour calculations
  - _Requirements: 3.3, 4.3_

- [x] 6. Enhance lunar calculation accuracy system




- [x] 6.1 Create PrecisionLunarService class


  - Extend existing lunarEphemeris service with enhanced calculations
  - Implement multiple calculation method support (Meeus, VSOP87)
  - Add atmospheric correction calculations
  - Write unit tests comparing calculation methods
  - _Requirements: 2.1, 2.2, 2.6_


- [x] 6.2 Implement accuracy estimation system

  - Create AccuracyValidator class for calculation validation
  - Implement confidence interval calculations
  - Add uncertainty estimation algorithms
  - Write tests for accuracy estimation reliability
  - _Requirements: 2.1, 2.4_

- [x] 6.3 Add libration and enhanced lunar data


  - Implement lunar libration calculations
  - Add apparent diameter calculations
  - Create enhanced lunar illumination data
  - Write tests for libration accuracy
  - _Requirements: 2.5_

- [x] 7. Create religious schedule display components




- [x] 7.1 Build ReligiousSchedulePanel component


  - Create main panel for displaying religious events and prayer times
  - Implement tradition selection and switching functionality
  - Add countdown timers for next prayer/event
  - Write component tests for religious data display
  - _Requirements: 1.1, 3.6, 5.1_

- [x] 7.2 Create PrayerTimeCard component





  - Build individual prayer time display cards
  - Add calculation method information display
  - Display prayer time without Qibla compass
  - Write tests for prayer time card functionality
  - _Requirements: 3.1, 3.6_

- [x] 7.2.1 Create enhanced QiblaCompass component


  - Build standalone QiblaCompass component with circular compass design
  - Add cardinal direction markers (N, S, E, W) positioned around the circle
  - Implement degree tick marks at regular intervals (every 10 degrees)
  - Create prominent arrow graphic pointing to Qibla direction
  - Display numeric degree value and directional label (SE, NW, etc.)
  - Add smooth rotation animation for direction updates
  - Implement responsive sizing for mobile, tablet, and desktop
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_

- [x] 7.2.2 Create standalone QiblaView component


  - Build dedicated full-screen view for Qibla direction
  - Integrate large QiblaCompass component as main feature
  - Display current location information
  - Calculate and show distance to Mecca
  - Add responsive layout for all device sizes
  - Write tests for QiblaView functionality
  - _Requirements: 9.1, 9.7, 9.8_

- [x] 7.2.3 Remove Qibla compass from PrayerTimeCard


  - Remove QiblaCompass integration from PrayerTimeCard component
  - Update PrayerTimeCard tests to remove Qibla-related assertions
  - Simplify PrayerTimeCard layout without Qibla section
  - _Requirements: 9.7_

- [x] 7.2.4 Add Qibla navigation button



  - Add Qibla button next to calendar navigation in main App
  - Implement navigation to QiblaView when button is clicked
  - Style button to match existing navigation elements
  - Add appropriate icon for Qibla feature
  - Write tests for navigation functionality
  - _Requirements: 9.8_

- [x] 7.3 Build ReligiousCalendarView component


  - Create monthly/weekly calendar view for religious observances
  - Implement multi-tradition overlay functionality
  - Add event detail popups with significance information
  - Write tests for calendar view interactions
  - _Requirements: 4.1, 4.4, 4.5_

- [x] 8. Implement enhanced astronomical display components




- [x] 8.1 Create AccuracyIndicator component


  - Build visual accuracy confidence display
  - Implement uncertainty range visualization
  - Add methodology comparison display
  - Write tests for accuracy indicator rendering
  - _Requirements: 2.1, 2.4_

- [x] 8.2 Build LunarDetailPanel component


  - Enhance existing lunar display with libration data
  - Add atmospheric correction information
  - Implement alternative calculation comparison view
  - Write tests for enhanced lunar data display
  - _Requirements: 2.5, 2.6_

- [x] 9. Implement user preference and settings system





- [x] 9.1 Create UserPreferencesService


  - Implement local storage for user preferences
  - Add religious tradition selection management
  - Create calculation method preference storage
  - Write tests for preference persistence
  - _Requirements: 3.5, 5.6, 6.1_


- [x] 9.2 Build SettingsPanel component

  - Create user interface for preference management
  - Implement religious tradition selection UI
  - Add calculation method configuration options
  - Write tests for settings panel functionality
  - _Requirements: 3.5, 5.6_

- [x] 10. Implement location and timezone management





- [x] 10.1 Create LocationManager service


  - Enhance existing location handling with multiple location support
  - Implement automatic timezone detection using moment-timezone
  - Add saved location management functionality
  - Write tests for location and timezone handling
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 10.2 Build LocationSelector component


  - Create UI for location selection and management
  - Implement GPS integration with manual fallback
  - Add saved location quick-switching
  - Write tests for location selector functionality
  - _Requirements: 6.1, 6.5_

- [x] 11. Implement notification system





- [x] 11.1 Create NotificationService


  - Integrate react-notification-system for user notifications
  - Implement prayer time reminder scheduling
  - Add celestial event notification logic
  - Write tests for notification scheduling and delivery
  - _Requirements: 5.1, 5.2, 3.6_

- [x] 11.2 Build NotificationCenter component


  - Create notification management interface
  - Implement notification preference controls
  - Add notification history display
  - Write tests for notification center functionality
  - _Requirements: 5.1, 5.2_

- [x] 12. Implement data export and sharing functionality





- [x] 12.1 Create ExportService


  - Integrate ics library for calendar file generation
  - Implement prayer time and religious event export
  - Add multiple format support (JSON, CSV, ICS)
  - Write tests for export functionality and file format validation
  - _Requirements: 7.1, 7.2, 7.6_

- [x] 12.2 Build ExportManager component


  - Create export interface with format selection
  - Implement sharing functionality for individual events
  - Add privacy controls for exported data
  - Write tests for export manager functionality
  - _Requirements: 7.1, 7.3, 7.4_

- [x] 13. Implement responsive design enhancements





- [x] 13.1 Add responsive layout system


  - Integrate react-responsive for device detection
  - Implement mobile-optimized layouts for all components
  - Add tablet-specific multi-column layouts
  - Write tests for responsive behavior across device sizes
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 13.2 Optimize touch and gesture support


  - Add touch gesture support for calendar navigation
  - Implement swipe gestures for component switching
  - Add pinch-to-zoom for astronomical charts
  - Write tests for touch interaction functionality
  - _Requirements: 8.6_

- [ ] 14. Implement accessibility enhancements
- [ ] 14.1 Add comprehensive ARIA support
  - Implement ARIA labels for all interactive elements
  - Add screen reader descriptions for astronomical data
  - Create keyboard navigation paths for all components
  - Write accessibility tests using automated testing tools
  - _Requirements: 9.1, 9.5_

- [ ] 14.2 Add visual accessibility features
  - Implement high contrast mode support
  - Add font scaling and zoom support
  - Create color-blind friendly color schemes
  - Write tests for visual accessibility compliance
  - _Requirements: 9.2_

- [x] 15. Integrate all components into main application





- [x] 15.1 Update main App component


  - Integrate religious schedule panel into main layout
  - Add navigation between astronomical and religious views
  - Implement responsive layout switching
  - Write integration tests for main application flow
  - _Requirements: 1.1, 8.1, 8.5_

- [x] 15.2 Update existing components for integration


  - Modify existing EventList to include religious events
  - Enhance LocationInput with saved location support
  - Update Modal component for religious event details
  - Write tests for component integration and data flow
  - _Requirements: 1.1, 4.4, 6.1_

- [ ] 16. Performance optimization and caching
- [ ] 16.1 Implement calculation caching system
  - Create CalculationCache service for expensive computations
  - Add intelligent cache invalidation based on location and time
  - Implement background calculation updates
  - Write tests for caching performance and accuracy
  - _Requirements: 2.1, 3.1, 4.1_

- [ ] 16.2 Optimize component rendering performance
  - Implement React.memo for expensive components
  - Add lazy loading for non-critical components
  - Optimize re-rendering with useMemo and useCallback
  - Write performance tests and benchmarks
  - _Requirements: 8.1, 5.6_

- [ ] 17. Add comprehensive error handling and validation
- [ ] 17.1 Implement robust error handling
  - Create ErrorBoundary components for graceful failure handling
  - Add input validation for all user inputs
  - Implement fallback strategies for calculation failures
  - Write tests for error scenarios and recovery
  - _Requirements: 2.4, 6.1, 6.2_

- [ ] 17.2 Add polar region and edge case handling
  - Implement special logic for polar regions where normal calculations fail
  - Add handling for extreme latitude scenarios
  - Create user warnings for calculation limitations
  - Write tests for edge case scenarios
  - _Requirements: 3.4, 6.2_

- [ ] 18. Final integration testing and documentation
- [ ] 18.1 Comprehensive integration testing
  - Test all religious traditions working together
  - Verify accuracy across different locations and time zones
  - Test export functionality with real calendar applications
  - Validate accessibility compliance across all features
  - _Requirements: All requirements_

- [ ] 18.2 Update documentation and user guides
  - Update README with new features and setup instructions
  - Create user guide for religious features
  - Document calculation methods and accuracy expectations
  - Add troubleshooting guide for common issues
  - _Requirements: All requirements_