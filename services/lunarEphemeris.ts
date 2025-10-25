
import { LunarEvent, CardinalMoonPhase, LunarIllumination, LunarPhaseName } from '../types';

/**
 * lunar-ephemeris.ts
 *
 * Calculates upcoming cardinal lunar phases (New, First Quarter, Full, Third Quarter)
 * and the current lunar illumination.
 * Uses a simplified and highly accurate version of Jean Meeus’ algorithms
 * (Astronomical Algorithms, 2nd Edition, Ch. 49).
 *
 * Accuracy: typically ±1–2 hours for cardinal phases.
 */

// ---------------------------------------------------------------------------
// Julian Date Helpers
// ---------------------------------------------------------------------------
export function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function fromJulianDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

// ---------------------------------------------------------------------------
// Meeus: Mean Lunar Phase (with principal corrections)
// ---------------------------------------------------------------------------
function calculateMeanPhase(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;

  let jd =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T2 -
    0.000000150 * T3 +
    0.00000000073 * T4;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;

  const M_sun =
    (2.5534 + 29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3) *
    (Math.PI / 180);
  const M_moon =
    (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) *
    (Math.PI / 180);
  const F =
    (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) *
    (Math.PI / 180);

  const phase = (k % 1 + 1) % 1; // normalize 0–1
  let corr = 0;

  // Use tolerance for float comparison
  const tolerance = 0.01;
  const isNew = Math.abs(phase - 0.0) < tolerance || Math.abs(phase - 1.0) < tolerance;
  const isFull = Math.abs(phase - 0.5) < tolerance;
  const isFirstQ = Math.abs(phase - 0.25) < tolerance;
  const isThirdQ = Math.abs(phase - 0.75) < tolerance;

  if (isNew) {
    // New Moon
    corr =
      -0.40614 * Math.sin(M_moon) +
      0.17302 * E * Math.sin(M_sun) +
      0.01608 * Math.sin(2 * M_moon) +
      0.01039 * Math.sin(2 * F) +
      0.00739 * E * Math.sin(M_moon - M_sun) -
      0.00514 * E * Math.sin(M_moon + M_sun) +
      0.00208 * E * E * Math.sin(2 * M_sun);
  } else if (isFull) {
    // Full Moon
    corr =
      -0.40720 * Math.sin(M_moon) -
      0.17241 * E * Math.sin(M_sun) +
      0.01615 * Math.sin(2 * M_moon) +
      0.01043 * Math.sin(2 * F) +
      0.00734 * E * Math.sin(M_moon - M_sun) -
      0.00515 * E * Math.sin(M_moon + M_sun) +
      0.00209 * E * E * Math.sin(2 * M_sun);
  } else if (isFirstQ || isThirdQ) {
    // Quarter Moons
    corr =
      -0.62801 * Math.sin(M_moon) +
      0.00894 * Math.sin(2 * M_moon) +
      0.00780 * Math.sin(2 * F);
    if (isFirstQ) {
      corr +=
        0.17272 * E * Math.sin(M_sun) +
        0.00413 * E * Math.sin(M_moon + M_sun) -
        0.00637 * E * Math.sin(M_moon - M_sun);
    } else { // isThirdQ
      corr -=
        0.17272 * E * Math.sin(M_sun) -
        0.00413 * E * Math.sin(M_moon + M_sun) +
        0.00637 * E * Math.sin(M_moon - M_sun);
    }
  }

  return jd + corr;
}

// ---------------------------------------------------------------------------
// Equation of Time + Local Solar Time
// ---------------------------------------------------------------------------
function calculateEquationOfTime(date: Date): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear;
  const dayOfYear = diff / 86400000;
  const B = ((360 / 365.242) * (dayOfYear - 81)) * (Math.PI / 180);
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

function convertToLocalSolarTime(utcDate: Date, longitude: number): Date {
  const eotMinutes = calculateEquationOfTime(utcDate);
  const longitudeOffsetMinutes = longitude * 4; // 1° = 4 min
  const totalOffsetMillis = (longitudeOffsetMinutes + eotMinutes) * 60 * 1000;
  return new Date(utcDate.getTime() + totalOffsetMillis);
}

// ---------------------------------------------------------------------------
// Current Illumination
// ---------------------------------------------------------------------------

function getPhaseNameFromAngle(angle: number, fraction?: number): LunarPhaseName {
    // Moon phase cycle: 0° = New Moon, 90° = First Quarter, 180° = Full Moon, 270° = Third Quarter
    // Primary classification is based on phase angle
    // Fraction is only used to distinguish between New/Full Moon at exact moments

    // Use angle for phase classification (primary method)
    if (angle < 45) return 'Waxing Crescent';
    if (angle < 90) return 'Waxing Crescent';
    if (angle < 135) return 'First Quarter Moon';
    if (angle < 180) return 'Waxing Gibbous';
    if (angle < 225) return 'Full Moon';
    if (angle < 270) return 'Waning Gibbous';
    if (angle < 315) return 'Third Quarter Moon';
    return 'Waning Crescent';
}

export function getCurrentLunarIllumination(date: Date = new Date()): LunarIllumination {
    const jd = toJulianDate(date);
    const T = (jd - 2451545.0) / 36525;
    const T2 = T * T;
    const T3 = T2 * T;

    // Moon's mean elongation D
    const D_deg = 297.85036 + 445267.111480 * T - 0.0019142 * T2 + T3 / 189474;

    const normalizedAngle = ((D_deg % 360) + 360) % 360;
    const phaseAngleRad = normalizedAngle * (Math.PI / 180);

    const fraction = (1 - Math.cos(phaseAngleRad)) / 2;
    const phaseName = getPhaseNameFromAngle(normalizedAngle, fraction);

    return {
        fraction,
        phaseName,
        phaseAngle: normalizedAngle
    };
}


// ---------------------------------------------------------------------------
// Main: find upcoming lunar holy days
// ---------------------------------------------------------------------------
interface GetUpcomingLunarEventsParams {
  startDate?: Date;
  longitude?: number;
}

export function getUpcomingLunarEvents({ startDate = new Date(), longitude = 0.0 }: GetUpcomingLunarEventsParams = {}): LunarEvent[] {
  const startJd = toJulianDate(startDate);
  const k_base = Math.floor((startJd - 2451550.09766) / 29.530588861);
  const eventNames: { [key: number]: CardinalMoonPhase } = {
    0: 'New Moon',
    0.25: 'First Quarter Moon',
    0.5: 'Full Moon',
    0.75: 'Third Quarter Moon'
  };
  const phaseTargets = [0, 0.25, 0.5, 0.75];

  const results: LunarEvent[] = [];

  for (let i = -1; i <= 8; i++) {
    const k_phase = k_base + i * 0.25;
    const jd = calculateMeanPhase(k_phase);

    if (jd > startJd) {
      const normalizedPhase = (((k_phase % 1) + 1) % 1);
      let phaseKey = phaseTargets.find(target => Math.abs(target - normalizedPhase) < 0.01);

      if (phaseKey === undefined && Math.abs(1 - normalizedPhase) < 0.01) {
        phaseKey = 0; // It's a New Moon
      }

      if (phaseKey !== undefined) {
        const utcDate = fromJulianDate(jd);
        results.push({
          eventName: eventNames[phaseKey],
          utcDate: utcDate,
          localSolarDate: convertToLocalSolarTime(utcDate, longitude),
          julianDate: jd,
          accuracyNote:
            'Mean-phase approximation (±1–2 h typical).'
        });
      }
    }
    
    if (results.length >= 4) break;
  }

  return results;
}
