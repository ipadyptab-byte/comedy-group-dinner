import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Family, MemberDetail } from '../types';
import {
  UserCheck,
  ShieldCheck,
  KeyRound,
  Users,
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Utensils,
  Heart,
  Baby,
  Edit2,
  Lock,
  Phone,
  LogOut,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Check,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentFamily, updateFamily, currentRole, logout } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File & Camera refs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Live Camera Stream Modal State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!currentFamily) return null;

  // Form states initialized with currentFamily
  const [name, setName] = useState(currentFamily.name);
  const [contactPerson, setContactPerson] = useState(currentFamily.contactPerson);
  const [phone, setPhone] = useState(currentFamily.phone);
  const [avatar, setAvatar] = useState(currentFamily.avatar || '');
  const [dietaryPreference, setDietaryPreference] = useState(
    currentFamily.dietaryPreference || 'Veg'
  );
  const [specialDietaryNotes, setSpecialDietaryNotes] = useState(
    currentFamily.specialDietaryNotes || ''
  );
  const [address, setAddress] = useState(currentFamily.address || '');

  // Passcode state
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Members lists
  const [adultsList, setAdultsList] = useState<MemberDetail[]>(
    currentFamily.adultsList && currentFamily.adultsList.length > 0
      ? currentFamily.adultsList
      : Array.from({ length: currentFamily.adultsCount || 2 }).map((_, i) => ({
          id: `adult-init-${i}`,
          name: i === 0 ? currentFamily.contactPerson : `Adult Member ${i + 1}`,
          type: 'adult',
          age: 35,
          gender: 'Male',
          foodPreference: currentFamily.dietaryPreference || 'Veg',
        }))
  );

  const [kidsList, setKidsList] = useState<MemberDetail[]>(
    currentFamily.kidsList && currentFamily.kidsList.length > 0
      ? currentFamily.kidsList
      : Array.from({ length: currentFamily.childrenCount || 0 }).map((_, i) => ({
          id: `kid-init-${i}`,
          name: `Kid Member ${i + 1}`,
          type: 'kid',
          age: 8,
          gender: 'Boy',
          foodPreference: currentFamily.dietaryPreference || 'Veg',
        }))
  );

  // New adult modal input
  const [newAdultName, setNewAdultName] = useState('');
  const [newAdultAge, setNewAdultAge] = useState(30);
  const [newAdultGender, setNewAdultGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newAdultFood, setNewAdultFood] = useState('Veg');

  // New kid modal input
  const [newKidName, setNewKidName] = useState('');
  const [newKidAge, setNewKidAge] = useState(6);
  const [newKidGender, setNewKidGender] = useState<'Boy' | 'Girl' | 'Other'>('Boy');
  const [newKidFood, setNewKidFood] = useState('Veg');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  ];

  // Image compressor helper
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(dataUrl);
          showToast('Profile photo loaded! Click "Save General Profile" to confirm.');
        }
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Live Camera Handlers
  const startLiveCamera = async () => {
    setCameraError(null);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to open live web camera view. Please use the "Native Camera App" option or "Device Gallery".');
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(dataUrl);
        showToast('Photo captured! Click "Save General Profile" to save.');
      }
      stopLiveCamera();
    }
  };

  // Add adult
  const handleAddAdult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdultName.trim()) return;
    const newItem: MemberDetail = {
      id: `adult-${Date.now()}`,
      name: newAdultName.trim(),
      type: 'adult',
      age: Number(newAdultAge),
      gender: newAdultGender,
      foodPreference: newAdultFood,
    };
    setAdultsList([...adultsList, newItem]);
    setNewAdultName('');
  };

  // Remove adult
  const handleRemoveAdult = (id: string) => {
    if (adultsList.length <= 1) {
      alert('At least 1 adult member (Captain) is required.');
      return;
    }
    setAdultsList(adultsList.filter((a) => a.id !== id));
  };

  // Add kid
  const handleAddKid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidName.trim()) return;
    const newItem: MemberDetail = {
      id: `kid-${Date.now()}`,
      name: newKidName.trim(),
      type: 'kid',
      age: Number(newKidAge),
      gender: newKidGender,
      foodPreference: newKidFood,
    };
    setKidsList([...kidsList, newItem]);
    setNewKidName('');
  };

  // Remove kid
  const handleRemoveKid = (id: string) => {
    setKidsList(kidsList.filter((k) => k.id !== id));
  };

  // Save General Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateFamily(currentFamily.id, {
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      avatar,
      dietaryPreference,
      specialDietaryNotes: specialDietaryNotes.trim(),
      address: address.trim(),
      adultsCount: adultsList.length,
      childrenCount: kidsList.length,
      adultsList,
      kidsList,
    });
    showToast('Family profile updated successfully! 🎉');
  };

  // Update Passcode
  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    if (currentPasscode.trim() !== (currentFamily.code || '').trim() && currentPasscode.trim() !== (currentFamily.password || '').trim()) {
      setPasscodeError('Current passcode/PIN is incorrect.');
      return;
    }

    if (!newPasscode || newPasscode.trim().length < 4) {
      setPasscodeError('New passcode must be at least 4 digits or characters.');
      return;
    }

    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setPasscodeError('New passcode and confirm passcode do not match.');
      return;
    }

    updateFamily(currentFamily.id, {
      code: newPasscode.trim(),
      password: newPasscode.trim(),
    });

    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    showToast('Passcode updated successfully! 🔐');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Profile Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={currentFamily.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-xl">
                  {currentFamily.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-indigo-500 text-white shadow-lg">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-heading font-extrabold text-white">
                  {currentFamily.name}
                </h1>
                {currentFamily.isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" /> Group Admin
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-indigo-400" /> Family Member
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-2">
                <span>Captain: <strong className="text-white">{currentFamily.contactPerson}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> {currentFamily.phone}
                </span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs">
                <span className="px-3 py-1 rounded-xl bg-white/10 text-slate-200 font-semibold border border-white/10">
                  👥 {adultsList.length} Adults, {kidsList.length} Kids
                </span>
                <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 font-semibold border border-indigo-500/30">
                  🥗 Preference: {dietaryPreference}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  🔑 PIN: •••• ({currentFamily.code})
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all border border-rose-400/30 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Section (General Profile & Photo) | Right Section (Passcode & Security) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Details & Avatars (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Family Information & Photo */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-heading font-bold text-white">
                Family & Captain Details
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Hidden File Inputs for Device Gallery & Native Camera */}
              <input
                type="file"
                accept="image/*"
                ref={galleryInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                capture="user"
                ref={cameraInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Profile Photo Upload & Camera Options */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                <label className="block font-bold text-slate-200">
                  Profile Photo (Upload from Gallery or Take Photo)
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all border border-indigo-400/30"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload from Gallery</span>
                  </button>

                  <button
                    type="button"
                    onClick={startLiveCamera}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all border border-purple-400/30"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo (Live Camera)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all border border-slate-700"
                    title="Open native camera app"
                  >
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>Camera App</span>
                  </button>
                </div>

                {/* Preset Avatars Bar */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-slate-400 mb-2">
                    Or select a preset avatar:
                  </p>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {avatarPresets.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(imgUrl)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                          avatar === imgUrl ? 'border-amber-400 scale-110 shadow-lg ring-2 ring-amber-400/30' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="Preset Avatar" className="w-10 h-10 rounded-lg object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL Fallback */}
                <input
                  type="url"
                  placeholder="Or paste custom image URL (https://...)"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Family Name & Captain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Family Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Primary Contact / Captain Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Phone & Dietary Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    WhatsApp / Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Family Default Dietary Preference *
                  </label>
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Veg">Pure Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Jain Food">Strict Jain Food</option>
                    <option value="Eggitarian">Eggitarian</option>
                    <option value="Mixed">Mixed Preferences</option>
                  </select>
                </div>
              </div>

              {/* Special Allergy / Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Food Allergies & Special Dietary Requests
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. No mushroom, mild spice for kids, Jain food required for parents"
                  value={specialDietaryNotes}
                  onChange={(e) => setSpecialDietaryNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Address / Locality */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Residential Address / Locality (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kalyani Nagar, Pune"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save General Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Family Members (Adults & Kids Roster) */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-heading font-bold text-white">
                  Family Members Roster (Adults & Kids)
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Total: {adultsList.length + kidsList.length} Members
              </span>
            </div>

            {/* ADULTS ROSTER */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>Adult Members ({adultsList.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adultsList.map((adult) => (
                  <div
                    key={adult.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{adult.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {adult.gender || 'Adult'} • Age: {adult.age || 30} • Food: {adult.foodPreference || 'Veg'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAdult(adult.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                      title="Remove Adult"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Adult Form */}
              <form onSubmit={handleAddAdult} className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-2">
                <p className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add New Adult Member
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Adult Name"
                    required
                    value={newAdultName}
                    onChange={(e) => setNewAdultName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                  <select
                    value={newAdultGender}
                    onChange={(e) => setNewAdultGender(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <select
                    value={newAdultFood}
                    onChange={(e) => setNewAdultFood(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Jain">Jain</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    + Add Adult
                  </button>
                </div>
              </form>
            </div>

            {/* KIDS ROSTER */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-rose-400" />
                  <span>Kids & Children ({kidsList.length})</span>
                </h3>
              </div>

              {kidsList.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  No kids added yet. Use the form below to add children details.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {kidsList.map((kid) => (
                    <div
                      key={kid.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-rose-300">{kid.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {kid.gender || 'Child'} • Age: {kid.age || 6} yrs • Food: {kid.foodPreference || 'Veg'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveKid(kid.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                        title="Remove Kid"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Kid Form */}
              <form onSubmit={handleAddKid} className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                <p className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Child / Kid Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Kid's Name"
                    required
                    value={newKidName}
                    onChange={(e) => setNewKidName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none sm:col-span-2"
                  />
                  <input
                    type="number"
                    min={1}
                    max={17}
                    placeholder="Age"
                    value={newKidAge}
                    onChange={(e) => setNewKidAge(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                  <select
                    value={newKidGender}
                    onChange={(e) => setNewKidGender(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    + Add Kid
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Passcode & Security (1 Col) */}
        <div className="space-y-6">
          {/* Section 3: Passcode & Security */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-heading font-bold text-white">
                Change Family Passcode
              </h2>
            </div>

            <p className="text-xs text-slate-300">
              Your passcode/PIN is used for 1-click login and access verification for {currentFamily.name}.
            </p>

            <form onSubmit={handleUpdatePasscode} className="space-y-3 text-xs">
              {passcodeError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Current Passcode / PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current PIN (e.g. 1001)"
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  New Passcode / PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new PIN or Password"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Confirm New Passcode / PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new PIN"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>Update Passcode</span>
              </button>
            </form>
          </div>

          {/* Section 4: Group Member Card & Badges */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Comedy Group Membership</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Account Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Verified
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Family ID Code:</span>
                <span className="font-mono text-indigo-300 font-bold">{currentFamily.id}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Group Role:</span>
                <span className="font-bold text-amber-300">
                  {currentFamily.isAdmin ? 'Admin Captain' : 'Family Member'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Web Camera Capture Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Camera className="w-5 h-5 text-purple-400" />
                <span>Live Camera Photo Capture</span>
              </div>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs space-y-3 text-center">
                <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    cameraInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Open Native Camera App Instead
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border border-slate-700 flex items-center justify-center shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-indigo-400/40 rounded-2xl pointer-events-none" />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
