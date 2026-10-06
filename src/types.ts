/**
 * AgriConnect TypeScript Definitions
 */

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  stage: 'Planted' | 'Sprouting' | 'Vegetative' | 'Flowering' | 'Harvest Ready' | 'Harvested';
  waterStatus: 'Optimal' | 'Needs Water' | 'Drowning';
  lastWatered: string;
  waterIntervalDays: number;
  notes?: string;
  areaAcres: number;
  expectedYieldKg: number;
}

export interface HourlyForecastItem {
  time: string;
  temp: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Thunderstorm' | 'Overcast' | 'Heavy Rain';
  rainChance: number;
  humidity: number;
  windSpeed: number;
}

export interface DailyForecastItem {
  day: string;
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Thunderstorm' | 'Overcast' | 'Heavy Rain';
  rainChance: number;
  humidity: number;
  windSpeed: number;
  summary: string;
}

export interface WeatherAdvisory {
  locationName?: string;
  temperature: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Thunderstorm' | 'Overcast' | 'Heavy Rain';
  summary: string;
  timestamp?: string;
  lastUpdated?: string;
  liveDate?: string;
  liveTime?: string;
  hourlyForecast?: HourlyForecastItem[];
  weeklyForecast?: DailyForecastItem[];
  cropAdvisories: {
    cropName: string;
    advice: string;
    actionRequired: boolean;
  }[];
  source?: string;
}

export interface MarketListing {
  id: string;
  sellerName: string;
  sellerContact: string;
  productName: string;
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Pulses' | 'Spices' | 'Others';
  price: number;
  unit: 'kg' | 'quintal' | 'ton' | 'box' | 'dozen';
  quantity: number;
  description: string;
  image?: string;
  location: string;
  dateAdded: string;
}

export interface EquipmentListing {
  id: string;
  ownerName: string;
  ownerContact: string;
  equipmentName: string;
  category: 'Tractor' | 'Tiller' | 'Harvester' | 'Seeder' | 'Irrigation' | 'Sprayer' | 'Other';
  pricePerDay: number;
  availability: 'Available' | 'Rented' | 'Maintenance';
  description: string;
  image?: string;
  condition: 'New' | 'Excellent' | 'Good' | 'Fair';
  location: string;
}

export interface PlantDiagnosis {
  id: string;
  plantName: string;
  image?: string;
  diseaseName: string;
  confidence: number;
  symptoms: string[];
  causes: string[];
  remedies: {
    organic: string[];
    chemical?: string[];
    preventive: string[];
  };
  diagnosedAt: string;
}

export interface GovScheme {
  id: string;
  name: string;
  department: string;
  description: string;
  benefits: string;
  officialPortalUrl?: string;
  portalName?: string;
  eligibility: {
    minLandSizeAcres?: number;
    maxLandSizeAcres?: number;
    farmerTypes: ('Small' | 'Marginal' | 'Large' | 'All')[];
    incomeLimit?: number;
    state?: string;
  };
  subsidyPercentage: number;
  deadline: string;
  formFields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'file';
    options?: string[];
    required: boolean;
  }[];
}

export interface SchemeApplication {
  id: string;
  schemeId: string;
  farmerName: string;
  phone: string;
  landSizeAcres: number;
  formData: Record<string, string>;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
}

export interface TelanganaCropPrice {
  id: string;
  cropName: string;
  variety: string;
  marketName: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modelPrice: number;
  prevModelPrice: number;
  arrivalsQuintals: number;
  grade: string;
  trend: 'Up' | 'Down' | 'Stable';
  lastUpdated: string;
}

export interface FarmerUser {
  aadhaar: string;
  phone: string;
  name: string;
  pacsId: string;
  landSize: number;
  state: string;
  district: string;
  preferredLanguage?: 'en' | 'te';
}

export type VerificationVerdict = 
  | 'VERIFIED_SAFE' 
  | 'CAUTION_REQUIRED' 
  | 'HIGH_RISK_WARNING' 
  | 'RECOMMENDED_PRACTICE' 
  | 'FACT_CHECKED_ACCURATE';

export interface VoiceDoubtVerificationResult {
  id: string;
  query: string;
  language: 'en' | 'te' | 'hi';
  cropContext?: string;
  growthStage?: string;
  spokenResponse: string;
  detailedExplanation: string;
  verdict: VerificationVerdict;
  confidence: number;
  category: 'Crop Disease' | 'Irrigation & Weather' | 'Fertilizers & Chemicals' | 'Mandi Prices' | 'Govt Schemes' | 'Machinery & Equipment' | 'General Agronomy';
  keyDirectives: {
    dos: string[];
    donts: string[];
  };
  actionTimeline: string;
  sourceEngine: string;
  timestamp: string;
  audioBase64?: string;
  // Advanced Agronomic Predictions & Impact Metrics
  predictedYieldImpact?: string;
  costSavingEstimate?: string;
  chemicalCompatibility?: string;
  biologicalMechanism?: string;
  alternativeOrganicSolution?: string;
  optimalApplicationWindow?: string;
  weatherDependencyFactor?: string;
  reliabilityScore?: number;
}

export interface VoiceDoubtPreset {
  id: string;
  title: string;
  query: string;
  category: string;
  icon: string;
  lang: 'en' | 'te' | 'hi';
}


