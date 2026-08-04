import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Family } from '../types';
import { Users, ShieldCheck, Check, KeyRound, Lock, LogOut } from 'lucide-react';

interface FamilyLoginModalProps {
  onClose: () => void;
}

export const FamilyLoginModal: React.FC<FamilyLoginModalProps> = ({ onClose }) => {
  const { families, currentFamily, setCurrentFamily, logout } = useApp();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(currentFamily?.id || families[0]?.id);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const selectedFam = families.find((f) => f.id === selectedFamilyId);

  const handleSelect = (fam: Family) => {
    setSelectedFamilyId(fam.id);
    setPinInput('');
    setPinError('');
  };

  const handleConfirmLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFam) return;

    // PIN check if provided or default code
    if (selectedFam.code && pinInput && pinInput !== selectedFam.code) {
      setPinError(`Incorrect PIN. (Hint: Code for ${selectedFam.name} is ${selectedFam.code})`);
      return;
    }

    setCurrentFamily(selectedFam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700/60 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white">
                Select Comedy Group Family
              </h3>
              <p className="text-xs text-slate-400">
                7 Families (14 Adults, 14 Children = 28 Total Members)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Family Cards Grid */}
        <div className="mt-4 max-h-[320px] overflow-y-auto pr-1 space-y-2">
          {families.map((fam) => {
            const isSelected = fam.id === selectedFamilyId;
            const isCurrent = fam.id === currentFamily?.id;

            return (
              <div
                key={fam.id}
                onClick={() => handleSelect(fam)}
                className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {fam.avatar ? (
                    <img
                      src={fam.avatar}
                      alt={fam.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {fam.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{fam.name}</span>
                      {fam.isAdmin && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {fam.contactPerson} • {fam.adultsCount} Adults, {fam.childrenCount} Kids
                    </p>
                    {fam.dietaryPreference && (
                      <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded mt-1 inline-block">
                        Pref: {fam.dietaryPreference}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">PIN: {fam.code}</span>
                  {isSelected && <Check className="w-5 h-5 text-indigo-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* PIN Entry Optional Form */}
        <form onSubmit={handleConfirmLogin} className="mt-4 pt-4 border-t border-slate-800">
          {selectedFam && (
            <div className="mb-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-400">Selected Family:</p>
                <p className="text-sm font-bold text-indigo-300">
                  {selectedFam.name} ({selectedFam.contactPerson})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder={`Enter PIN (${selectedFam.code})`}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  className="w-32 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {pinError && (
            <p className="text-xs text-rose-400 mb-3 bg-rose-950/40 p-2 rounded border border-rose-800/50">
              {pinError}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600/80 hover:bg-rose-600 text-white transition-all shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out Completely</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                Switch to {selectedFam?.name || 'Family'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyLoginModal;
