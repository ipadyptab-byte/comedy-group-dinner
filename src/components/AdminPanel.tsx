import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuCategory, MenuItem, Family } from '../types';
import {
  Shield,
  ShieldCheck,
  Utensils,
  Users,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Flame,
  Check,
  X,
  KeyRound,
  Phone,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    menuItems,
    families,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addFamily,
    updateFamily,
    deleteFamily,
    resetAllData,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'menu' | 'families'>('menu');

  // Menu Item Modal States
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Menu Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<MenuCategory>('Starter');
  const [newItemPrice, setNewItemPrice] = useState<number>(200);
  const [newItemJain, setNewItemJain] = useState(true);
  const [newItemPopular, setNewItemPopular] = useState(false);

  // Family / Member Modal States
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);

  // Family Form State
  const [famName, setFamName] = useState('');
  const [famContactPerson, setFamContactPerson] = useState('');
  const [famPhone, setFamPhone] = useState('');
  const [famCode, setFamCode] = useState('');
  const [famAdults, setFamAdults] = useState(2);
  const [famKids, setFamKids] = useState(2);
  const [famDiet, setFamDiet] = useState('Vegetarian');
  const [famIsAdmin, setFamIsAdmin] = useState(false);

  const categories: MenuCategory[] = [
    'Starter',
    'Main Course',
    'Roti Section',
    'Rice Section',
    'Dessert',
    'Drinks',
  ];

  // Open Add Menu Item
  const handleOpenAddMenu = () => {
    setNewItemName('');
    setNewItemCategory('Starter');
    setNewItemPrice(200);
    setNewItemJain(true);
    setNewItemPopular(false);
    setShowAddMenuModal(true);
  };

  // Open Edit Menu Item
  const handleOpenEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setNewItemName(item.name);
    setNewItemCategory(item.category);
    setNewItemPrice(item.price || 0);
    setNewItemJain(item.isJainAvailable ?? true);
    setNewItemPopular(item.isPopular ?? false);
  };

  const handleSaveMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (editingMenuItem) {
      updateMenuItem(editingMenuItem.id, {
        name: newItemName.trim(),
        category: newItemCategory,
        price: newItemPrice,
        isJainAvailable: newItemJain,
        isPopular: newItemPopular,
      });
      setEditingMenuItem(null);
    } else {
      addMenuItem({
        name: newItemName.trim(),
        category: newItemCategory,
        price: newItemPrice,
        isVegetarian: true,
        isJainAvailable: newItemJain,
        isPopular: newItemPopular,
      });
      setShowAddMenuModal(false);
    }
  };

  // Open Add Family
  const handleOpenAddFamily = () => {
    setFamName('');
    setFamContactPerson('');
    setFamPhone('+91 98765 ');
    setFamCode(String(Math.floor(1000 + Math.random() * 9000)));
    setFamAdults(2);
    setFamKids(2);
    setFamDiet('Vegetarian');
    setFamIsAdmin(false);
    setShowAddFamilyModal(true);
  };

  // Open Edit Family
  const handleOpenEditFamily = (fam: Family) => {
    setEditingFamily(fam);
    setFamName(fam.name);
    setFamContactPerson(fam.contactPerson);
    setFamPhone(fam.phone);
    setFamCode(fam.code);
    setFamAdults(fam.adultsCount);
    setFamKids(fam.childrenCount);
    setFamDiet(fam.dietaryPreference || 'Vegetarian');
    setFamIsAdmin(fam.isAdmin || false);
  };

  const handleSaveFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName.trim()) return;

    if (editingFamily) {
      updateFamily(editingFamily.id, {
        name: famName.trim(),
        contactPerson: famContactPerson.trim(),
        phone: famPhone.trim(),
        code: famCode.trim() || '1234',
        adultsCount: famAdults,
        childrenCount: famKids,
        dietaryPreference: famDiet.trim(),
        isAdmin: famIsAdmin,
      });
      setEditingFamily(null);
    } else {
      addFamily({
        name: famName.trim(),
        contactPerson: famContactPerson.trim(),
        phone: famPhone.trim(),
        code: famCode.trim() || '1234',
        adultsCount: famAdults,
        childrenCount: famKids,
        dietaryPreference: famDiet.trim(),
        isAdmin: famIsAdmin,
      });
      setShowAddFamilyModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Command Center Header */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-white">
                Admin Command Center
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Full administrative power: Add/edit menu dishes & manage member profiles
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all store data (events, RSVPs, orders & menu) back to default initial state?')) {
              resetAllData();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-bold transition-all backdrop-blur-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Store</span>
        </button>
      </div>

      {/* Admin Tab Selectors */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveAdminTab('menu')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeAdminTab === 'menu'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }`}
        >
          <Utensils className="w-4 h-4" /> Restaurant Menu Items ({menuItems.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('families')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeAdminTab === 'families'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }`}
        >
          <Users className="w-4 h-4" /> Comedy Group Members & Families ({families.length})
        </button>
      </div>

      {/* TAB 1: MENU MANAGEMENT */}
      {activeAdminTab === 'menu' && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-heading font-extrabold text-white">
                Restaurant Menu Item Control
              </h3>
              <p className="text-xs text-slate-300">
                Add new dishes, update pricing, toggle Jain availability, or mark popular items.
              </p>
            </div>
            <button
              onClick={handleOpenAddMenu}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> Add New Dish
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[550px] overflow-y-auto pr-1">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between gap-2 hover:bg-white/10 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">{item.name}</span>
                    {item.isPopular && (
                      <span className="p-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
                        <Flame className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {item.category} • <strong className="text-indigo-300">₹{item.price}</strong>
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Jain: {item.isJainAvailable ? 'Available ✅' : 'No ❌'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditMenu(item)}
                    className="p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-xs"
                    title="Edit Dish"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FAMILY / MEMBER MANAGEMENT */}
      {activeAdminTab === 'families' && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-heading font-extrabold text-white">
                Group Member & Family Directory
              </h3>
              <p className="text-xs text-slate-300">
                Add new member accounts, edit login PIN codes/passwords, or modify headcount & contact info.
              </p>
            </div>
            <button
              onClick={handleOpenAddFamily}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> Add New Family / Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {families.map((fam) => (
              <div
                key={fam.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {fam.avatar ? (
                      <img
                        src={fam.avatar}
                        alt={fam.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400/50"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                        {fam.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-white">{fam.name}</h4>
                        {fam.isAdmin && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {fam.contactPerson} • {fam.phone}
                      </p>
                      <p className="text-[11px] text-indigo-300 mt-0.5">
                        {fam.adultsCount} Adults, {fam.childrenCount} Kids | Pref: {fam.dietaryPreference || 'Standard'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-800 inline-flex items-center gap-1">
                      <KeyRound className="w-3 h-3" /> {fam.code}
                    </span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 text-xs">
                  <button
                    onClick={() => handleOpenEditFamily(fam)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile & PIN</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${fam.name}?`)) {
                        deleteFamily(fam.id);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MENU ITEM */}
      {(showAddMenuModal || editingMenuItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="backdrop-blur-2xl bg-[#0f172a] w-full max-w-md rounded-[32px] p-6 sm:p-7 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-heading font-extrabold text-white">
                {editingMenuItem ? 'Edit Menu Dish' : 'Add New Restaurant Dish'}
              </h3>
              <button
                onClick={() => {
                  setShowAddMenuModal(false);
                  setEditingMenuItem(null);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cheese Garlic Naan"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Menu Category *</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as MenuCategory)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1e293b] border border-white/15 text-white focus:outline-none focus:border-indigo-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-indigo-400 font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={newItemJain}
                    onChange={(e) => setNewItemJain(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <span>Jain Prep Option</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={newItemPopular}
                    onChange={(e) => setNewItemPopular(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <span>Mark Popular (★)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenuModal(false);
                    setEditingMenuItem(null);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  {editingMenuItem ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FAMILY MEMBER */}
      {(showAddFamilyModal || editingFamily) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="backdrop-blur-2xl bg-[#0f172a] w-full max-w-lg rounded-[32px] p-6 sm:p-7 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-heading font-extrabold text-white">
                {editingFamily ? `Edit ${editingFamily.name}` : 'Register New Family Account'}
              </h3>
              <button
                onClick={() => {
                  setShowAddFamilyModal(false);
                  setEditingFamily(null);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFamilySubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Family Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Singhania Family"
                    value={famName}
                    onChange={(e) => setFamName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Contact Person(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram & Pooja"
                    value={famContactPerson}
                    onChange={(e) => setFamContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={famPhone}
                    onChange={(e) => setFamPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-indigo-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Login PIN Code / Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1234"
                    value={famCode}
                    onChange={(e) => setFamCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-amber-300 font-mono font-bold focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Adults Count</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={famAdults}
                    onChange={(e) => setFamAdults(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Children Count</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={famKids}
                    onChange={(e) => setFamKids(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-200 mb-1">Dietary Preference</label>
                  <input
                    type="text"
                    placeholder="e.g. Jain, Less Spicy"
                    value={famDiet}
                    onChange={(e) => setFamDiet(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                  <input
                    type="checkbox"
                    checked={famIsAdmin}
                    onChange={(e) => setFamIsAdmin(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <div>
                    <p className="font-bold">Grant Admin Rights</p>
                    <p className="text-[10px] text-amber-300/80">
                      Allows this account to access the Admin Command Center and manage menu/families.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFamilyModal(false);
                    setEditingFamily(null);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  {editingFamily ? 'Update Family' : 'Register Family'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
