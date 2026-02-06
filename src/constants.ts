
import { Car, CarType, FuelType, Transmission, ServiceType, User, UserRole, Driver } from './types';

export const MOCK_CARS: Car[] = [
  {
    id: 'c1',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    pricePerHour: 800,
    pricePerDay: 5200,
    fuelType: FuelType.PETROL,
    transmission: Transmission.MANUAL,
    seats: 5,
    location: { lat: 37.7749, lng: -122.4194, name: 'Downtown Hub' },
    available: true,
    rating: 4.2,
    health: {
      oilLife: 85,
      tirePressure: 32,
      batteryHealth: 92,
      brakePadWear: 15,
      lastServiceDate: '2024-02-15',
      mileage: 12500
    }
  },
  {
    id: 'c2',
    brand: 'Tata',
    model: 'Nexon',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    pricePerHour: 1000,
    pricePerDay: 6800,
    fuelType: FuelType.DIESEL,
    transmission: Transmission.MANUAL,
    seats: 5,
    location: { lat: 37.7849, lng: -122.4094, name: 'Airport' },
    available: true,
    rating: 4.3,
    health: {
      oilLife: 45,
      tirePressure: 30,
      batteryHealth: 88,
      brakePadWear: 40,
      lastServiceDate: '2023-11-20',
      mileage: 28400
    }
  },
  {
    id: 'c3',
    brand: 'Hyundai',
    model: 'Creta',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    pricePerHour: 1200,
    pricePerDay: 8000,
    fuelType: FuelType.PETROL,
    transmission: Transmission.AUTOMATIC,
    seats: 5,
    location: { lat: 37.7649, lng: -122.4294, name: 'Suburban Center' },
    available: true,
    rating: 4.5,
    health: {
      oilLife: 15, // Low - should trigger alert
      tirePressure: 28, // Low
      batteryHealth: 95,
      brakePadWear: 10,
      lastServiceDate: '2023-08-10',
      mileage: 45200
    }
  },
  {
    id: 'c4',
    brand: 'Mahindra',
    model: 'Thar',
    image: 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?auto=format&fit=crop&w=800&q=80',
    pricePerHour: 1400,
    pricePerDay: 9600,
    fuelType: FuelType.DIESEL,
    transmission: Transmission.MANUAL,
    seats: 4,
    location: { lat: 37.7549, lng: -122.4394, name: 'Luxury Garage' },
    available: true,
    rating: 4.6,
    health: {
      oilLife: 98,
      tirePressure: 35,
      batteryHealth: 100,
      brakePadWear: 2,
      lastServiceDate: '2024-03-01',
      mileage: 1200
    }
  },
  {
    id: 'c5',
    brand: 'Kia',
    model: 'Seltos',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
    pricePerHour: 1300,
    pricePerDay: 9000,
    fuelType: FuelType.PETROL,
    transmission: Transmission.AUTOMATIC,
    seats: 5,
    location: { lat: 37.7549, lng: -122.4394, name: 'City Center' },
    available: true,
    rating: 4.4,
    health: {
      oilLife: 60,
      tirePressure: 33,
      batteryHealth: 85,
      brakePadWear: 30,
      lastServiceDate: '2024-01-10',
      mileage: 18900
    }
  },
  {
    id: 'c6',
    brand: 'Mahindra',
    model: 'Scorpio',
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
    pricePerHour: 1500,
    pricePerDay: 10500,
    fuelType: FuelType.DIESEL,
    transmission: Transmission.MANUAL,
    seats: 7,
    location: { lat: 37.7549, lng: -122.4394, name: 'City Center' },
    available: true,
    rating: 4.5,
    health: {
      oilLife: 78,
      tirePressure: 34,
      batteryHealth: 90,
      brakePadWear: 25,
      lastServiceDate: '2024-02-05',
      mileage: 22100
    }
  }
];

export const SERVICE_TYPES: ServiceType[] = [
  { id: 's1', name: 'General service', description: 'Complete vehicle inspection', basePrice: 2000, icon: 'wrench' },
  { id: 's2', name: 'Oil change', description: 'Engine oil replacement', basePrice: 1500, icon: 'droplet' },
  { id: 's3', name: 'Wash and polish', description: 'Complete cleaning', basePrice: 800, icon: 'sparkles' },
  { id: 's4', name: 'Dent and paint', description: 'Body repair works', basePrice: 5000, icon: 'hammer' }
];

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.USER,
  avatar: 'https://picsum.photos/100/100?random=user',
  phone: '+1 555-0199',
  address: '123 Market St, San Francisco',
  bio: 'Car enthusiast and frequent traveler.'
};

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Alex Johnson',
    email: 'alex@driver.com',
    role: UserRole.DRIVER,
    avatar: 'https://i.pravatar.cc/150?u=alex',
    licenseNumber: 'DL-CA-908712',
    licenseExpiry: '2026-08-15',
    phone: '+1 555-101-202',
    status: 'AVAILABLE',
    rating: 4.7,
    tripsCompleted: 142,
    earnings: 12450,
    age: 32,
    address: '12 Baker St, San Francisco, CA',
    quote: 'Smooth driving and punctual.'
  },
  {
    id: 'd2',
    name: 'Priya Singh',
    email: 'priya@driver.com',
    role: UserRole.DRIVER,
    avatar: 'https://i.pravatar.cc/150?u=priya',
    licenseNumber: 'DL-CA-774420',
    licenseExpiry: '2025-11-30',
    phone: '+1 555-303-404',
    status: 'ON_TRIP',
    rating: 4.9,
    tripsCompleted: 215,
    earnings: 18900,
    age: 28,
    address: '55 Elm Ave, San Jose, CA',
    quote: 'Very courteous and safe.'
  },
  {
    id: 'd3',
    name: 'Marcus Lee',
    email: 'marcus@driver.com',
    role: UserRole.DRIVER,
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    licenseNumber: 'DL-CA-662100',
    licenseExpiry: '2024-05-20',
    phone: '+1 555-505-606',
    status: 'OFF_DUTY',
    rating: 4.5,
    tripsCompleted: 89,
    earnings: 7800,
    age: 41,
    address: '98 Pearl Rd, Oakland, CA',
    quote: 'No feedback yet'
  }
];
