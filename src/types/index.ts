export type UserRole = 'donor' | 'receiver' | 'ngo' | 'admin';

export type FoodCategory = 'Meals' | 'Vegetables' | 'Fruits' | 'Bakery' | 'Dairy' | 'Other';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: UserRole;
  organizationName?: string;
  address: string;
  profileImage?: string;
  createdAt: string;
  isActive: boolean;
}

export interface FoodListing {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorOrg?: string;
  foodName: string;
  category: FoodCategory;
  description: string;
  quantity: string; // e.g. "5 kg" or "25 packets"
  servings: number;
  imageUrl: string;
  preparedAt: string;
  availableUntil: string; // ISO date string or formatted time
  pickupLocation: string;
  latitude: number;
  longitude: number;
  foodType: 'veg' | 'non-veg';
  storageInstructions?: string;
  status: 'available' | 'reserved' | 'collected' | 'expired';
  createdAt: string;
  distanceKm?: number; // Calculated relative to user
}

export type RequestStatus = 'requested' | 'pickup_in_progress' | 'collected' | 'cancelled';

export interface FoodRequest {
  id: string;
  foodId: string;
  foodName: string;
  foodImageUrl: string;
  category: FoodCategory;
  donorId: string;
  donorName: string;
  donorPhone: string;
  receiverId: string;
  receiverName: string;
  receiverOrg?: string;
  receiverPhone: string;
  quantityRequested: string;
  pickupLocation: string;
  pickupTime: string;
  requestStatus: RequestStatus;
  statusHistory: {
    status: RequestStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'new_food' | 'request_received' | 'request_approved' | 'request_rejected' | 'pickup_reminder' | 'food_collected' | 'expiry_alert';
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // foodId or requestId
}

export interface AdminStats {
  totalDonations: number;
  successfulCollections: number;
  totalUsers: number;
  foodRescuedTons: number;
  monthlyDonations: { month: string; donations: number; collections: number }[];
}

export interface SDGDetail {
  number: number;
  code: string;
  title: string;
  description: string;
  color: string;
  badgeBg: string;
  impactText: string;
}
