export type Role = 'admin' | 'captain' | 'member';

export interface MemberDetail {
  id: string;
  name: string;
  type: 'adult' | 'kid';
  age?: number;
  gender?: 'Male' | 'Female' | 'Boy' | 'Girl' | 'Other';
  foodPreference?: 'Veg' | 'Non-Veg' | 'Jain' | string;
}

export interface Family {
  id: string;
  name: string;
  code: string;
  password?: string;
  adultsCount: number;
  childrenCount: number;
  contactPerson: string;
  phone: string;
  avatar?: string;
  dietaryPreference?: string;
  specialDietaryNotes?: string;
  address?: string;
  isAdmin?: boolean;
  adultsList?: MemberDetail[];
  kidsList?: MemberDetail[];
}

export type EventType =
  | 'Birthday'
  | 'Anniversary'
  | 'Holiday Dinner'
  | 'Festival Celebration'
  | 'Weekend Dinner'
  | 'Regular Dinner'
  | 'Other';

export interface Event {
  id: string;
  title: string;
  eventType: EventType;
  hostFamilyId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  restaurantName: string;
  address: string;
  googleMapUrl: string;
  orderDeadline: string; // YYYY-MM-DDTHH:mm
  notes?: string;
  status: 'upcoming' | 'ordering_closed' | 'completed' | 'cancelled';
  createdAt: string;
  createdByFamilyId: string;
  photos?: string[];
}

export type AttendanceStatus = 'Yes' | 'No' | 'Maybe' | 'Pending';

export interface RSVPResponse {
  id: string;
  eventId: string;
  familyId: string;
  status: AttendanceStatus;
  noReason?: 'Out of station' | 'Busy' | 'Sick' | 'Other' | string;
  adultsAttending: number;
  childrenAttending: number;
  updatedAt: string;
}

export type MenuCategory =
  | 'Starter'
  | 'Main Course'
  | 'Roti Section'
  | 'Rice Section'
  | 'Dessert'
  | 'Drinks';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description?: string;
  price?: number;
  isVegetarian?: boolean;
  isJainAvailable?: boolean;
  isPopular?: boolean;
}

export interface OrderItem {
  menuItemId: string;
  itemName: string;
  category: MenuCategory;
  quantity: number;
}

export interface FoodOrder {
  id: string;
  eventId: string;
  familyId: string;
  items: OrderItem[];
  specialInstructions?: string;
  submittedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'event_created' | 'reminder' | 'order_submitted' | 'event_soon' | 'announcement' | 'event_cancelled' | 'system';
  eventId?: string;
  targetFamilyId?: string;
  createdAt: string;
  readByFamilies: string[];
}

export interface InitialData {
  families: Family[];
  events: Event[];
  rsvps: RSVPResponse[];
  menuItems: MenuItem[];
  orders: FoodOrder[];
  notifications: AppNotification[];
}
