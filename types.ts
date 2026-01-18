
export interface User {
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  createdAt: number;
}

export interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  color?: string;
}

export interface Integration {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  modelCode: string;
  stock: number;
  price: number;
  marketplaceStatus: {
    trendyol: boolean;
    hepsiburada: boolean;
    n11: boolean;
  };
  image?: string;
  images?: string[];
}

export enum NavSection {
  INTEGRATIONS = 'integrations',
  PRODUCTS = 'products',
  DESIGN = 'design',
  SUBSCRIPTION = 'subscription',
  ADMIN = 'admin'
}

export type MarketplaceType = 'trendyol' | 'hepsiburada' | 'n11' | 'amazon' | 'ciceksepeti';

export interface Store {
  id: string;
  type: MarketplaceType;
  name: string;
  status: 'connected' | 'error' | 'syncing';
  lastSync?: Date;
}

export interface GeneratedVariation {
  id: string;
  blob: string;
  printName: string;
  timestamp: number;
  isFavorite: boolean;
  state: {
    baseImage: string;
    currentPrint: string | null;
    background: string;
    printTransform: any;
    filters: any;
  }
}

// Added missing MediaItem interface required by AdminPanel.tsx
export interface MediaItem {
  id: string;
  url: string;
  uploadedBy: string;
  timestamp: number;
}
