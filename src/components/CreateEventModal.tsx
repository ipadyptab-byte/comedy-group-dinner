import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventType } from '../types';
import { Calendar, Clock, MapPin, Utensils, Sparkles, X } from 'lucide-react';

interface CreateEventModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onCreated }) => {
  const { families, currentFamily, createEvent } = useApp();

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('Weekend Dinner');
  const [hostFamilyId, setHostFamilyId] = useState(currentFamily?.id || families[0]?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [orderDeadline, setOrderDeadline] = useState('');
  const [notes, setNotes] = useState('');

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

    // Default order deadline if not provided: 4 hours before event date/time
    let deadlineIso = orderDeadline;
    if (!deadlineIso) {
      deadlineIso = `${date}T15:00`;
    }

    createEvent({
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
      createdByFamilyId: currentFamily?.id || hostFamilyId,
    });

    if (onCreated) {
      onCreated();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-slate-700/60 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white">
                Host New Comedy Group Event
              </h3>
              <p className="text-xs text-slate-400">
                Arrange a dinner or celebration for the 7 families
              </p>
            </div>
          </div>
          <button
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
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Saffron Royal Veg Bistro"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Address
              </label>
              <input
                type="text"
                placeholder="e.g. 45 Emerald Heights, MG Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Google Maps Link & Order Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Google Maps Link
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Order Deadline (Cutoff Time)
              </label>
              <input
                type="datetime-local"
                value={orderDeadline}
                onChange={(e) => setOrderDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Members cannot submit/edit orders after this time.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Event Notes / Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Valet parking available. Special kids play area reserved."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Create & Notify Comedy Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
