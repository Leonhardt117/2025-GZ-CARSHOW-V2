
export enum ZoneType {
  PASSENGER = '乘用车',
  LUXURY = '豪华/超跑',
  NEV = '新能源/科技',
  COMPONENTS = '供应链/技术',
  COMMERCIAL = '商用车'
}

export interface CarModel {
  name: string;
  highlight: string;
  isNewLaunch: boolean;
  note?: string; // Display note from CSV if available
}

export interface Brand {
  id: string;
  booth: string; // e.g., A-101
  name: string;
  logo?: string;
  stockCode?: string; // e.g., HK.1211
  models: CarModel[];
  fullModelList?: string[]; 
  description: string;
}

export interface Hall {
  id: string;
  code: string; // e.g., "1.1", "2.1"
  area: 'A' | 'B' | 'C' | 'D';
  floor: 1 | 2;
  type: ZoneType;
  brands: Brand[];
  occupancy: number; // 0-100%
}

export interface InvestmentInsight {
  brandName: string;
  analysis: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
}
