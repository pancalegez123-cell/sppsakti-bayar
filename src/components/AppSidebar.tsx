import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  History,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/types/spp';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'bendahara', 'wali'] },
  { label: 'Siswa', path: '/students', icon: Users, roles: ['admin', 'bendahara'] },
  { label: 'Tagihan', path: '/bills', icon: FileText, roles: ['admin', 'bendahara'] },
  { label: 'Pembayaran', path: '/payments', icon: CreditCard, roles: ['admin', 'bendahara'] },
  { label: 'Riwayat', path: '/history', icon: History, roles: ['admin', 'bendahara', 'wali'] },
  { label: 'Laporan', path: '/reports', icon: BarChart3, roles: ['admin', 'bendahara'] },
  { label: 'Pengaturan', path: '/settings', icon: Settings, roles: ['admin'] },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-screen sticky top-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold truncate text-sidebar-foreground">SPP Manager</h2>
              <p className="text-xs text-sidebar-foreground/60 truncate">Sistem Pembayaran</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-sidebar-accent">
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {filteredNav.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && user && (
            <div className="mb-2 px-2">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50">{ROLE_LABELS[user.role]}</p>
            </div>
          )}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={logout}
              className="flex items-center gap-3 flex-1 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
