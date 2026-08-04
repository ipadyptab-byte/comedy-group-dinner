import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Event, EventType } from '../types';
import { Sparkles, X, Edit3 } from 'lucide-react';

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ event, onClose }) => {
  const { families, currentFamily, updateEventDetails } = useApp();

  const [title, setTitle] = useState(event.title);
  const [eventType, setEventType] = useState<EventType>(event.eventType);
  const [hostFamilyId, setHostFamilyId] = useState(event.hostFamilyId);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [restaurantName, setRestaurantName] = useState(event.restaurantName);
  const [address, setAddress] = useState(event.address || '');
  const [googleMapUrl, setGoogleMapUrl] = useState(event.googleMapUrl || '');
  const [orderDeadline, setOrderDeadline] = useState(event.orderDeadline || '');
  const [notes, setNotes] = useState(event.notes || '');

  const eventTypeOptions: EventType[] = [
    'Birthday',
    'Anniversary',
    'Holiday Dinner',
    'Festival Celebration',
    'Weekend Dinner',
    'Regular Dinner',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !restaurantName) {
      alert('Please fill in required fields: Event Title, Date, and Restaurant Name.');
      return;
    }

    let deadlineIso = orderDeadline;
    if (!deadlineIso) {
      deadlineIso = `${date}T15:00`;
    }

    updateEventDetails({
      ...event,
      title,
      eventType,
      hostFamilyId,
      date,
      time,
      restaurantName,
      address,
      googleMapUrl: googleMapUrl || `https://maps.google.com/?q=${encodeURIComponent(restaurantName)}`,
      orderDeadline: deadlineIso,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-slate-700/60 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white">
                Edit Hosted Event
              </h3>
              <p className="text-xs text-slate-400">
                Update event details before order deadline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Event Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Event Name / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul's Birthday Bash & Grand Dinner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Event Type & Host Family */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Event Type *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              >
                {eventTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Host Family (Captain) *
              </label>
              <select
                value={hostFamilyId}
                onChange={(e) => setHostFamilyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              >
                {families.map((fam) => (
                  <option key={fam.id} value={fam.id}>
                    {fam.name} ({fam.contactPerson})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Event Time *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Restaurant & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mainland China"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Address / Location
              </label>
              <input
                type="text"
                placeholder="e.g. FC Road, Pune"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Google Maps & Order Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Google Maps Link
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Order Cutoff Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={orderDeadline}
                onChange={(e) => setOrderDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Host Notes & Special Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Jain food options required. Pure Veg menu items available."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/20 transition-all"
            >
              Save Event Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
