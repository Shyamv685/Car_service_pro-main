
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER'
}

export enum CarType {
  SEDAN = 'Sedan',
  SUV = 'SUV',
  LUXURY = 'Luxury',
  HATCHBACK = 'Hatchback'
}

export enum FuelType {
  PETROL = 'Petrol',
  DIESEL = 'Diesel',
  ELECTRIC = 'Electric',
  HYBRID = 'Hybrid'
}

export enum Transmission {
  MANUAL = 'Manual',
  AUTOMATIC = 'Automatic'
}

export enum ServiceStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  REJECTED = 'Rejected'
}

export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  timestamp: number;
}

export interface VehicleHealth {
  oilLife: number; // Percentage 0-100
  tirePressure: number; // PSI (avg)
  batteryHealth: number; // Percentage 0-100
  brakePadWear: number; // Percentage 0-100
  lastServiceDate: string;
  mileage: number;
}

export interface Car {
  id: string;
  model: string;
  brand: string;
  image: string;
  pricePerHour: number;
  pricePerDay: number;
  fuelType: FuelType;
  transmission: Transmission;
  seats: number;
  location: { lat: number; lng: number; name: string };
  available: boolean;
  rating: number;
  health?: VehicleHealth; // New field for predictive maintenance
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
  duration?: string;
  includes?: string[];
}

export interface Booking {
  id: string;
  carId?: string; // If rental
  serviceId?: string; // If service
  userId: string;
  driverId?: string;
  type: 'RENTAL' | 'SERVICE';
  startDate: string;
  endDate?: string; // For rental
  totalCost: number;
  status: BookingStatus | ServiceStatus;
  location?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  address?: string;
  bio?: string;
}

export interface Driver extends User {
  licenseNumber: string;
  licenseExpiry?: string;
  phone: string; // Required for drivers
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY';
  rating: number;
  tripsCompleted: number;
  age?: number;
  quote?: string;
  earnings?: number;
}
