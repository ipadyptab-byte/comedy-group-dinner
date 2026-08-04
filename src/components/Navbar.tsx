import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Bell,
  Sun,
  Moon,
  Plus,
  UtensilsCrossed,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import FamilyLoginModal from './FamilyLoginModal';
import CreateEventModal from './CreateEventModal';

interface NavbarProps {
  onOpenNotifications: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  activeTab,
  setActiveTab,
}) => {
  const {
    currentFamily,
    notifications,
    isDarkMode,
    toggleDarkMode,
    currentRole,
    logout,
  } = useApp();

  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Unread notification count for current family
  const unreadCount = notifications.filter(
    (n) => currentFamily && !n.readByFamilies.includes(currentFamily.id)
  ).length;

  // Handle PWA Install Prompt
  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      });
    } else {
      alert(
        'To install Comedy Group app on mobile:\n• iOS: Tap Share -> Add to Home Screen\n• Android: Tap Menu (⋮) -> Add to Home Screen / Install App'
      );
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full transition-colors duration-200 border-b border-white/10 bg-white/5 backdrop-blur-md text-slate-100 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-indigo-300 via-purple-200 to-rose-300 bg-clip-text text-transparent">
                  Comedy Group
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300 border border-white/15 backdrop-blur-sm">
                  Private 7-Family Group
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Dinner & Special Occasion Party Planner
              </p>
            </div>
          </div>

          {/* Center Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
            {[
              { id: 'events', label: 'Events' },
              { id: 'rsvp', label: 'RSVP & Order' },
              { id: 'summary', label: 'Live Summary' },
              { id: 'history', label: 'History' },
              { id: 'reports', label: 'Reports' },
              { id: 'profile', label: 'Profile' },
              ...(currentRole === 'admin' ? [{ id: 'admin', label: 'Admin Panel' }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Create Event Button (for Captain/Admin) */}
            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition-all border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Host Event</span>
            </button>

            {/* PWA Install Button */}
            {!isInstalled && (
              <button
                onClick={handleInstallPWA}
                title="Install PWA App"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 text-xs font-medium transition-all backdrop-blur-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Install App</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all backdrop-blur-md"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all backdrop-blur-md"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Family Profile Button */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl border transition-all backdrop-blur-md group ${
                activeTab === 'profile'
                  ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 border-white/15'
              }`}
              title="View & Edit Member Profile"
            >
              <div className="relative">
                {currentFamily?.avatar ? (
                  <img
                    src={currentFamily.avatar}
                    alt={currentFamily.name}
                    className="w-7 h-7 rounded-full object-cover border border-indigo-400/60"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentFamily?.name.charAt(0) || 'F'}
                  </div>
                )}
                {currentFamily?.isAdmin && (
                  <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-slate-950" title="Admin">
                    <ShieldCheck className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-white leading-none">
                  {currentFamily?.name || 'Profile'}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {currentFamily?.contactPerson || 'Manage Profile'}
                </p>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-all shadow-md shadow-rose-600/30 border border-rose-400/40 shrink-0"
              title="Logout to Login Page"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Family Switcher Modal */}
      {isFamilyModalOpen && (
        <FamilyLoginModal onClose={() => setIsFamilyModalOpen(false)} />
      )}

      {/* Host Event Modal */}
      {isCreateEventOpen && (
        <CreateEventModal onClose={() => setIsCreateEventOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
