import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Event } from '../types';
import {
  History,
  Search,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Upload,
  ChevronRight,
  Users,
  Utensils,
  X,
  Trash2,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { events, rsvps, orders, families, addEventPhotos, deleteEvent, currentFamily, currentRole } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const completedEvents = events.filter(
    (e) =>
      e.status === 'completed' ||
      new Date(e.date).getTime() < new Date().getTime() ||
      e.id === 'evt-100'
  );

  const filtered = completedEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeEvent = events.find((e) => e.id === selectedEventId);

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !photoUrlInput.trim()) return;
    addEventPhotos(selectedEventId, [photoUrlInput.trim()]);
    setPhotoUrlInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-white">
              Event History & Photo Memories
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Archive of past Comedy Group dinners, attendance logs & celebration photo gallery
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
            No past events found matching "{searchQuery}".
          </div>
        ) : (
          filtered.map((evt) => {
            const evtRsvps = rsvps.filter((r) => r.eventId === evt.id && r.status === 'Yes');
            const totalHeadcount = evtRsvps.reduce(
              (acc, r) => acc + r.adultsAttending + r.childrenAttending,
              0
            );
            const hostFam = families.find((f) => f.id === evt.hostFamilyId);

            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-lg hover:border-indigo-500/80 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {evt.eventType}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(evt.date).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-heading font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {evt.title}
                </h3>

                <div className="mt-2 text-xs text-slate-300 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {evt.restaurantName}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    {totalHeadcount} Attendees ({evtRsvps.length} Families) • Host: {hostFam?.name}
                  </p>
                </div>

                {/* Photos Preview */}
                {evt.photos && evt.photos.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                    {evt.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt="Event Memory"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                      />
                    ))}
                    <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-950 px-2 py-1 rounded-md">
                      +{evt.photos.length} Photos
                    </span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                  <span>View Details & Photo Gallery</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Event Details Modal */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-slate-700/60 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  {activeEvent.eventType}
                </span>
                <h3 className="text-xl font-heading font-extrabold text-white">
                  {activeEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Info */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-slate-400">Date & Time:</p>
                <p className="font-bold text-white">
                  {activeEvent.date} at {activeEvent.time}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Venue:</p>
                <p className="font-bold text-white">{activeEvent.restaurantName}</p>
              </div>
            </div>

            {/* Photos Section */}
            <div className="mt-5 space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" /> Photo Memories
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeEvent.photos?.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Memory ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-xl border border-slate-700 shadow-md"
                  />
                ))}
              </div>

              {/* Add Photo URL Form */}
              <form onSubmit={handleAddPhoto} className="flex gap-2 pt-2">
                <input
                  type="url"
                  placeholder="Paste photo image URL (e.g. https://...)"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Add Photo
                </button>
              </form>
            </div>

            {/* Host or Admin Delete Option */}
            {((currentFamily && (activeEvent.hostFamilyId === currentFamily.id || activeEvent.createdByFamilyId === currentFamily.id)) || currentRole === 'admin') && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete past event record "${activeEvent.title}" and all its historical orders?`)) {
                      deleteEvent(activeEvent.id);
                      setSelectedEventId(null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Event Record</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
