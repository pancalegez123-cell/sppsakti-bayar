import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';
import { GraduationCap, LogOut } from 'lucide-react';
import { ROLE_LABELS } from '@/types/spp';
import ThemeToggle from '@/components/ThemeToggle';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">SPP Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user && ROLE_LABELS[user.role]}</span>
            <ThemeToggle />
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-muted">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 overflow-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
