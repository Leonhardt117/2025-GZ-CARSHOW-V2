
import { Hall, ZoneType } from '../types';

// This file now only defines the PHYSICAL LAYOUT (The Skeleton).
// The actual Brand and Car data is loaded from /public/brands.csv

export const exhibitionHalls: Hall[] = [
  // --- AREA D (2nd Floor) ---
  { id: 'h17.2', code: '17.2', area: 'D', floor: 2, type: ZoneType.NEV, occupancy: 100, brands: [] },
  { id: 'h18.2', code: '18.2', area: 'D', floor: 2, type: ZoneType.NEV, occupancy: 100, brands: [] },
  { id: 'h19.2', code: '19.2', area: 'D', floor: 2, type: ZoneType.NEV, occupancy: 100, brands: [] },
  { id: 'h20.2', code: '20.2', area: 'D', floor: 2, type: ZoneType.LUXURY, occupancy: 100, brands: [] },
  
  // --- AREA D (1st Floor) ---
  { id: 'h20.1', code: '20.1', area: 'D', floor: 1, type: ZoneType.COMPONENTS, occupancy: 80, brands: [] },

  // --- AREA A (2nd Floor) ---
  { id: 'h1.2', code: '1.2', area: 'A', floor: 2, type: ZoneType.COMMERCIAL, occupancy: 0, brands: [] },
  { id: 'h2.2', code: '2.2', area: 'A', floor: 2, type: ZoneType.PASSENGER, occupancy: 100, brands: [] },
  { id: 'h3.2', code: '3.2', area: 'A', floor: 2, type: ZoneType.PASSENGER, occupancy: 100, brands: [] },
  { id: 'h4.2', code: '4.2', area: 'A', floor: 2, type: ZoneType.PASSENGER, occupancy: 100, brands: [] },
  { id: 'h5.2', code: '5.2', area: 'A', floor: 2, type: ZoneType.PASSENGER, occupancy: 100, brands: [] },

  // --- AREA A (1st Floor) ---
  { id: 'h1.1', code: '1.1', area: 'A', floor: 1, type: ZoneType.PASSENGER, occupancy: 100, brands: [] },
  { id: 'h2.1', code: '2.1', area: 'A', floor: 1, type: ZoneType.NEV, occupancy: 100, brands: [] },
  { id: 'h3.1', code: '3.1', area: 'A', floor: 1, type: ZoneType.PASSENGER, occupancy: 100, brands: [] },
  { id: 'h4.1', code: '4.1', area: 'A', floor: 1, type: ZoneType.PASSENGER, occupancy: 100, brands: [] },
  { id: 'h5.1', code: '5.1', area: 'A', floor: 1, type: ZoneType.LUXURY, occupancy: 100, brands: [] }
];
