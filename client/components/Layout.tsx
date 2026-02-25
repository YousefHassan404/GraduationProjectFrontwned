import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, MessageSquare, Upload, Settings } from "lucide-react";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] text-slate-200">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-white/5 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl tracking-wide group-hover:text-blue-400 transition">
                Brain Care
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && (
                <>
                  <NavButton to="/chat" icon={<MessageSquare size={18} />} active={isActive("/chat")} label="Chat" />
                  <NavButton to="/records" icon={<Upload size={18} />} active={isActive("/records")} label="Records" />
                  <NavButton to="/profile" icon={<User size={18} />} active={isActive("/profile")} label="Profile" />
                  <NavButton to="/predict" icon={<Settings size={18} />} active={isActive("/predict")} label="Predict 2D" />
                  <NavButton to="/predict3d" icon={<Settings size={18} />} active={isActive("/predict3d")} label="Predict 3D" />
                </>
              )}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div className="text-sm text-slate-400">
                    Welcome, <span className="text-blue-400 font-medium">{user?.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 border-slate-700 bg-slate-800 hover:bg-red-600 hover:border-red-500 transition-all duration-300"
                  >
                    <LogOut size={18} />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 hover:bg-slate-700">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Button */}
            <button
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-800 mt-3 pt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <MobileNav to="/chat" label="Chat" />
                  <MobileNav to="/records" label="Records" />
                  <MobileNav to="/profile" label="Profile" />
                  <MobileNav to="/predict" label="Predict" />
                  <MobileNav to="/predict3d" label="Predict 3D" />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full border-slate-700 bg-slate-800 hover:bg-red-600"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <MobileNav to="/login" label="Login" />
                  <MobileNav to="/register" label="Register" />
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0b1120]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-slate-400">
            <div>
              <h3 className="font-bold text-lg text-white mb-3">Brain Care</h3>
              <p className="text-sm leading-relaxed">
                Advanced AI-powered brain tumor detection & 3D segmentation platform.
              </p>
            </div>

            <FooterSection title="Features" items={["AI Detection", "3D Segmentation", "Reports", "Medical Records"]} />
            <FooterSection title="Support" items={["Documentation", "Help Center", "Contact"]} />
            <FooterSection title="Legal" items={["Privacy Policy", "Terms of Service"]} />
          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>© 2026 Brain Care. All rights reserved.</p>
            <p className="text-blue-400 font-medium">Powered By Yousef Hassan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Components */

function NavButton({ to, icon, active, label }: any) {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 transition-all duration-300 ${
          active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            : "hover:bg-slate-800 hover:text-blue-400"
        }`}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
}

function MobileNav({ to, label }: any) {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start hover:bg-slate-800"
      >
        {label}
      </Button>
    </Link>
  );
}

function FooterSection({ title, items }: any) {
  return (
    <div>
      <h4 className="font-semibold text-white mb-3">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((item: string, i: number) => (
          <li key={i} className="hover:text-blue-400 cursor-pointer transition">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}