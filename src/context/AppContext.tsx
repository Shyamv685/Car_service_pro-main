
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, Booking, Car, Driver, BookingStatus, ServiceStatus, AppNotification } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_CARS, MOCK_DRIVERS, CURRENT_USER as MOCK_USER } from '../constants';

// Initial constants for fallback/loading
const DEFAULT_USER: User = {
  id: '',
  name: '',
  email: '',
  role: UserRole.USER,
  avatar: 'https://via.placeholder.com/150',
};

interface AppContextType {
  currentUser: User | Driver;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, email: string, password?: string, name?: string, isSignUp?: boolean) => Promise<string | null>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User | Driver>) => void;
  cars: Car[];
  bookings: Booking[];
  drivers: Driver[];
  addBooking: (booking: Booking) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus | ServiceStatus, updates?: Partial<Booking>) => Promise<void>;
  rateBooking: (id: string, rating: number, feedback: string) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  addCar: (car: Car) => Promise<void>;
  addDriver: (driver: Driver) => void;
  deleteDriver: (id: string) => void;
  notifications: AppNotification[];
  addNotification: (msg: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  isEditProfileOpen: boolean;
  openEditProfile: () => void;
  closeEditProfile: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRoleState] = useState<UserRole>(UserRole.USER);
  const [currentUser, setCurrentUser] = useState<User | Driver>(DEFAULT_USER);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Data States
  const [cars, setCars] = useState<Car[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // 1. Check active session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // 2. Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCars();
      fetchBookings();
      fetchDrivers();
    }
  }, [isAuthenticated]);

  const checkSession = async () => {
    // FALLBACK: If Supabase keys are not set, check localStorage for demo session
    if (!isSupabaseConfigured) {
      console.log("Supabase not configured. Using Mock Data.");
      const savedUser = localStorage.getItem('mockUser');
      const savedRole = localStorage.getItem('mockRole');
      if (savedUser && savedRole) {
        setCurrentUser(JSON.parse(savedUser));
        setRoleState(savedRole as UserRole);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session) {
        await fetchUserProfile(session.user.id, session.user.email!);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn("Session check failed, staying logged out", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string, email: string) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const userRole = data.role as UserRole;
        setRoleState(userRole);
        setCurrentUser({
          id: data.id,
          email: email,
          name: data.name,
          role: userRole,
          avatar: data.avatar || 'https://via.placeholder.com/150',
          phone: data.phone,
          address: data.address,
          bio: data.bio,
          // Driver specific fields
          licenseNumber: data.license_number,
          status: data.status,
          rating: data.rating || 5.0,
          earnings: data.earnings
        } as User | Driver);
      }
    } catch (error) {
       console.warn("Profile fetch failed", error);
       // Fallback for hybrid state
       setCurrentUser({ ...MOCK_USER, id: userId, email });
    }
  };

  const fetchCars = async () => {
    if (!isSupabaseConfigured) {
      // Mock Data
      if (cars.length === 0) setCars(MOCK_CARS);
      return;
    }

    try {
      const { data, error } = await supabase.from('cars').select('*');
      if (error) throw error;
      if (data) {
        setCars(data.map(c => ({
          ...c,
          location: typeof c.location === 'string' ? JSON.parse(c.location) : c.location
        })));
      }
    } catch (error) {
      console.warn("Fetch cars failed", error);
      setCars(MOCK_CARS);
    }
  };

  const fetchBookings = async () => {
    if (!isSupabaseConfigured) {
      // Keep existing bookings or initialize empty
      return;
    }

    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
         const mapped: Booking[] = data.map(b => ({
            id: b.id,
            userId: b.user_id,
            carId: b.car_id,
            serviceId: b.service_id,
            driverId: b.driver_id,
            type: b.type,
            startDate: b.start_date,
            endDate: b.end_date,
            totalCost: b.total_cost,
            status: b.status,
            location: b.location,
            notes: b.notes,
            rating: b.rating,
            feedback: b.feedback
         }));
         setBookings(mapped);
      }
    } catch (error) {
      console.warn("Fetch bookings failed", error);
    }
  };

  const fetchDrivers = async () => {
     if (!isSupabaseConfigured) {
       if (drivers.length === 0) setDrivers(MOCK_DRIVERS);
       return;
     }

     try {
       const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'DRIVER');
          
       if (error) throw error;
       if (data) {
          setDrivers(data.map(d => ({
             id: d.id,
             name: d.name,
             email: d.email || 'driver@test.com',
             role: UserRole.DRIVER,
             avatar: d.avatar || 'https://via.placeholder.com/150',
             phone: d.phone,
             licenseNumber: d.license_number,
             status: d.status || 'AVAILABLE',
             rating: d.rating || 5.0,
             tripsCompleted: d.trips_completed || 0,
             earnings: d.earnings || 0,
             address: d.address,
             bio: d.bio,
             quote: d.quote
          })));
       }
     } catch (error) {
       console.warn("Fetch drivers failed", error);
       setDrivers(MOCK_DRIVERS);
     }
  };

  const login = async (selectedRole: UserRole, email: string, password?: string, name?: string, isSignUp?: boolean): Promise<string | null> => {
    if (!password) return "Password required";
    setIsLoading(true);

    // MOCK LOGIN if Supabase not configured
    if (!isSupabaseConfigured) {
        setTimeout(() => setIsLoading(false), 800); // Simulate delay
        
        let mockUser: User | Driver;
        if (selectedRole === UserRole.DRIVER) {
           mockUser = MOCK_DRIVERS[0];
        } else {
           mockUser = { ...MOCK_USER, role: selectedRole, email, name: name || 'Demo User' };
        }
        
        setCurrentUser(mockUser);
        setRoleState(selectedRole);
        setIsAuthenticated(true);
        
        // Save Mock Session
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        localStorage.setItem('mockRole', selectedRole);

        // Load Initial Data
        setCars(MOCK_CARS);
        setDrivers(MOCK_DRIVERS);
        
        addNotification("Demo Mode: Logged in (Local Storage)");
        return null;
    }

    // REAL LOGIN
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              role: selectedRole
            }
          }
        });
        if (error) throw error;
        addNotification("Account created! Please login.");
        return null;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        if (data && data.session) {
           await fetchUserProfile(data.session.user.id, email);
           setIsAuthenticated(true);
           addNotification("Logged in successfully.");
        }
        return null;
      }
    } catch (err: any) {
      console.warn("Supabase auth failed:", err.message);
      return err.message;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try { await supabase.auth.signOut(); } catch (e) { console.warn(e); }
    } else {
      localStorage.removeItem('mockUser');
      localStorage.removeItem('mockRole');
    }

    setIsAuthenticated(false);
    setRoleState(UserRole.USER);
    setCurrentUser(DEFAULT_USER);
    setCars([]);
    setBookings([]);
    setDrivers([]);
  };

  const updateCurrentUser = async (updates: Partial<User | Driver>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
    
    if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              name: updates.name,
              avatar: updates.avatar,
              phone: (updates as any).phone,
              address: (updates as any).address,
              bio: (updates as any).bio
            })
            .eq('id', currentUser.id);
          if (error) throw error;
          addNotification("Profile saved.");
        } catch (error) {
          addNotification("Saved locally (DB sync failed).");
        }
    } else {
        // Update local storage mock user
        const updated = { ...currentUser, ...updates };
        localStorage.setItem('mockUser', JSON.stringify(updated));
        addNotification("Profile saved (Local Only).");
    }
  };

  const addBooking = async (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
    addNotification(`Booking confirmed! ID: ${booking.id}`);

    if (isSupabaseConfigured) {
      try {
        const dbBooking = {
          user_id: booking.userId,
          car_id: booking.carId,
          service_id: booking.serviceId,
          type: booking.type,
          start_date: booking.startDate,
          end_date: booking.endDate,
          total_cost: booking.totalCost,
          status: booking.status,
          location: booking.location,
          notes: booking.notes,
          custom_car_name: booking.customCarName
        };
        await supabase.from('bookings').insert(dbBooking);
      } catch (error) { console.warn("Booking DB insert failed", error); }
    }
  };

  const updateBookingStatus = async (id: string, status: BookingStatus | ServiceStatus, updates: Partial<Booking> = {}) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status, ...updates } : b));
    
    // Improved Notification Logic
    let notifMsg = `Booking ${status}`;
    if (status === BookingStatus.CONFIRMED && updates.driverId) {
        notifMsg = "Driver Accepted Booking! Vehicle is on the way.";
    } else if (status === BookingStatus.REJECTED) {
        notifMsg = "Booking Rejected. Please try another vehicle.";
    } else if (status === BookingStatus.COMPLETED) {
        notifMsg = "Trip Completed. Thank you!";
    }
    
    addNotification(notifMsg);

    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = { status };
        if (updates.driverId) dbUpdates.driver_id = updates.driverId;
        await supabase.from('bookings').update(dbUpdates).eq('id', id);
      } catch (error) { console.warn("Booking update failed", error); }
    }
  };

  const rateBooking = async (id: string, rating: number, feedback: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, rating, feedback } : b));
    addNotification("Feedback submitted.");

    if (isSupabaseConfigured) {
       try { await supabase.from('bookings').update({ rating, feedback }).eq('id', id); } catch (e) {}
    }
  };

  const deleteCar = async (id: string) => {
    setCars(prev => prev.filter(c => c.id !== id));
    addNotification('Car removed.');
    if (isSupabaseConfigured) {
       try { await supabase.from('cars').delete().eq('id', id); } catch (e) {}
    }
  };

  const addCar = async (car: Car) => {
     setCars(prev => [...prev, car]);
     addNotification('Car added successfully.');
     
     if (isSupabaseConfigured) {
       try {
         const dbCar = {
            brand: car.brand,
            model: car.model,
            image: car.image,
            price_per_hour: car.pricePerHour,
            price_per_day: car.pricePerDay,
            fuel_type: car.fuelType,
            transmission: car.transmission,
            seats: car.seats,
            location: car.location, 
            available: car.available,
            rating: car.rating
         };
         await supabase.from('cars').insert(dbCar);
       } catch (e) { console.warn("Car DB insert failed", e); }
     }
  };

  const addDriver = (driver: Driver) => {
    addNotification("To add a driver, they must Sign Up with the 'Driver' role.");
  };

  const deleteDriver = (id: string) => {
    addNotification("Driver deletion restricted.");
  };

  const addNotification = (msg: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      message: msg,
      read: false,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const openEditProfile = () => setIsEditProfileOpen(true);
  const closeEditProfile = () => setIsEditProfileOpen(false);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      role,
      isAuthenticated,
      isLoading,
      login,
      logout,
      updateCurrentUser,
      cars,
      bookings,
      drivers,
      addBooking,
      updateBookingStatus,
      rateBooking,
      deleteCar,
      addCar,
      addDriver,
      deleteDriver,
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
      isEditProfileOpen,
      openEditProfile,
      closeEditProfile,
      darkMode,
      toggleDarkMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
