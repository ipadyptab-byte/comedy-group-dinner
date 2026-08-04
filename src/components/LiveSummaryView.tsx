import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Event, MenuCategory } from '../types';
import {
  Users,
  Utensils,
  Share2,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Download,
} from 'lucide-react';
import WhatsAppShareModal from './WhatsAppShareModal';

interface LiveSummaryViewProps {
  event: Event;
}

export const LiveSummaryView: React.FC<LiveSummaryViewProps> = ({ event }) => {
  const { families, rsvps, orders, menuItems } = useApp();
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // RSVPs for this event
  const eventRsvps = rsvps.filter((r) => r.eventId === event.id);

  // Categorize families by status
  const attendingRsvps = eventRsvps.filter((r) => r.status === 'Yes');
  const notAttendingRsvps = eventRsvps.filter((r) => r.status === 'No');
  const maybeRsvps = eventRsvps.filter((r) => r.status === 'Maybe');

  // Families who haven't responded yet
  const respondedFamIds = eventRsvps.map((r) => r.familyId);
  const pendingFamilies = families.filter((f) => !respondedFamIds.includes(f.id));

  // Headcounts
  const totalAdults = attendingRsvps.reduce((acc, r) => acc + r.adultsAttending, 0);
  const totalKids = attendingRsvps.reduce((acc, r) => acc + r.childrenAttending, 0);
  const totalHeadcount = totalAdults + totalKids;

  // Orders for this event
  const eventOrders = orders.filter((o) => o.eventId === event.id);

  // Aggregate Food Quantities across all families
  const aggregatedItems: { [itemId: string]: { name: string; category: MenuCategory; totalQty: number } } = {};

  eventOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!aggregatedItems[item.menuItemId]) {
        aggregatedItems[item.menuItemId] = {
          name: item.itemName,
          category: item.category,
          totalQty: 0,
        };
      }
      aggregatedItems[item.menuItemId].totalQty += item.quantity;
    });
  });

  const categoriesList: MenuCategory[] = [
    'Starter',
    'Main Course',
    'Roti Section',
    'Rice Section',
    'Dessert',
    'Drinks',
  ];

  // Group aggregated items by category
  const itemsByCategory = categoriesList.map((cat) => {
    const items = Object.values(aggregatedItems).filter((i) => i.category === cat && i.totalQty > 0);
    return { category: cat, items };
  });

  // Special instructions list
  const specialNotes = eventOrders
    .filter((o) => o.specialInstructions && o.specialInstructions.trim() !== '')
    .map((o) => {
      const fam = families.find((f) => f.id === o.familyId);
      return {
        familyId: o.familyId,
        familyName: fam?.name || 'Family',
        instruction: o.specialInstructions,
      };
    });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Export Bar */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
              Live Order Compiler
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Updated live
            </span>
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white mt-1">
            {event.title} — Order Summary
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {event.restaurantName} • {new Date(event.date).toLocaleDateString()} at {event.time}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02]"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Order Summary</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4 text-indigo-300" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Attendance Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/15 p-5 rounded-[24px] shadow-lg">
          <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Total Headcount</p>
          <p className="text-3xl font-extrabold text-white font-heading mt-2">
            {totalHeadcount} <span className="text-xs font-normal text-slate-300">People</span>
          </p>
          <p className="text-[11px] text-indigo-300 mt-1 font-medium">
            {totalAdults} Adults + {totalKids} Kids
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/15 p-5 rounded-[24px] shadow-lg">
          <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Families Coming</p>
          <p className="text-3xl font-extrabold text-emerald-400 font-heading mt-2">
            {attendingRsvps.length} <span className="text-xs text-slate-300">/ 7</span>
          </p>
          <p className="text-[11px] text-slate-300 truncate mt-1">
            {attendingRsvps.map((r) => families.find((f) => f.id === r.familyId)?.name.split(' ')[0]).join(', ') || 'None'}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/15 p-5 rounded-[24px] shadow-lg">
          <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Not Coming</p>
          <p className="text-3xl font-extrabold text-rose-400 font-heading mt-2">
            {notAttendingRsvps.length} <span className="text-xs text-slate-300">Families</span>
          </p>
          <p className="text-[11px] text-slate-300 truncate mt-1">
            {notAttendingRsvps.map((r) => families.find((f) => f.id === r.familyId)?.name.split(' ')[0]).join(', ') || 'None'}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/15 p-5 rounded-[24px] shadow-lg">
          <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Pending Response</p>
          <p className="text-3xl font-extrabold text-amber-400 font-heading mt-2">
            {pendingFamilies.length + maybeRsvps.length}
          </p>
          <p className="text-[11px] text-slate-300 truncate mt-1">
            {[
              ...maybeRsvps.map((r) => families.find((f) => f.id === r.familyId)?.name.split(' ')[0]),
              ...pendingFamilies.map((f) => f.name.split(' ')[0]),
            ].join(', ') || 'All responded'}
          </p>
        </div>
      </div>

      {/* Attendance Family List Detailed */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 shadow-2xl">
        <h3 className="text-base font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Family Attendance Status Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {families.map((fam) => {
            const rsvp = eventRsvps.find((r) => r.familyId === fam.id);
            const status = rsvp?.status || 'Pending';
            const orderSubmitted = eventOrders.some((o) => o.familyId === fam.id);

            return (
              <div
                key={fam.id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {fam.avatar ? (
                    <img
                      src={fam.avatar}
                      alt={fam.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {fam.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-white text-xs">{fam.name}</span>
                    <p className="text-[11px] text-slate-300">{fam.contactPerson}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md ${
                      status === 'Yes'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : status === 'No'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {status === 'Yes'
                      ? `${rsvp?.adultsAttending}A + ${rsvp?.childrenAttending}K`
                      : status === 'No'
                      ? `No (${rsvp?.noReason || 'Busy'})`
                      : 'Pending'}
                  </span>
                  {status === 'Yes' && (
                    <p className="text-[10px] mt-1 text-slate-300 font-medium">
                      Order: {orderSubmitted ? 'Submitted ✅' : 'Pending ⏳'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Food Orders Categorized Totals */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 shadow-2xl print-container">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-extrabold text-white">
                Compiled Food Quantity Totals (For Restaurant Order)
              </h3>
              <p className="text-xs text-slate-300">
                Summed across all attending families in Comedy Group
              </p>
            </div>
          </div>
        </div>

        {Object.keys(aggregatedItems).length === 0 ? (
          <div className="text-center py-10 text-slate-300 text-xs bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            No food orders submitted yet. Attending families can select dishes in the "RSVP & Order" tab!
          </div>
        ) : (
          <div className="space-y-6">
            {itemsByCategory.map(
              (catGroup) =>
                catGroup.items.length > 0 && (
                  <div key={catGroup.category} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider bg-indigo-500/15 px-3.5 py-1.5 rounded-full border border-indigo-400/30 backdrop-blur-md w-fit">
                      <span>{catGroup.category}</span>
                      <span className="text-[10px] text-slate-300 font-normal">
                        ({catGroup.items.reduce((s, i) => s + i.totalQty, 0)} items)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {catGroup.items.map((item) => (
                        <div
                          key={item.name}
                          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between"
                        >
                          <span className="font-semibold text-xs text-white">
                            {item.name}
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-mono font-extrabold text-xs shadow-md">
                            ×{item.totalQty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>

      {/* Special Instructions Compiled */}
      {specialNotes.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 shadow-2xl">
          <h3 className="text-base font-heading font-extrabold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            Special Cooking Notes & Dietary Preferences
          </h3>

          <div className="space-y-2.5 text-xs">
            {specialNotes.map((note) => (
              <div
                key={note.familyId}
                className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 backdrop-blur-md"
              >
                <span className="font-bold text-amber-300">{note.familyName}:</span>
                <span className="text-slate-100">{note.instruction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      {showWhatsAppModal && (
        <WhatsAppShareModal event={event} onClose={() => setShowWhatsAppModal(false)} />
      )}
    </div>
  );
};

export default LiveSummaryView;
