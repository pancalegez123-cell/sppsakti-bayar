import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types/spp';

interface UserWithPassword extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  addUser: (data: { name: string; email: string; password: string; role: UserRole }) => boolean;
  updateUser: (id: string, data: { name: string; email: string; role: UserRole }) => boolean;
  deleteUser: (id: string) => boolean;
  resetPassword: (id: string) => string | null;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUsers: UserWithPassword[] = [
  { id: '1', name: 'Admin Sekolah', email: 'admin@spp.id', role: 'admin', password: 'admin123' },
  { id: '2', name: 'Bendahara', email: 'bendahara@spp.id', role: 'bendahara', password: 'bendahara123' },
  { id: '3', name: 'Budi Pratama', email: 'wali@spp.id', role: 'wali', password: 'wali123' },
  { id: '4', name: 'Operator Sekolah', email: 'operator@spp.id', role: 'operator', password: 'operator123' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<UserWithPassword[]>(initialUsers);
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const found = allUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const users: User[] = allUsers.map(({ password: _, ...u }) => u);

  const addUser = useCallback((data: { name: string; email: string; password: string; role: UserRole }): boolean => {
    const exists = allUsers.some(u => u.email === data.email);
    if (exists) return false;
    setAllUsers(prev => [...prev, { ...data, id: `u-${Date.now()}` }]);
    return true;
  }, [allUsers]);

  const updateUser = useCallback((id: string, data: { name: string; email: string; role: UserRole }): boolean => {
    const emailConflict = allUsers.some(u => u.id !== id && u.email === data.email);
    if (emailConflict) return false;
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    // Update current user if editing self
    setUser(prev => prev && prev.id === id ? { ...prev, ...data } : prev);
    return true;
  }, [allUsers]);

  const deleteUser = useCallback((id: string): boolean => {
    setAllUsers(prev => prev.filter(u => u.id !== id));
    return true;
  }, []);

  const resetPassword = useCallback((id: string): string | null => {
    const newPass = Math.random().toString(36).slice(-8);
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPass } : u));
    return newPass;
  }, []);

  const changePassword = useCallback((currentPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    const found = allUsers.find(u => u.id === user.id && u.password === currentPassword);
    if (!found) return false;
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));
    return true;
  }, [user, allUsers]);

  return (
    <AuthContext.Provider value={{
      user, users, login, logout, isAuthenticated: !!user,
      addUser, updateUser, deleteUser, resetPassword, changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
