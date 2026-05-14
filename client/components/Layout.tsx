import { useAuth } from '@/lib/auth-context';
import { hasPermission, UserRole } from '@/lib/roles';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Menu, X, LogOut, User,
  MessageSquare, Upload, Settings, Brain, FlaskConical,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

// ─── Nav items config ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/chat',      label: 'Chat',       icon: MessageSquare, permission: 'USE_CHAT'           },
  { to: '/lab',       label: 'Lab Portal', icon: FlaskConical,  permission: 'SEND_MRI_TO_DOCTOR' },
  { to: '/predict',   label: 'Predict 2D', icon: Settings,      permission: 'PREDICT_2D'         },
  { to: '/predict3d', label: 'Predict 3D', icon: Brain,         permission: 'PREDICT_3D'         },
  { to: '/records',   label: 'Records',    icon: Upload,        permission: 'VIEW_RECORDS'       },
  { to: '/profile',   label: 'Profile',    icon: User,          permission: undefined            },
] as const;

// ─────────────────────────────────────────────────────────────────────────────

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const visibleItems = NAV_ITEMS.filter(({ permission }) => {
    if (!isAuthenticated) return false;
    if (!permission) return true;
    return hasPermission(user?.role as UserRole, permission);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-[#0f172a] dark:via-[#0b1120] dark:to-[#020617] text-slate-800 dark:text-slate-200 transition-colors duration-300">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-sm dark:shadow-lg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl tracking-wide text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                Brain Care
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {visibleItems.map(({ to, label, icon: Icon }) => (
                <NavButton key={to} to={to} icon={<Icon size={18} />} active={isActive(to)} label={label} />
              ))}
            </div>

            {/* Auth + Theme Section */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Welcome,{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{user?.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full capitalize ${
                      user?.role === 'lab'
                        ? 'bg-emerald-100 dark:bg-emerald-700/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {user?.role === 'lab' ? '🏥 Lab' : user?.role}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-600 dark:hover:border-red-500 dark:hover:text-white transition-all duration-300"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-600 dark:text-slate-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-200 dark:border-slate-800 mt-3 pt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {visibleItems.map(({ to, label }) => (
                    <MobileNav key={to} to={to} label={label} active={isActive(to)} onNavigate={() => setMobileMenuOpen(false)} />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full mt-2 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-600 dark:hover:text-white"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <MobileNav to="/login" label="Login" active={isActive('/login')} onNavigate={() => setMobileMenuOpen(false)} />
                  <MobileNav to="/register" label="Register" active={isActive('/register')} onNavigate={() => setMobileMenuOpen(false)} />
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-slate-500 dark:text-slate-400">
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3">Brain Care</h3>
              <p className="text-sm leading-relaxed">
                Advanced AI-powered brain tumor detection & 3D segmentation platform.
              </p>
            </div>
            <FooterSection title="Features" items={['AI Detection', '3D Segmentation', 'Reports', 'Medical Records']} />
            <FooterSection title="Support" items={['Documentation', 'Help Center', 'Contact']} />
            <FooterSection title="Legal" items={['Privacy Policy', 'Terms of Service']} />
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <p>© 2026 Brain Care. All rights reserved.</p>
            <p className="text-blue-500 dark:text-blue-400 font-medium">Powered By Yousef Hassan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavButton({ to, icon, active, label }: { to: string; icon: React.ReactNode; active: boolean; label: string }) {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 transition-all duration-300 ${
          active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
}

function MobileNav({ to, label, active, onNavigate }: { to: string; label: string; active: boolean; onNavigate: () => void }) {
  return (
    <Link to={to} onClick={onNavigate}>
      <Button
        variant="ghost"
        size="sm"
        className={`w-full justify-start transition-all ${
          active
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        {label}
      </Button>
    </Link>
  );
}

function FooterSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-slate-800 dark:text-white mb-3">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={i} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition">{item}</li>
        ))}
      </ul>
    </div>
  );
}
