import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Utensils,
  Share2,
  HelpCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { families, login } = useApp();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(
    families[0]?.id || ''
  );
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedFam = families.find((f) => f.id === selectedFamilyId) || families[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(selectedFamilyId, passwordInput);
      if (!result.success) {
        setErrorMsg(result.error || 'Invalid credentials');
        setIsSubmitting(false);
      }
    }, 300);
  };

  const handleQuickFill = (famId: string, code: string) => {
    setSelectedFamilyId(famId);
    setPasswordInput(code);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#0f172a] text-slate-100">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/30 blur-[150px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/25 blur-[150px]" />
        <div className="absolute top-[40%] right-[20%] w-[35%] h-[35%] rounded-full bg-rose-500/15 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-8">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-indigo-300 border border-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" /> Private 7-Family Group
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 p-0.5 shadow-xl flex items-center justify-center">
                <div className="w-full h-full bg-[#0f172a] rounded-[14px] flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">
                Comedy Group
              </h1>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Welcome to the private dinner & party planning portal for Comedy Group families.
              Login with your family account to RSVP, customize food orders, and view live group totals.
            </p>
          </div>

          {/* Unlocked Features list */}
          <div className="space-y-3 pt-2">
            {[
              {
                icon: CheckCircle2,
                color: 'text-emerald-400',
                title: '1-Click Family RSVP',
                desc: 'Confirm adults & children attendance instantly',
              },
              {
                icon: Utensils,
                color: 'text-indigo-400',
                title: 'Custom Food Ordering',
                desc: 'Select dishes, rotis & special cooking preferences',
              },
              {
                icon: Share2,
                color: 'text-rose-400',
                title: 'WhatsApp Live Summary',
                desc: 'Formatted order lists for restaurant captains',
              },
              {
                icon: ShieldCheck,
                color: 'text-amber-400',
                title: 'Admin Command Center',
                desc: 'Add/edit menu items and manage family member accounts',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                >
                  <div className={`p-2 rounded-xl bg-white/10 ${feature.color} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{feature.title}</h4>
                    <p className="text-[11px] text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Glassmorphic Login Card */}
        <div className="lg:col-span-7">
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Gradient Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-heading font-extrabold text-white">
                  Member Login
                </h2>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                  Password Protected
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Select your family account and enter your login password or PIN code.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Member / Family Account */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
                  <span>Select Family / Account *</span>
                  {selectedFam.isAdmin && (
                    <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Privileges Enabled
                    </span>
                  )}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {families.map((fam) => {
                    const isSelected = fam.id === selectedFamilyId;
                    return (
                      <div
                        key={fam.id}
                        onClick={() => {
                          setSelectedFamilyId(fam.id);
                          setErrorMsg('');
                        }}
                        className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-500/50'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {fam.avatar ? (
                            <img
                              src={fam.avatar}
                              alt={fam.name}
                              className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {fam.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{fam.name}</p>
                            <p
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-indigo-100' : 'text-slate-400'
                              }`}
                            >
                              {fam.contactPerson}
                            </p>
                          </div>
                        </div>

                        {fam.isAdmin && (
                          <span
                            className={`p-1 rounded-full shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                            title="Admin"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Password / PIN Input Field */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span>Enter Password or 4-Digit PIN *</span>
                  <span className="text-[11px] font-mono text-indigo-300">
                    Default PIN: {selectedFam.code}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={`Enter PIN or password (e.g., ${selectedFam.code})`}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium flex items-center gap-2 animate-shake">
                  <HelpCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Quick Fill Demo Badges */}
              <div className="pt-1">
                <p className="text-[11px] text-slate-400 mb-2 font-medium">
                  Quick Demo Accounts (Click to auto-fill password):
                </p>
                <div className="flex flex-wrap gap-2">
                  {families.slice(0, 4).map((fam) => (
                    <button
                      key={fam.id}
                      type="button"
                      onClick={() => handleQuickFill(fam.id, fam.code)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1.5 ${
                        selectedFamilyId === fam.id
                          ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                    >
                      <span>{fam.name.split(' ')[0]}</span>
                      {fam.isAdmin && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">
                          Admin
                        </span>
                      )}
                      <span className="font-mono text-[10px] opacity-75">
                        ({fam.code})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 border border-white/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Login to Comedy Group Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
