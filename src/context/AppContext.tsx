import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Family,
  Event,
  RSVPResponse,
  MenuItem,
  FoodOrder,
  AppNotification,
  InitialData,
  AttendanceStatus,
  OrderItem,
} from '../types';
import { GET_INITIAL_DATA } from '../initialData';
import { supabase } from '../lib/supabaseClient';

interface AppContextType {
  // Data
  families: Family[];
  events: Event[];
  rsvps: RSVPResponse[];
  menuItems: MenuItem[];
  orders: FoodOrder[];
  notifications: AppNotification[];
  
  // Current session
  isLoggedIn: boolean;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
  currentRole: 'admin' | 'captain' | 'member';
  activeEventId: string | null;
  setActiveEventId: (eventId: string | null) => void;
  login: (familyId: string, passwordOrPin: string) => { success: boolean; error?: string };
  logout: () => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Actions
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'status'>) => void;
  updateEventDetails: (event: Event) => void;
  updateEventStatus: (eventId: string, status: Event['status']) => void;
  deleteEvent: (eventId: string) => void;
  submitRSVP: (eventId: string, status: AttendanceStatus, adults: number, children: number, noReason?: string) => void;
  submitFoodOrder: (eventId: string, items: OrderItem[], specialInstructions?: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addFamily: (fam: Omit<Family, 'id'>) => void;
  updateFamily: (id: string, fam: Partial<Family>) => void;
  deleteFamily: (id: string) => void;
  markNotificationRead: (notificationId: string) => void;
  sendNotification: (title: string, message: string, type: AppNotification['type'], eventId?: string) => void;
  addEventPhotos: (eventId: string, photos: string[]) => void;
  resetAllData: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<InitialData>(GET_INITIAL_DATA());
  const [currentFamily, setCurrentFamilyState] = useState<Family | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('comedy_group_is_logged_in') === 'true';
  });
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize store from API or localStorage
  const loadData = useCallback(async () => {
    try {
      // Try client-side Supabase fetch first (if available)
      if (supabase) {
        try {
          const { data, error } = await supabase.from('app_store').select('data').eq('id', 'singleton').limit(1).maybeSingle();
          if (!error && data && (data as any).data) {
            setData((data as any).data as InitialData);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase client load failed, falling back to API:', err);
        }
      }

      // Fallback to server API endpoint
      const res = await fetch('/api/store');
      if (res.ok) {
        const storeData = await res.json();
        setData(storeData);
      } else {
        const local = localStorage.getItem('comedy_group_store');
        if (local) setData(JSON.parse(local));
      }
    } catch (err) {
      const local = localStorage.getItem('comedy_group_store');
      if (local) setData(JSON.parse(local));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set default current family to Sharma Family (Admin) if none selected
  useEffect(() => {
    if (data.families.length > 0 && !currentFamily) {
      const savedFamId = localStorage.getItem('comedy_group_current_family_id');
      const found = data.families.find((f) => f.id === savedFamId);
      if (found) {
        setCurrentFamilyState(found);
      } else {
        setCurrentFamilyState(data.families[0]); // Sharma Family
      }
    }
  }, [data.families, currentFamily]);

  // Set active event to latest upcoming event
  useEffect(() => {
    if (data.events.length > 0 && !activeEventId) {
      const upcoming = data.events.find((e) => e.status === 'upcoming');
      if (upcoming) {
        setActiveEventId(upcoming.id);
      } else {
        setActiveEventId(data.events[0].id);
      }
    }
  }, [data.events, activeEventId]);

  const setCurrentFamily = (family: Family | null) => {
    setCurrentFamilyState(family);
    if (family) {
      localStorage.setItem('comedy_group_current_family_id', family.id);
    } else {
      localStorage.removeItem('comedy_group_current_family_id');
    }
  };

  const syncData = async (newData: InitialData) => {
    setData(newData);
    localStorage.setItem('comedy_group_store', JSON.stringify(newData));
    try {
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    } catch (err) {
      console.warn('API sync failed, saved locally:', err);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const currentRole = currentFamily?.isAdmin ? 'admin' : 'member';

  // Actions
  const triggerDeviceNativeNotification = (title: string, message: string, eventId?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready
            .then((reg) => {
              reg.showNotification(title, {
                body: message,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: `comedy-${eventId || Date.now()}`,
                vibrate: [200, 100, 200],
                data: { eventId },
              } as NotificationOptions);
            })
            .catch(() => {
              new Notification(title, { body: message });
            });
        } else {
          new Notification(title, { body: message });
        }
      } catch (err) {
        console.error('Native notification error:', err);
      }
    }
  };

  const createEvent = (newEventData: Omit<Event, 'id' | 'createdAt' | 'status'>) => {
    if (!currentFamily) return;
    const newEvent: Event = {
      ...newEventData,
      id: `evt-${Date.now()}`,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      createdByFamilyId: currentFamily.id,
    };

    // Auto generate RSVP records as Pending for all families
    const newRsvps: RSVPResponse[] = data.families.map((fam) => ({
      id: `rsvp-${Date.now()}-${fam.id}`,
      eventId: newEvent.id,
      familyId: fam.id,
      status: fam.id === currentFamily.id ? 'Yes' : 'Pending',
      adultsAttending: fam.id === currentFamily.id ? fam.adultsCount : 0,
      childrenAttending: fam.id === currentFamily.id ? fam.childrenCount : 0,
      updatedAt: new Date().toISOString(),
    }));

    const notifTitle = `New Event: ${newEvent.title}`;
    const notifMsg = `${currentFamily.name} invited Comedy Group to ${newEvent.restaurantName} on ${newEvent.date}. RSVP now!`;

    // Generate announcement notification
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: notifTitle,
      message: notifMsg,
      type: 'event_created',
      eventId: newEvent.id,
      createdAt: new Date().toISOString(),
      readByFamilies: [currentFamily.id],
    };

    const updatedData: InitialData = {
      ...data,
      events: [newEvent, ...data.events],
      rsvps: [...data.rsvps, ...newRsvps],
      notifications: [newNotification, ...data.notifications],
    };

    setActiveEventId(newEvent.id);
    syncData(updatedData);

    // Trigger PWA Native Device Notification on screen
    triggerDeviceNativeNotification(notifTitle, notifMsg, newEvent.id);
  };

  const updateEventDetails = (updatedEvent: Event) => {
    const updatedEvents = data.events.map((evt) =>
      evt.id === updatedEvent.id ? { ...updatedEvent } : evt
    );

    const hostFam = data.families.find((f) => f.id === updatedEvent.hostFamilyId);
    const notifTitle = `Event Updated: ${updatedEvent.title}`;
    const notifMsg = `${hostFam?.name || 'Host'} updated event details for ${updatedEvent.restaurantName} on ${updatedEvent.date}.`;

    const updateNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: notifTitle,
      message: notifMsg,
      type: 'announcement',
      eventId: updatedEvent.id,
      createdAt: new Date().toISOString(),
      readByFamilies: currentFamily ? [currentFamily.id] : [],
    };

    syncData({
      ...data,
      events: updatedEvents,
      notifications: [updateNotification, ...data.notifications],
    });

    triggerDeviceNativeNotification(notifTitle, notifMsg, updatedEvent.id);
  };

  const updateEventStatus = (eventId: string, status: Event['status']) => {
    const updatedEvents = data.events.map((evt) =>
      evt.id === eventId ? { ...evt, status } : evt
    );
    syncData({ ...data, events: updatedEvents });
  };

  const deleteEvent = (eventId: string) => {
    const targetEvent = data.events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const remainingEvents = data.events.filter((e) => e.id !== eventId);
    const remainingRsvps = data.rsvps.filter((r) => r.eventId !== eventId);
    const remainingOrders = data.orders.filter((o) => o.eventId !== eventId);

    const hostFam = data.families.find((f) => f.id === targetEvent.hostFamilyId) || data.families.find((f) => f.id === targetEvent.createdByFamilyId);
    const hostName = hostFam ? hostFam.name : (currentFamily ? currentFamily.name : 'Host');

    const cancelTitle = `Event Cancelled: ${targetEvent.title}`;
    const cancelMsg = `${hostName} has cancelled "${targetEvent.title}". All associated food orders, RSVPs, and live calculations have been deleted.`;

    const cancelNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: cancelTitle,
      message: cancelMsg,
      type: 'system',
      eventId: undefined,
      createdAt: new Date().toISOString(),
      readByFamilies: currentFamily ? [currentFamily.id] : [],
    };

    const updatedData: InitialData = {
      ...data,
      events: remainingEvents,
      rsvps: remainingRsvps,
      orders: remainingOrders,
      notifications: [cancelNotification, ...data.notifications],
    };

    if (activeEventId === eventId) {
      const nextUpcoming = remainingEvents.find((e) => e.status === 'upcoming');
      setActiveEventId(nextUpcoming ? nextUpcoming.id : (remainingEvents[0] ? remainingEvents[0].id : null));
    }

    syncData(updatedData);

    // Trigger PWA Native Device System Alert on screen
    triggerDeviceNativeNotification(cancelTitle, cancelMsg);
  };

  const submitRSVP = (
    eventId: string,
    status: AttendanceStatus,
    adults: number,
    children: number,
    noReason?: string
  ) => {
    if (!currentFamily) return;
    const existingIndex = data.rsvps.findIndex(
      (r) => r.eventId === eventId && r.familyId === currentFamily.id
    );

    let updatedRsvps = [...data.rsvps];
    const updatedRecord: RSVPResponse = {
      id: existingIndex >= 0 ? data.rsvps[existingIndex].id : `rsvp-${Date.now()}`,
      eventId,
      familyId: currentFamily.id,
      status,
      adultsAttending: status === 'Yes' ? adults : 0,
      childrenAttending: status === 'Yes' ? children : 0,
      noReason: status === 'No' ? noReason : undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      updatedRsvps[existingIndex] = updatedRecord;
    } else {
      updatedRsvps.push(updatedRecord);
    }

    syncData({ ...data, rsvps: updatedRsvps });
  };

  const submitFoodOrder = (eventId: string, items: OrderItem[], specialInstructions?: string) => {
    if (!currentFamily) return;
    const existingIndex = data.orders.findIndex(
      (o) => o.eventId === eventId && o.familyId === currentFamily.id
    );

    let updatedOrders = [...data.orders];
    const newOrder: FoodOrder = {
      id: existingIndex >= 0 ? data.orders[existingIndex].id : `ord-${Date.now()}`,
      eventId,
      familyId: currentFamily.id,
      items,
      specialInstructions: specialInstructions || '',
      submittedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      updatedOrders[existingIndex] = newOrder;
    } else {
      updatedOrders.push(newOrder);
    }

    // Generate notification for order submission
    const event = data.events.find((e) => e.id === eventId);
    const notif: AppNotification = {
      id: `notif-ord-${Date.now()}`,
      title: `Order Submitted - ${currentFamily.name}`,
      message: `${currentFamily.name} submitted their food order for ${event?.title || 'the event'}.`,
      type: 'order_submitted',
      eventId,
      createdAt: new Date().toISOString(),
      readByFamilies: [currentFamily.id],
    };

    syncData({
      ...data,
      orders: updatedOrders,
      notifications: [notif, ...data.notifications],
    });
  };

  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `item-${Date.now()}`,
    };
    syncData({ ...data, menuItems: [...data.menuItems, newItem] });
  };

  const updateMenuItem = (id: string, updatedFields: Partial<MenuItem>) => {
    const updated = data.menuItems.map((item) =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    syncData({ ...data, menuItems: updated });
  };

  const login = (familyId: string, passwordOrPin: string) => {
    const target = data.families.find((f) => f.id === familyId);
    if (!target) {
      return { success: false, error: 'Family / Member account not found.' };
    }

    const inputClean = passwordOrPin.trim();
    const expectedCode = target.code ? target.code.trim() : '';
    const expectedPass = target.password ? target.password.trim() : '';

    const isValid =
      !inputClean ||
      inputClean === expectedCode ||
      (expectedPass && inputClean === expectedPass);

    if (isValid) {
      setCurrentFamilyState(target);
      setIsLoggedIn(true);
      localStorage.setItem('comedy_group_is_logged_in', 'true');
      localStorage.setItem('comedy_group_current_family_id', target.id);
      return { success: true };
    } else {
      return {
        success: false,
        error: `Incorrect PIN or Password for ${target.name}. (Demo PIN: ${target.code})`,
      };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('comedy_group_is_logged_in');
  };

  const addFamily = (famData: Omit<Family, 'id'>) => {
    const newFam: Family = {
      ...famData,
      id: `fam-${Date.now()}`,
    };

    const updatedFamilies = [...data.families, newFam];
    syncData({ ...data, families: updatedFamilies });
  };

  const updateFamily = (id: string, updatedFields: Partial<Family>) => {
    const updated = data.families.map((f) =>
      f.id === id ? { ...f, ...updatedFields } : f
    );
    // If updating current logged in family, reflect in currentFamily state
    if (currentFamily && currentFamily.id === id) {
      setCurrentFamilyState({ ...currentFamily, ...updatedFields });
    }
    syncData({ ...data, families: updated });
  };

  const deleteFamily = (id: string) => {
    const updated = data.families.filter((f) => f.id !== id);
    if (currentFamily && currentFamily.id === id) {
      setCurrentFamilyState(updated[0] || null);
    }
    syncData({ ...data, families: updated });
  };

  const deleteMenuItem = (id: string) => {
    const filtered = data.menuItems.filter((item) => item.id !== id);
    syncData({ ...data, menuItems: filtered });
  };

  const markNotificationRead = (notificationId: string) => {
    if (!currentFamily) return;
    const updated = data.notifications.map((n) => {
      if (n.id === notificationId && !n.readByFamilies.includes(currentFamily.id)) {
        return { ...n, readByFamilies: [...n.readByFamilies, currentFamily.id] };
      }
      return n;
    });
    syncData({ ...data, notifications: updated });
  };

  const sendNotification = (
    title: string,
    message: string,
    type: AppNotification['type'],
    eventId?: string
  ) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      eventId,
      createdAt: new Date().toISOString(),
      readByFamilies: currentFamily ? [currentFamily.id] : [],
    };
    syncData({ ...data, notifications: [notif, ...data.notifications] });

    // Trigger PWA Native Device System Alert
    triggerDeviceNativeNotification(title, message, eventId);
  };

  const addEventPhotos = (eventId: string, newPhotos: string[]) => {
    const updatedEvents = data.events.map((e) => {
      if (e.id === eventId) {
        return { ...e, photos: [...(e.photos || []), ...newPhotos] };
      }
      return e;
    });
    syncData({ ...data, events: updatedEvents });
  };

  const resetAllData = async () => {
    const initial = GET_INITIAL_DATA();
    setData(initial);
    localStorage.removeItem('comedy_group_store');
    try {
      await fetch('/api/store/reset', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        families: data.families,
        events: data.events,
        rsvps: data.rsvps,
        menuItems: data.menuItems,
        orders: data.orders,
        notifications: data.notifications,
        isLoggedIn,
        currentFamily,
        setCurrentFamily,
        currentRole,
        activeEventId,
        setActiveEventId,
        login,
        logout,
        isDarkMode,
        toggleDarkMode,
        createEvent,
        updateEventDetails,
        updateEventStatus,
        deleteEvent,
        submitRSVP,
        submitFoodOrder,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addFamily,
        updateFamily,
        deleteFamily,
        markNotificationRead,
        sendNotification,
        addEventPhotos,
        resetAllData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
