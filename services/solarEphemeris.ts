import SunCalc from 'suncalc';
import { SolarTimesData } from '../types';

export function getSolarTimes(date: Date, latitude: number, longitude: number): SolarTimesData {
    const times = SunCalc.getTimes(date, latitude, longitude);

    return {
        sunrise: times.sunrise,
        sunset: times.sunset,
        solarNoon: times.solarNoon,
        goldenHourStart: times.goldenHour, // SunCalc uses 'goldenHour' for the start of evening golden hour
        goldenHourEnd: times.sunriseEnd, // Corresponds to the end of morning golden hour
        nauticalDawn: times.nauticalDawn,
        nauticalDusk: times.nauticalDusk,
    };
}