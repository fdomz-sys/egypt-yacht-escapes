import React, { createContext, useContext, useState, useEffect } from "react";
import { Booking } from "@/lib/data";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<{ error?: string }>;
  logout: () => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("seascape-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("seascape-bookings");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("seascape-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("seascape-user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("seascape-bookings", JSON.stringify(bookings));
  }, [bookings]);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    // Mock authentication
    if (password.length < 6) {
      return { error: "Invalid credentials" };
    }
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split("@")[0],
    };
    
    setUser(mockUser);
    return {};
  };

  const signup = async (email: string, password: string, name: string, phone?: string): Promise<{ error?: string }> => {
    // Mock registration
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      phone,
    };
    
    setUser(mockUser);
    return {};
  };

  const logout = () => {
    setUser(null);
  };

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b))
    );
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, bookings, addBooking, cancelBooking }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
