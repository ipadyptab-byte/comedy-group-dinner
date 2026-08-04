import React, { useState, useEffect } from 'react';
import { Event, Family } from '../types';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Utensils,
  Share2,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  Users,
  ChevronRight,
  Trash2,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import { EditEventModal } from './EditEventModal';

interface EventCardProps {
  event: Event;
  onSelectRSVP: () => void;
  onSelectSummary: () => void;
  onOpenWhatsAppShare: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectRSVP,
  onSelectSummary,
  onOpenWhatsAppShare,
}) => {
  const { families, rsvps, currentRole, updateEventStatus, deleteEvent, currentFamily } = useApp();
  const [showQR, setShowQR] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const isHost =
    (currentFamily && (event.hostFamilyId === currentFamily.id || event.createdByFamilyId === currentFamily.id)) ||
    currentRole === 'admin';
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isDeadlinePassed, setIsDeadlinePassed] = useState<boolean>(false);

  const isBeforeTime = event.status === 'upcoming' && !isDeadlinePassed;

  const hostFamily = families.find((f) => f.id === event.hostFamilyId);

  // RSVP statistics for this event
  const eventRsvps = rsvps.filter((r) => r.eventId === event.id);
  const attendingRsvps = eventRsvps.filter((r) => r.status === 'Yes');
  const totalAdults = attendingRsvps.reduce((acc, curr) => acc + curr.adultsAttending, 0);
  const totalKids = attendingRsvps.reduce((acc, curr) => acc + curr.childrenAttending, 0);
  const totalHeadcount = totalAdults + totalKids;
  const totalFamiliesAttending = attendingRsvps.length;

  // Check user's family response
  const myRsvp = currentFamily
    ? eventRsvps.find((r) => r.familyId === currentFamily.id)
    : null;

  // Calculate Order Deadline Timer
  useEffect(() => {
    const checkDeadline = () => {
      const deadlineDate = new Date(event.orderDeadline).getTime();
      const now = new Date().getTime();
      const diff = deadlineDate - now;

      if (diff <= 0) {
        setIsDeadlinePassed(true);
        setTimeLeftStr('Ordering Closed');
      } else {
        setIsDeadlinePassed(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeLeftStr(`${days}d ${hours % 24}h remaining`);
        } else {
          setTimeLeftStr(`${hours}h ${mins}m ${secs}s left to order`);
        }
      }
    };

    checkDeadline();
    const interval = setInterval(checkDeadline, 1000);
    return () => clearInterval(interval);
  }, [event.orderDeadline]);

  // Event Type Badge colors
  const getTypeBadgeColor = (type: Event['eventType']) => {
    switch (type) {
      case 'Birthday':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'Anniversary':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Festival Celebration':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Holiday Dinner':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Weekend Dinner':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <>
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all hover:border-white/30 hover:shadow-indigo-500/10">
        {/* Top Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${getTypeBadgeColor(
                event.eventType
              )}`}
            >
              🎉 {event.eventType}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md flex items-center gap-1 ${
                event.status === 'upcoming' && !isDeadlinePassed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {isDeadlinePassed || event.status === 'ordering_closed' ? (
                <>
                  <Lock className="w-3 h-3" /> Ordering Closed
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" /> {timeLeftStr}
                </>
              )}
            </span>
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 text-xs flex items-center gap-1.5 transition-all backdrop-blur-md"
            title="Show Event QR Code"
          >
            <QrCode className="w-4 h-4 text-indigo-300" />
            <span className="hidden sm:inline font-semibold">QR Code</span>
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight mb-3">
          {event.title}
        </h2>

        {/* Host Info */}
        <div className="flex items-center gap-3 mb-5 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
          {hostFamily?.avatar ? (
            <img
              src={hostFamily.avatar}
              alt={hostFamily.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-indigo-400/50"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {hostFamily?.name.charAt(0) || 'H'}
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Host Family (Captain)</p>
            <p className="text-xs font-bold text-white">
              {hostFamily?.name} <span className="text-indigo-300 font-normal">({hostFamily?.contactPerson})</span>
            </p>
          </div>
        </div>

        {/* Event Logistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
          <div className="flex items-start gap-3 text-slate-200 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Date & Time</p>
              <p className="text-slate-300 mt-0.5">
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                at {event.time}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-200 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white">{event.restaurantName}</p>
              <p className="text-slate-400 truncate mt-0.5">{event.address}</p>
              {event.googleMapUrl && (
                <a
                  href={event.googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-300 hover:text-white hover:underline mt-1 text-[11px] font-semibold"
                >
                  View on Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Notes if any */}
        {event.notes && (
          <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p><span className="font-bold text-amber-300">Note:</span> {event.notes}</p>
          </div>
        )}

        {/* Live Attendance Stats Bar */}
        <div className="mb-6 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-400/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> Group Attendance Tracker
            </span>
            <span className="font-bold text-indigo-300">
              {totalHeadcount} Members ({totalFamiliesAttending}/7 Families)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-rose-500"
              style={{ width: `${(totalFamiliesAttending / 7) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 mt-2.5 font-medium">
            <span>Adults: <strong className="text-white">{totalAdults}</strong></span>
            <span>Children: <strong className="text-white">{totalKids}</strong></span>
            <span>
              My Family Status:{' '}
              {myRsvp ? (
                <span
                  className={`font-bold ${
                    myRsvp.status === 'Yes'
                      ? 'text-emerald-400'
                      : myRsvp.status === 'No'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {myRsvp.status}
                </span>
              ) : (
                <span className="text-amber-400 font-bold">Pending</span>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            onClick={onSelectRSVP}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 border border-indigo-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Utensils className="w-4 h-4" />
            <span>RSVP & Order</span>
          </button>

          <button
            onClick={onSelectSummary}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Live Totals</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={onOpenWhatsAppShare}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4 text-[#25D366]" />
            <span>Share on WhatsApp</span>
          </button>
        </div>

        {/* Host & Admin Controls bar */}
        {isHost && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{currentRole === 'admin' ? 'Admin / Host Controls:' : 'My Hosted Event Controls:'}</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {(isBeforeTime || currentRole === 'admin') ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-400/30 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                    title="Edit event details before time"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Event</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete "${event.title}"?\n\nThis will permanently delete this event along with all member RSVPs, food orders, and live calculation totals.`
                        )
                      ) {
                        deleteEvent(event.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40 text-[11px] font-extrabold shadow-md transition-all flex items-center gap-1"
                    title="Delete Event & all associated orders before time"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Event</span>
                  </button>
                </>
              ) : (
                <span className="text-[11px] font-semibold text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> Cutoff Passed (Editing Locked)
                </span>
              )}

              {event.status === 'upcoming' && (
                <button
                  type="button"
                  onClick={() => updateEventStatus(event.id, 'ordering_closed')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-[11px] font-bold transition-all"
                >
                  Lock Orders
                </button>
              )}
              {event.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => updateEventStatus(event.id, 'completed')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-[11px] font-bold transition-all"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQR && <QRCodeModal event={event} onClose={() => setShowQR(false)} />}

      {/* Edit Event Modal */}
      {showEditModal && <EditEventModal event={event} onClose={() => setShowEditModal(false)} />}
    </>
  );
};

export default EventCard;
