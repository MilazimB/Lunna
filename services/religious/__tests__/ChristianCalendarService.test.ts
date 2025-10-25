import { describe, it, expect } from 'vitest';
import { ChristianCalendarService } from '../ChristianCalendarService';

describe('ChristianCalendarService', () => {
  const service = new ChristianCalendarService();
  
  describe('Easter Date Calculation', () => {
    it('should calculate Western Easter correctly for 2024', async () => {
      const easter2024 = await service.getEasterDate(2024, 'catholic');
      expect(easter2024.getFullYear()).toBe(2024);
      expect(easter2024.getMonth()).toBe(2); // March (0-indexed)
      expect(easter2024.getDate()).toBe(31);
    });
    
    it('should calculate Western Easter correctly for 2025', async () => {
      const easter2025 = await service.getEasterDate(2025, 'protestant');
      expect(easter2025.getFullYear()).toBe(2025);
      expect(easter2025.getMonth()).toBe(3); // April
      expect(easter2025.getDate()).toBe(20);
    });
    
    it('should calculate Western Easter correctly for 2026', async () => {
      const easter2026 = await service.getEasterDate(2026, 'catholic');
      expect(easter2026.getFullYear()).toBe(2026);
      expect(easter2026.getMonth()).toBe(3); // April
      expect(easter2026.getDate()).toBe(5);
    });
    
    it('should calculate Orthodox Easter correctly for 2024', async () => {
      const orthodoxEaster2024 = await service.getEasterDate(2024, 'orthodox');
      expect(orthodoxEaster2024.getFullYear()).toBe(2024);
      expect(orthodoxEaster2024.getMonth()).toBe(4); // May
      expect(orthodoxEaster2024.getDate()).toBe(5);
    });
    
    it('should calculate Orthodox Easter correctly for 2025', async () => {
      const orthodoxEaster2025 = await service.getEasterDate(2025, 'orthodox');
      expect(orthodoxEaster2025.getFullYear()).toBe(2025);
      expect(orthodoxEaster2025.getMonth()).toBe(3); // April
      expect(orthodoxEaster2025.getDate()).toBe(20);
    });
  });

  describe('Liturgical Events', () => {
    it('should return liturgical events for a date range', async () => {
      const startDate = new Date(2025, 0, 1); // January 1, 2025
      const endDate = new Date(2025, 11, 31); // December 31, 2025
      
      const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
      
      expect(events.length).toBeGreaterThan(0);
      expect(events.every(e => e.tradition === 'christianity')).toBe(true);
      expect(events.every(e => e.date >= startDate && e.date <= endDate)).toBe(true);
    });
    
    it('should include Christmas in the events', async () => {
      const startDate = new Date(2025, 11, 1); // December 1, 2025
      const endDate = new Date(2025, 11, 31); // December 31, 2025
      
      const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
      
      const christmas = events.find(e => e.name === 'Christmas');
      expect(christmas).toBeDefined();
      expect(christmas?.date.getMonth()).toBe(11); // December
      expect(christmas?.date.getDate()).toBe(25);
    });
    
    it('should include Easter and related moveable feasts', async () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);
      
      const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
      
      const easter = events.find(e => e.name === 'Easter Sunday');
      const ashWednesday = events.find(e => e.name === 'Ash Wednesday');
      const palmSunday = events.find(e => e.name === 'Palm Sunday');
      const goodFriday = events.find(e => e.name === 'Good Friday');
      const pentecost = events.find(e => e.name === 'Pentecost');
      
      expect(easter).toBeDefined();
      expect(ashWednesday).toBeDefined();
      expect(palmSunday).toBeDefined();
      expect(goodFriday).toBeDefined();
      expect(pentecost).toBeDefined();
      
      // Verify relationships
      if (easter && ashWednesday) {
        const daysDiff = Math.floor((easter.date.getTime() - ashWednesday.date.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(46);
      }
      
      if (easter && pentecost) {
        const daysDiff = Math.floor((pentecost.date.getTime() - easter.date.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(49);
      }
    });
    
    it('should include fixed feast days', async () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);
      
      const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
      
      const epiphany = events.find(e => e.name === 'Epiphany');
      const assumption = events.find(e => e.name === 'Assumption of Mary');
      const allSaints = events.find(e => e.name === 'All Saints\' Day');
      
      expect(epiphany).toBeDefined();
      expect(epiphany?.date.getMonth()).toBe(0); // January
      expect(epiphany?.date.getDate()).toBe(6);
      
      expect(assumption).toBeDefined();
      expect(assumption?.date.getMonth()).toBe(7); // August
      expect(assumption?.date.getDate()).toBe(15);
      
      expect(allSaints).toBeDefined();
      expect(allSaints?.date.getMonth()).toBe(10); // November
      expect(allSaints?.date.getDate()).toBe(1);
    });
    
    it('should sort events by date', async () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);
      
      const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
      
      for (let i = 1; i < events.length; i++) {
        expect(events[i].date.getTime()).toBeGreaterThanOrEqual(events[i - 1].date.getTime());
      }
    });
  });

  describe('Liturgical Season Detection', () => {
    it('should correctly identify Advent season', () => {
      // First Sunday of Advent 2025 is November 30
      const adventDate = new Date(2025, 10, 30); // November 30, 2025
      const season = service.getLiturgicalSeason(adventDate);
      expect(season).toBe('advent');
    });
    
    it('should correctly identify Christmas season', () => {
      const christmasDate = new Date(2025, 11, 25); // December 25, 2025
      const season = service.getLiturgicalSeason(christmasDate);
      expect(season).toBe('christmas');
    });
    
    it('should correctly identify Lent season', () => {
      // Ash Wednesday 2025 is March 5
      const lentDate = new Date(2025, 2, 10); // March 10, 2025 (during Lent)
      const season = service.getLiturgicalSeason(lentDate);
      expect(season).toBe('lent');
    });
    
    it('should correctly identify Easter season', () => {
      // Easter 2025 is April 20
      const easterDate = new Date(2025, 3, 25); // April 25, 2025 (during Easter season)
      const season = service.getLiturgicalSeason(easterDate);
      expect(season).toBe('easter');
    });
    
    it('should correctly identify Ordinary Time', () => {
      const ordinaryDate = new Date(2025, 6, 15); // July 15, 2025
      const season = service.getLiturgicalSeason(ordinaryDate);
      expect(season).toBe('ordinary_time');
    });
  });
  
  describe('Event Properties', () => {
    it('should include all required properties for each event', async () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 2, 31);
      
      const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
      
      events.forEach(event => {
        expect(event.id).toBeDefined();
        expect(event.name).toBeDefined();
        expect(event.tradition).toBe('christianity');
        expect(event.date).toBeInstanceOf(Date);
        expect(event.description).toBeDefined();
        expect(event.significance).toBeDefined();
        expect(event.observanceType).toBeDefined();
        expect(['prayer', 'holiday', 'fast', 'feast', 'sabbath']).toContain(event.observanceType);
      });
    });
    
    it('should have unique IDs for each event', async () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);
      
      const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
      const ids = events.map(e => e.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
  
  describe('Multi-year Date Ranges', () => {
    it('should handle date ranges spanning multiple years', async () => {
      const startDate = new Date(2024, 11, 1); // December 1, 2024
      const endDate = new Date(2025, 1, 28); // February 28, 2025
      
      const events = await service.getLiturgicalEvents(startDate, endDate, 'catholic');
      
      expect(events.length).toBeGreaterThan(0);
      
      // Should include Christmas 2024
      const christmas2024 = events.find(e => 
        e.name === 'Christmas' && e.date.getFullYear() === 2024
      );
      expect(christmas2024).toBeDefined();
      
      // Should include events from 2025
      const events2025 = events.filter(e => e.date.getFullYear() === 2025);
      expect(events2025.length).toBeGreaterThan(0);
    });
  });
});
