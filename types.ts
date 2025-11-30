
export interface User {
  id: string; // mapped from objectId
  objectId?: string;
  email: string;
  name: string; // computed from firstName + lastName or name field
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  contactNumber?: string;
}

export interface StoreProfile {
  merchantId?: string;
  objectId?: string;
  storeName: string;
  address: string;
  contactNumber: string;
  storeType: string; // Renamed from shopCategory
  description: string;
  logoUrl?: string;
  storeOpen?: boolean;
  autoSchedule?: boolean;
  openingTime?: string;
  closingTime?: string;
}

export interface Category {
  id: string;
  merchantId?: string;
  name: string;
  description?: string;
  productCount: number;
}

export enum AuthState {
  UNAUTHENTICATED,
  ONBOARDING,
  AUTHENTICATED
}

export interface SaleMetric {
  date: string;
  amount: number;
  orders: number;
}

export interface Product {
  id: string;
  merchantId?: string;
  objectId?: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable: boolean;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  merchantId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  date: string;
}
