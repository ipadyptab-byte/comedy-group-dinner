import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PieChart as PieIcon, TrendingUp, Award, Utensils, Users } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { families, rsvps, orders, menuItems } = useApp();

  // 1. Most Active Family Data (Number of 'Yes' RSVPs)
  const familyActiveData = families.map((fam) => {
    const yesCount = rsvps.filter((r) => r.familyId === fam.id && r.status === 'Yes').length;
    return {
      name: fam.name.split(' ')[0],
      eventsAttended: yesCount,
    };
  });

  // 2. Popular Starters Data
  const starterCounts: { [name: string]: number } = {};
  const mainCounts: { [name: string]: number } = {};
  const rotiCounts: { [name: string]: number } = {};
  const riceCounts: { [name: string]: number } = {};

  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (item.category === 'Starter') {
        starterCounts[item.itemName] = (starterCounts[item.itemName] || 0) + item.quantity;
      } else if (item.category === 'Main Course') {
        mainCounts[item.itemName] = (mainCounts[item.itemName] || 0) + item.quantity;
      } else if (item.category === 'Roti Section') {
        rotiCounts[item.itemName] = (rotiCounts[item.itemName] || 0) + item.quantity;
      } else if (item.category === 'Rice Section') {
        riceCounts[item.itemName] = (riceCounts[item.itemName] || 0) + item.quantity;
      }
    });
  });

  const topStarters = Object.entries(starterCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topMains = Object.entries(mainCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topRotis = Object.entries(rotiCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topRice = Object.entries(riceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <PieIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-white">
              Analytics & Group Insights
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Food preferences, active family engagement & menu popularity reports
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 font-semibold">
          <Award className="w-4 h-4 text-amber-400" />
          <span>7 Families • 28 Group Members</span>
        </div>
      </div>

      {/* Grid of Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Family Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-lg">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Most Active Families (Events Attended)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={familyActiveData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="eventsAttended" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Starters */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-lg">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-400" /> Popular Starters Ordered
          </h3>
          <div className="h-56 w-full">
            {topStarters.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">No starter data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStarters} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#a855f7" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Popular Main Course */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-lg">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" /> Top Main Course Dishes
          </h3>
          <div className="h-56 w-full">
            {topMains.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">No main course data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topMains}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {topMains.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Popular Rotis & Rice */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-lg">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-indigo-400" /> Popular Roti & Rice Preferences
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-bold text-indigo-300 mb-1">Top Roti Selections:</p>
              <div className="flex flex-wrap gap-2">
                {topRotis.map((r) => (
                  <span key={r.name} className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-200">
                    {r.name} ({r.count} total)
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <p className="font-bold text-purple-300 mb-1">Top Rice Selections:</p>
              <div className="flex flex-wrap gap-2">
                {topRice.map((r) => (
                  <span key={r.name} className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800 text-purple-200">
                    {r.name} ({r.count} total)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
