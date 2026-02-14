import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, CreditCard, History, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'bendahara', 'wali'] },
  { label: 'Siswa', path: '/students', icon: Users, roles: ['admin', 'bendahara'] },
  { label: 'Bayar', path: '/payments', icon: CreditCard, roles: ['admin', 'bendahara'] },
  { label: 'Riwayat', path: '/history', icon: History, roles: ['admin', 'bendahara', 'wali'] },
  { label: 'Laporan', path: '/reports', icon: FileText, roles: ['admin', 'bendahara'] },
];

export default function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around px-1 py-2">
        {filteredNav.slice(0, 5).map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors min-w-0',
                active
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', active && 'text-primary')} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
