import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Event, MenuCategory, OrderItem } from '../types';
import {
  Utensils,
  Plus,
  Minus,
  Search,
  Sparkles,
  CheckCircle2,
  Send,
  AlertCircle,
  Clock,
  MessageSquare,
  Flame,
  Leaf,
} from 'lucide-react';

interface FoodOrderSectionProps {
  event: Event;
  onOrderSaved?: () => void;
}

export const FoodOrderSection: React.FC<FoodOrderSectionProps> = ({
  event,
  onOrderSaved,
}) => {
  const { menuItems, currentFamily, orders, submitFoodOrder } = useApp();

  const myOrder = currentFamily
    ? orders.find((o) => o.eventId === event.id && o.familyId === currentFamily.id)
    : null;

  const [activeCategory, setActiveCategory] = useState<MenuCategory>('Starter');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<{ [itemId: string]: number }>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing order if available
  useEffect(() => {
    if (myOrder) {
      const initialMap: { [id: string]: number } = {};
      myOrder.items.forEach((item) => {
        initialMap[item.menuItemId] = item.quantity;
      });
      setCartItems(initialMap);
      setSpecialInstructions(myOrder.specialInstructions || '');
    }
  }, [myOrder, event.id]);

  const categories: MenuCategory[] = [
    'Starter',
    'Main Course',
    'Roti Section',
    'Rice Section',
    'Dessert',
    'Drinks',
  ];

  const handleQuantityChange = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleQuickInstructionTag = (tag: string) => {
    setSpecialInstructions((prev) => {
      if (!prev) return tag;
      if (prev.includes(tag)) return prev;
      return `${prev}, ${tag}`;
    });
  };

  // Compute total items ordered
  const totalItemCount = (Object.values(cartItems) as number[]).reduce((a: number, b: number) => a + b, 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFamily) return;

    const itemsToSubmit: OrderItem[] = (Object.entries(cartItems) as [string, number][])
      .map(([menuItemId, quantity]) => {
        const found = menuItems.find((m) => m.id === menuItemId);
        if (!found || (quantity as number) <= 0) return null;
        return {
          menuItemId,
          itemName: found.name,
          category: found.category,
          quantity: quantity as number,
        };
      })
      .filter(Boolean) as OrderItem[];

    submitFoodOrder(event.id, itemsToSubmit, specialInstructions);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (onOrderSaved) {
      onOrderSaved();
    }
  };

  // Filter items by category and search query
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-white">
              Restaurant Food Order Builder
            </h3>
            <p className="text-xs text-slate-400">
              Select starters, main course, rotis & drinks for {currentFamily?.name}
            </p>
          </div>
        </div>

        {totalItemCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
            {totalItemCount} Items Selected
          </span>
        )}
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="mt-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish (e.g. Masala Papad, Paneer Butter Masala, Roti)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const countInCat = (Object.entries(cartItems) as [string, number][]).reduce((sum: number, [itemId, qty]) => {
              const item = menuItems.find((m) => m.id === itemId);
              return item && item.category === cat ? sum + qty : sum;
            }, 0);

            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{cat}</span>
                {countInCat > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-indigo-900">
                    {countInCat}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {filteredMenuItems.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-slate-400 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
            No dishes found matching "{searchQuery}" in {activeCategory}.
          </div>
        ) : (
          filteredMenuItems.map((item) => {
            const qty = cartItems[item.id] || 0;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  qty > 0
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md'
                    : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    {item.isPopular && (
                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {item.price && (
                      <span className="text-[11px] font-mono text-slate-300">
                        ₹{item.price}
                      </span>
                    )}
                    {item.isJainAvailable && (
                      <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/50">
                        Jain Opt
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={qty === 0}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                      qty > 0
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 text-center text-xs font-bold font-mono text-white">
                    {qty}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center font-bold text-xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Special Instructions & Food Notes */}
      <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
        <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          Special Cooking Instructions & Diet Requirements
        </label>

        {/* Quick Tags */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[
            'Less spicy',
            'No onion',
            'No garlic',
            'Jain food',
            'Extra butter',
            'Baby food',
            'Separate gravy',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickInstructionTag(tag)}
              className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-indigo-950 hover:text-indigo-300 border border-slate-700 text-slate-300 text-[10px] transition-all"
            >
              + {tag}
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          placeholder="e.g. Less spicy for children. Jain food for Patel uncle. Extra butter on Naan."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      {/* Order Summary Submit Bar */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">Order Summary for {currentFamily?.name}:</p>
          <p className="text-sm font-bold text-indigo-300">
            {totalItemCount} Total Items Selected Across Categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Order Sent to Captain!
            </span>
          )}

          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={totalItemCount === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
              totalItemCount > 0
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Submit Food Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodOrderSection;
