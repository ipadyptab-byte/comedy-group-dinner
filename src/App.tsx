import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import EventCard from './components/EventCard';
import RSVPSection from './components/RSVPSection';
import FoodOrderSection from './components/FoodOrderSection';
import LiveSummaryView from './components/LiveSummaryView';
import NotificationsView from './components/NotificationsView';
import HistoryView from './components/HistoryView';
import ReportsView from './components/ReportsView';
import ProfileView from './components/ProfileView';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
import WhatsAppShareModal from './components/WhatsAppShareModal';
import CreateEventModal from './components/CreateEventModal';
import {
  Sparkles,
  Calendar,
  Utensils,
  Plus,
  Users,
  MessageCircle,
  Award,
  AlertCircle,
  Clock,
} from 'lucide-react';

function MainApp() {
  const { events, activeEventId, setActiveEventId, currentFamily, currentRole, isLoggedIn, isDarkMode } = useApp();
  const [activeTab, setActiveTab] = useState<string>('events');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWhatsAppShareModal, setShowWhatsAppShareModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  // If non-admin tries to access admin tab, fallback to events
  useEffect(() => {
    if (activeTab === 'admin' && currentRole !== 'admin') {
      setActiveTab('events');
    }
  }, [activeTab, currentRole]);

  // If not logged in or no current family selected, render Login Page
  if (!isLoggedIn || !currentFamily) {
    return <LoginPage />;
  }

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  return (
    <div className={`min-h-screen pb-20 relative overflow-x-hidden ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-900 text-slate-100'}`}>
      {/* Animated Ambient Mesh Background Simulation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/20 blur-[140px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-amber-500/15 blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] rounded-full bg-purple-600/15 blur-[120px]"></div>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Navbar Header */}
        <Navbar
          onOpenNotifications={() => setShowNotifications(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Tab Content Routing */}

        {/* 1. EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Group Welcome Hero Banner */}
            <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Comedy Group Private Hub
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                    Welcome, {currentFamily?.name || 'Comedy Group Member'}! 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                    Organize family dinners, birthday parties, anniversaries & holiday celebrations.
                    Confirm attendance and submit your food order in 1 click!
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateEventModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Host New Event</span>
                </button>
              </div>
            </div>

            {/* Upcoming Events Section */}
            <div>
              <h2 className="text-lg font-heading font-bold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Upcoming Group Dinners & Special Events
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events
                  .filter((e) => e.status === 'upcoming')
                  .map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      onSelectRSVP={() => {
                        setActiveEventId(evt.id);
                        setActiveTab('rsvp');
                      }}
                      onSelectSummary={() => {
                        setActiveEventId(evt.id);
                        setActiveTab('summary');
                      }}
                      onOpenWhatsAppShare={() => {
                        setActiveEventId(evt.id);
                        setShowWhatsAppShareModal(true);
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. RSVP & FOOD ORDER TAB */}
        {activeTab === 'rsvp' && activeEvent && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-400">Selected Event:</p>
                <h2 className="text-base font-heading font-bold text-white">
                  {activeEvent.title} — {activeEvent.restaurantName}
                </h2>
              </div>

              <select
                value={activeEventId || ''}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance RSVP Section */}
            <RSVPSection
              event={activeEvent}
              onContinueToOrder={() => {
                // Smooth scroll down to order builder
              }}
            />

            {/* Food Order Builder Section */}
            <FoodOrderSection
              event={activeEvent}
              onOrderSaved={() => {
                // Option to jump to summary
              }}
            />
          </div>
        )}

        {/* 3. LIVE SUMMARY TAB */}
        {activeTab === 'summary' && activeEvent && (
          <LiveSummaryView event={activeEvent} />
        )}

        {/* 4. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' || showNotifications ? (
          <NotificationsView
            onSelectRSVP={(eventId) => {
              setActiveEventId(eventId);
              setActiveTab('rsvp');
              setShowNotifications(false);
            }}
            onOpenWhatsAppShare={(eventId) => {
              setActiveEventId(eventId);
              setShowWhatsAppShareModal(true);
              setShowNotifications(false);
            }}
          />
        ) : null}

        {/* 5. HISTORY TAB */}
        {activeTab === 'history' && <HistoryView />}

        {/* 6. REPORTS TAB */}
        {activeTab === 'reports' && <ReportsView />}

        {/* 7. PROFILE TAB */}
        {activeTab === 'profile' && <ProfileView />}

        {/* 8. ADMIN TAB */}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Mobile Floating Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* WhatsApp Share Modal */}
      {showWhatsAppShareModal && activeEvent && (
        <WhatsAppShareModal
          event={activeEvent}
          onClose={() => setShowWhatsAppShareModal(false)}
        />
      )}

      {/* Host Event Modal */}
      {showCreateEventModal && (
        <CreateEventModal
          onClose={() => setShowCreateEventModal(false)}
          onCreated={() => {
            setShowCreateEventModal(false);
            setShowWhatsAppShareModal(true);
          }}
        />
      )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
