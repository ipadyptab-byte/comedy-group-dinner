import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Check,
  Utensils,
  Share2,
} from 'lucide-react';

interface NotificationsViewProps {
  onSelectRSVP?: (eventId: string) => void;
  onOpenWhatsAppShare?: (eventId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onSelectRSVP,
  onOpenWhatsAppShare,
}) => {
  const { notifications, currentFamily, markNotificationRead, sendNotification, events } = useApp();
  const [permissionState, setPermissionState] = React.useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handlePushPermissionRequest = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support web push notifications.');
      return;
    }
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification('Comedy Group PWA Alerts Active! 🔔', {
            body: 'You will receive device screen notifications whenever an event is hosted or order deadline approaches!',
            icon: '/icon-192.png',
            vibrate: [200, 100, 200],
          } as NotificationOptions);
        });
      } else {
        new Notification('Comedy Group PWA Alerts Active! 🔔', {
          body: 'You will receive device screen notifications whenever an event is hosted or order deadline approaches!',
        });
      }
    } else {
      alert('Notification permission was denied. Please enable notifications in your browser/device settings.');
    }
  };

  const activeEvent = events.find((e) => e.status === 'upcoming') || events[0];

  const handleSimulateReminder = () => {
    if (!activeEvent) return;
    sendNotification(
      `Reminder: Order Deadline for ${activeEvent.title}`,
      `Order cutoff is approaching for ${activeEvent.restaurantName}! Submit your RSVP & food order now.`,
      'reminder',
      activeEvent.id
    );
  };

  const handleSimulateEventToday = () => {
    if (!activeEvent) return;
    sendNotification(
      `🎉 Event Today: ${activeEvent.title}`,
      `See you tonight at ${activeEvent.time} at ${activeEvent.restaurantName}!`,
      'event_soon',
      activeEvent.id
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Alert Push Config */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-white">
              Notification Center
            </h2>
            {permissionState === 'granted' ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> PWA Device Alerts Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                Device Alerts Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time push alerts, order deadline reminders & WhatsApp updates for Comedy Group
          </p>
        </div>

        <button
          onClick={handlePushPermissionRequest}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all ${
            permissionState === 'granted'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white animate-pulse'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{permissionState === 'granted' ? 'Test Device Screen Alert' : 'Enable Device Push Alerts'}</span>
        </button>
      </div>

      {/* Admin Test Notification Trigger Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/60">
        <p className="text-xs font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Simulate Event Broadcast Notifications
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={handleSimulateReminder}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            ⏰ Send Order Deadline Reminder
          </button>
          <button
            onClick={handleSimulateEventToday}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
          >
            🎉 Send "Event Today" Alert
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/60 space-y-3">
        <h3 className="text-base font-heading font-bold text-white mb-3">
          Recent Group Notifications
        </h3>

        {notifications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notif) => {
            const isRead = currentFamily ? notif.readByFamilies.includes(currentFamily.id) : true;

            return (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  !isRead
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md'
                    : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl text-xs mt-0.5 ${
                      notif.type === 'event_created'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : notif.type === 'reminder'
                        ? 'bg-amber-500/20 text-amber-300'
                        : notif.type === 'order_submitted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                      {!isRead && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* Quick Action Buttons for Event Notifications if event exists */}
                    {notif.eventId && events.some((e) => e.id === notif.eventId) && (
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-slate-800">
                        {onSelectRSVP && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationRead(notif.id);
                              onSelectRSVP(notif.eventId!);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm transition-all"
                          >
                            <Utensils className="w-3 h-3" />
                            <span>RSVP & Order</span>
                          </button>
                        )}

                        {onOpenWhatsAppShare && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationRead(notif.id);
                              onOpenWhatsAppShare(notif.eventId!);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-[11px] font-bold border border-[#25D366]/30 transition-all"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Share to WhatsApp Group</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isRead && <Check className="w-4 h-4 text-slate-500 shrink-0" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
