import { Brain, User, Settings, LogOut, Home, Menu, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
  onNavigateSettings: () => void;
  onCallAI: () => void;
  onToggleSidebar?: () => void;
}

/* --- Navbar/Navigation Component ---
   Fixed top navigation bar with:
   - Logo and home button
   - Navigation links (Home, Profile, Settings)
   - "Call AI" button (neon gradient with glow effect)
   - Logout button

   Design Features:
   - Backdrop blur with semi-transparent background
   - Gradient text for "Jurisly" branding
   - Responsive flex layout
   - Hover effects and transitions on all buttons
   - Glow shadow on "Call AI" button
   - Mobile responsive menu

   Mobile Note:
   - Hamburger menu handled in ChatPage component
   - Mobile nav items hidden on small screens
   - New toggle button for navigation on mobile
--- Navbar End --- */

export function Navbar({ onNavigateHome, onNavigateProfile, onNavigateSettings, onCallAI, onToggleSidebar }: NavbarProps) {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = async (callback: () => void | Promise<void>) => {
    await callback();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all hover:scale-110"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Nav Items - Center (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
              <button
                onClick={onNavigateHome}
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={onNavigateProfile}
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={onNavigateSettings}
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              {/* Call AI Button */}
              <button
                onClick={onCallAI}
                className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 font-medium text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 group-hover:animate-pulse" />
                  <span>Call AI</span>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
              </button>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="text-white/70 hover:text-red-400 transition-colors flex items-center gap-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Logo - Right Side */}
            <button onClick={onNavigateHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity ml-auto">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Jurisly
              </span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <span className="font-bold text-white">J</span>
              </div>
            </button>

            {/* Mobile Menu Toggle Button (Visible only on mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all hover:scale-110"
              title="Toggle Navigation Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown */}
      <div
        className={`fixed top-16 right-0 z-40 md:hidden backdrop-blur-xl bg-white/10 border-b border-white/20 w-full transform transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen
            ? 'opacity-100 scale-y-100 visible'
            : 'opacity-0 scale-y-95 invisible'
        }`}
        style={{
          transformOrigin: 'top',
          transform: isMobileMenuOpen ? 'scaleY(1)' : 'scaleY(0.95)',
        }}
      >
        <div className="px-6 py-4 flex flex-col gap-3">
          <button
            onClick={() => handleNavClick(onNavigateHome)}
            className="text-white/90 hover:text-white transition-colors flex items-center gap-2 py-2"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => handleNavClick(onNavigateProfile)}
            className="text-white/90 hover:text-white transition-colors flex items-center gap-2 py-2"
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => handleNavClick(onNavigateSettings)}
            className="text-white/90 hover:text-white transition-colors flex items-center gap-2 py-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

          {/* Call AI Button in Mobile Menu */}
          <button
            onClick={() => handleNavClick(onCallAI)}
            className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 font-medium text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105 w-full flex items-center justify-center gap-2"
          >
            <Brain className="w-5 h-5 group-hover:animate-pulse" />
            <span>Call AI</span>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
          </button>

          {/* Logout Button */}
          <button
            onClick={() => handleNavClick(logout)}
            className="text-white/70 hover:text-red-400 transition-colors flex items-center gap-2 py-2"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
