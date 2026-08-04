import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Event, MenuCategory } from '../types';
import {
  Copy,
  Check,
  Share2,
  FileSpreadsheet,
  Printer,
  X,
  MessageCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface WhatsAppShareModalProps {
  event: Event;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({ event, onClose }) => {
  const { families, rsvps, orders } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState<'invitation' | 'summary'>('invitation');

  const hostFamily = families.find((f) => f.id === event.hostFamilyId) || families.find((f) => f.id === event.createdByFamilyId);

  // RSVPs
  const eventRsvps = rsvps.filter((r) => r.eventId === event.id);
  const attendingRsvps = eventRsvps.filter((r) => r.status === 'Yes');
  const notAttendingRsvps = eventRsvps.filter((r) => r.status === 'No');

  const totalAdults = attendingRsvps.reduce((acc, r) => acc + r.adultsAttending, 0);
  const totalKids = attendingRsvps.reduce((acc, r) => acc + r.childrenAttending, 0);

  // Orders
  const eventOrders = orders.filter((o) => o.eventId === event.id);

  // Aggregated food items
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

  const foodListStr = Object.values(aggregatedItems)
    .filter((i) => i.totalQty > 0)
    .map((i) => `• ${i.name} ×${i.totalQty}`)
    .join('\n');

  // Special Notes
  const notesList = eventOrders
    .filter((o) => o.specialInstructions && o.specialInstructions.trim() !== '')
    .map((o) => {
      const fam = families.find((f) => f.id === o.familyId);
      return `• ${fam?.name || 'Family'}: ${o.specialInstructions}`;
    })
    .join('\n');

  // Format Date nicely
  const eventFormattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Message 1: Group Announcement Invitation Message
  const invitationMessage = `🎉 *COMEDY GROUP EVENT ANNOUNCEMENT* 🎉

Hello Comedy Group Members! A new event has been hosted:

🎈 *Event:* ${event.title} (${event.eventType})
👑 *Host Family:* ${hostFamily?.name || 'Comedy Group Captain'} (${hostFamily?.contactPerson || ''})
📍 *Restaurant:* ${event.restaurantName}
🏢 *Address:* ${event.address || 'Check portal for address'}
🗺️ *Google Maps:* ${event.googleMapUrl}
📅 *Date & Time:* ${eventFormattedDate} at ${event.time}
⏰ *Order Cutoff:* ${new Date(event.orderDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

${event.notes ? `📝 *Notes:* ${event.notes}\n` : ''}👉 *Please log in to Comedy Group Portal to confirm RSVP & submit food orders!*
— Sent via Comedy Group Planner`;

  // Message 2: Food & Attendance Summary for Captain
  const summaryMessage = `🎉 *${event.title} - FINAL ORDER SUMMARY*
📍 *Restaurant:* ${event.restaurantName} (${event.address})
📅 *Date:* ${eventFormattedDate} at ${event.time}

👥 *ATTENDANCE METRICS*
• Attending Families: ${attendingRsvps.length} / 7
• Adults: ${totalAdults}
• Children: ${totalKids}
• Total Headcount: ${totalAdults + totalKids}

🍽️ *AGGREGATED FOOD ORDERS*
${foodListStr || 'No orders placed yet.'}

${notesList ? `📝 *SPECIAL INSTRUCTIONS*\n${notesList}\n` : ''}✅ *Ready to send to restaurant management!*
— Generated via Comedy Group Planner`;

  const activeMessage = activeShareTab === 'invitation' ? invitationMessage : summaryMessage;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(activeMessage);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleExportExcel = () => {
    // Prepare Excel workbook data
    const summaryData = [
      ['Comedy Group Dinner Summary'],
      ['Event', event.title],
      ['Restaurant', event.restaurantName],
      ['Date', event.date],
      ['Time', event.time],
      [],
      ['ATTENDANCE METRICS'],
      ['Coming Families', attendingRsvps.length],
      ['Not Coming Families', notAttendingRsvps.length],
      ['Adults', totalAdults],
      ['Children', totalKids],
      ['Total Headcount', totalAdults + totalKids],
      [],
      ['FOOD ORDER TOTALS'],
      ['Category', 'Item Name', 'Total Quantity'],
      ...Object.values(aggregatedItems)
        .filter((i) => i.totalQty > 0)
        .map((i) => [i.category, i.name, i.totalQty]),
      [],
      ['SPECIAL INSTRUCTIONS'],
      ...eventOrders
        .filter((o) => o.specialInstructions)
        .map((o) => [families.find((f) => f.id === o.familyId)?.name || '', o.specialInstructions]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Order Summary');
    XLSX.writeFile(wb, `Comedy_Group_${event.title.replace(/\s+/g, '_')}_Summary.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700/60 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white">
                Share on WhatsApp Group
              </h3>
              <p className="text-xs text-slate-400">
                Broadcast event invitation or order summary to WhatsApp
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

        {/* Share Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveShareTab('invitation')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeShareTab === 'invitation'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📢 Group Invitation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveShareTab('summary')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeShareTab === 'summary'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🍽️ Order Summary</span>
          </button>
        </div>

        {/* Text Preview Box */}
        <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto selection:bg-emerald-600">
          {activeMessage}
        </div>

        {/* Buttons Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Post to WhatsApp</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppShareModal;
