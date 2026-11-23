// Investment Product Types
export interface InvestmentProduct {
  id: string;
  name: string;
  category: 'traditional' | 'alternative' | 'real-estate' | 'fixed-income' | 'commodity';
  subcategory: string;
  description: string;
  howItWorks: string;
  riskLevel: 1 | 2 | 3 | 4 | 5;
  expectedReturns: string;
  minInvestment: number;
  liquidity: 'high' | 'medium' | 'low' | 'very-low';
  timeHorizon: string;
  taxImplications: string;
  whoShouldInvest: string;
  pros: string[];
  cons: string[];
  platforms: string[];
  icon: string;
}

// SARFAESI Property Types
export interface Property {
  id: string;
  title: string;
  bank: string;
  branch: string;
  location: string;
  city: string;
  state: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land' | 'vehicle';
  reservePrice: number;
  marketValue: number | null;
  discount: number | null;
  auctionDate: string;
  emd: number;
  description: string;
  photos: string[];
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | null;
  createdAt: string;
}

// Watchlist Types
export interface WatchlistItem {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

// Alert Types
export interface Alert {
  id: string;
  userId: string;
  city: string;
  propertyType: string;
  maxPrice: number;
  minDiscount: number;
  createdAt: string;
}