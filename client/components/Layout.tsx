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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🧠</span>
              </div>
              <span className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
                NeuroAnalyze
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated && (
                <>
                  <Link to="/chat">
                    <Button
                      variant={isActive("/chat") ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <MessageSquare size={18} />
                      Chat
                    </Button>
                  </Link>
                  <Link to="/records">
                    <Button
                      variant={isActive("/records") ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Upload size={18} />
                      Records
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button
                      variant={isActive("/profile") ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <User size={18} />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/predict">
                    <Button
                      variant={isActive("/predict") ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Settings size={18} />
                      Predict
                    </Button>
                  </Link>
                  <Link to="/predict3d">
                    <Button
                      variant={isActive("/predict3d") ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Settings size={18} />
                      Predict 3D
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="text-sm text-slate-600">
                    {user?.name}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-200">
              {isAuthenticated && (
                <>
                  <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/chat") ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2 my-1"
                    >
                      <MessageSquare size={18} />
                      Chat
                    </Button>
                  </Link>
                  <Link to="/records" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/records") ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2 my-1"
                    >
                      <Upload size={18} />
                      Records
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/profile") ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2 my-1"
                    >
                      <User size={18} />
                      Profile
                    </Button>
                  </Link>
                  <div className="border-t border-slate-200 my-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full gap-2 justify-start"
                    >
                      <LogOut size={18} />
                      Logout
                    </Button>
                  </div>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-4">NeuroAnalyze</h3>
              <p className="text-sm text-slate-600">
                Advanced AI-powered brain tumor analysis system
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">AI Analysis</a></li>
                <li><a href="#" className="hover:text-blue-600">Medical Records</a></li>
                <li><a href="#" className="hover:text-blue-600">Reports</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 flex justify-between items-center">
            <p className="text-sm text-slate-600">
              © 2025 NeuroAnalyze. All rights reserved.
            </p>
            <p className="text-sm text-slate-600">
              Medical Grade AI Analysis
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
