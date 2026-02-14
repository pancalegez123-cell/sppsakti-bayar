import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/spp';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: (User & { password: string })[] = [
  { id: '1', name: 'Admin Sekolah', email: 'admin@spp.id', role: 'admin', password: 'admin123' },
  { id: '2', name: 'Bendahara', email: 'bendahara@spp.id', role: 'bendahara', password: 'bendahara123' },
  { id: '3', name: 'Budi Pratama', email: 'wali@spp.id', role: 'wali', password: 'wali123' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
