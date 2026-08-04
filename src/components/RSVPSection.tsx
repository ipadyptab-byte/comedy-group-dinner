import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Event, AttendanceStatus } from '../types';
import { CheckCircle2, XCircle, HelpCircle, Users, Save, Sparkles, AlertCircle } from 'lucide-react';

interface RSVPSectionProps {
  event: Event;
  onContinueToOrder?: () => void;
}

export const RSVPSection: React.FC<RSVPSectionProps> = ({ event, onContinueToOrder }) => {
  const { currentFamily, rsvps, submitRSVP } = useApp();

  const currentRsvp = currentFamily
    ? rsvps.find((r) => r.eventId === event.id && r.familyId === currentFamily.id)
    : null;

  const [status, setStatus] = useState<AttendanceStatus>(currentRsvp?.status || 'Pending');
  const [adults, setAdults] = useState<number>(
    currentRsvp?.status === 'Yes' ? currentRsvp.adultsAttending : currentFamily?.adultsCount || 2
  );
  const [children, setChildren] = useState<number>(
    currentRsvp?.status === 'Yes' ? currentRsvp.childrenAttending : currentFamily?.childrenCount || 2
  );
  const [noReason, setNoReason] = useState<string>(currentRsvp?.noReason || 'Out of station');
  const [customReason, setCustomReason] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentRsvp) {
      setStatus(currentRsvp.status);
      if (currentRsvp.status === 'Yes') {
        setAdults(currentRsvp.adultsAttending);
        setChildren(currentRsvp.childrenAttending);
      }
      if (currentRsvp.status === 'No' && currentRsvp.noReason) {
        if (['Out of station', 'Busy', 'Sick'].includes(currentRsvp.noReason)) {
          setNoReason(currentRsvp.noReason);
        } else {
          setNoReason('Other');
          setCustomReason(currentRsvp.noReason);
        }
      }
    }
  }, [currentRsvp, event.id]);

  const handleSaveRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFamily) return;

    const finalNoReason = noReason === 'Other' ? customReason || 'Other' : noReason;
    submitRSVP(event.id, status, adults, children, finalNoReason);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (status === 'Yes' && onContinueToOrder) {
      onContinueToOrder();
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 shadow-2xl mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-extrabold text-white">
              Family RSVP Attendance
            </h3>
            <p className="text-xs text-slate-300">
              RSVP for {currentFamily?.name || 'Your Family'}
            </p>
          </div>
        </div>

        {currentRsvp?.status && currentRsvp.status !== 'Pending' && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
              currentRsvp.status === 'Yes'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : currentRsvp.status === 'No'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            Recorded: {currentRsvp.status}
          </span>
        )}
      </div>

      <form onSubmit={handleSaveRSVP} className="mt-5 space-y-5">
        {/* Attendance Question Buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-3">
            Will your family attend this event?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Yes', label: 'Yes (Attending)', color: 'emerald', icon: CheckCircle2 },
              { id: 'No', label: 'No', color: 'rose', icon: XCircle },
              { id: 'Maybe', label: 'Maybe', color: 'amber', icon: HelpCircle },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = status === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStatus(option.id as AttendanceStatus)}
                  className={`py-4 px-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? option.id === 'Yes'
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-600/20'
                        : option.id === 'No'
                        ? 'bg-rose-600/40 border-rose-400 text-rose-200 font-bold shadow-lg ring-4 ring-rose-500/20'
                        : 'bg-amber-600/40 border-amber-400 text-amber-200 font-bold shadow-lg ring-4 ring-amber-500/20'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 backdrop-blur-md'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-semibold">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* If NO -> Ask for Reason */}
        {status === 'No' && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-3 animate-fade-in text-xs">
            <label className="block font-semibold text-rose-200">
              Please select reason for not attending:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Out of station', 'Busy', 'Sick', 'Other'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setNoReason(r)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    noReason === r
                      ? 'bg-rose-600 text-white border-rose-500 font-bold'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {noReason === 'Other' && (
              <input
                type="text"
                placeholder="Specify reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-700 text-white focus:outline-none"
              />
            )}
          </div>
        )}

        {/* If YES -> Ask Adults & Children count */}
        {status === 'Yes' && (
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-4 animate-fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Adults Counter */}
              <div>
                <label className="block font-semibold text-indigo-200 mb-1.5">
                  Adults Attending (Max 2 per couple)
                </label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAdults(num)}
                      className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all ${
                        adults === num
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {num} {num === 1 ? 'Adult' : 'Adults'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Children Counter */}
              <div>
                <label className="block font-semibold text-indigo-200 mb-1.5">
                  Children Attending (Max 2)
                </label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setChildren(num)}
                      className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all ${
                        children === num
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {num} {num === 1 ? 'Child' : 'Kids'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Total Headcount for {currentFamily?.name}:</span>
              <span className="font-extrabold text-indigo-300 text-xs">
                {adults + children} Members ({adults} Adults + {children} Children)
              </span>
            </div>
          </div>
        )}

        {/* Save RSVP Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> RSVP Recorded Successfully!
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              * Response can be edited anytime before order deadline.
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save RSVP</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RSVPSection;
