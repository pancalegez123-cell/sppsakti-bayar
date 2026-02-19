import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, History, FileText, Receipt,
  BarChart3, Settings, LogOut, Menu, X, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ROLE_LABELS } from '@/types/spp';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'bendahara', 'wali'] },
  { label: 'Siswa', path: '/students', icon: Users, roles: ['admin', 'bendahara', 'operator'] },
  { label: 'Tagihan', path: '/bills', icon: Receipt, roles: ['admin', 'bendahara'] },
  { label: 'Pembayaran', path: '/payments', icon: CreditCard, roles: ['admin', 'bendahara'] },
  { label: 'Riwayat', path: '/history', icon: History, roles: ['admin', 'bendahara', 'wali'] },
  { label: 'Laporan', path: '/reports', icon: BarChart3, roles: ['admin', 'bendahara'] },
  { label: 'Pengaturan', path: '/settings', icon: Settings, roles: ['admin'] },
];

export default function MobileNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Hamburger button in mobile header — rendered via AppLayout */}
      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out sidebar */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary">
              <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-sidebar-foreground">SPP Manager</h2>
              <p className="text-xs text-sidebar-foreground/60">Sistem Pembayaran</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNav.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info & logout */}
        <div className="p-3 border-t border-sidebar-border">
          {user && (
            <div className="mb-2 px-2">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50">{ROLE_LABELS[user.role]}</p>
            </div>
          )}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex items-center gap-3 flex-1 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Expose toggle function */}
      <MobileNavTrigger onToggle={() => setOpen(prev => !prev)} />
    </>
  );
}

// Invisible component that exposes toggle via a global callback
function MobileNavTrigger({ onToggle }: { onToggle: () => void }) {
  // Store in window for AppLayout to call
  if (typeof window !== 'undefined') {
    (window as any).__mobileNavToggle = onToggle;
  }
  return null;
}
