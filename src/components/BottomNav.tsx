import React from 'react';
import { Calendar, Utensils, BarChart3, History, Shield, PieChart, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, logout } = useApp();

  const navItems = [
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'rsvp', label: 'Order', icon: Utensils },
    { id: 'summary', label: 'Totals', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
    ...(currentRole === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-950/85 border border-white/20 backdrop-blur-2xl rounded-full px-2.5 py-1.5 shadow-2xl flex items-center justify-around w-[96%] max-w-md">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-full transition-all ${
              isActive
                ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-white' : ''}`} />
            <span className="text-[9px] tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Direct Mobile Logout Button */}
      <button
        onClick={logout}
        className="flex flex-col items-center py-1 px-2.5 rounded-full text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-all shrink-0"
        title="Logout"
      >
        <LogOut className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] font-bold tracking-tight">Logout</span>
      </button>
    </div>
  );
};

export default BottomNav;
