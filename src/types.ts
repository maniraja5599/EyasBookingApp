export interface Enquiry {
    id: string;
    customerName: string;
    phone: string;
    serviceType: 'pre-pleat' | 'drape' | 'both';
    location: 'shop' | 'onsite';
    gps?: { lat: number; lng: number };
    eventDate: string;
    sareeCount: number;
    notes: string;
    status: 'new' | 'follow-up' | 'converted' | 'cancelled';
    createdAt: string;
}

export interface AdditionalCharge {
    name: string;
    amount: number;
}

export interface Payment {
    id: string;
    amount: number;
    date: string;
    mode: string;
}

export interface Settings {
    businessName: string;
    phone: string;
    address: string;
    instagram: string;
    prePleatRate: number;
    drapeRate: number;
    bothRate: number;
    customChargeHeads: string[];
    functionTypes: string[];
    pleatTypes: string[];
    makeupArtists: { id: string; name: string; phone: string }[];
}

export interface Order {
    id: string;
    customerName: string;
    phone: string;
    address: string;
    serviceType: 'pre-pleat' | 'drape' | 'both';

    // New Fields for Enhanced Order Flow
    functionType?: string;
    functionSubType?: string; // e.g. Self, Relative
    pleatType?: string;
    measurementMethod?: 'known' | 'unknown';
    measurements?: {
        palluHeight?: number;
        innerRotation?: number;
        bodyRotation?: number;
        bodyType?: 'S' | 'M' | 'L' | 'XL';
        height?: 'small' | 'normal' | 'tall';
    };

    location: 'shop' | 'onsite';
    gps?: { lat: number; lng: number };
    sareeCount: number;
    sareeReceivedInAdvance: boolean;
    sareeReceivedDate: string;
    eventDate: string;
    deliveryDate: string;
    collectionDate: string;
    baseAmount: number;
    additionalCharges: AdditionalCharge[];
    totalAmount: number;
    payments: Payment[];
    amountPaid: number;
    status: 'pending' | 'received' | 'in-progress' | 'completed' | 'delivered';
    notes: string;
    referralSource?: 'instagram' | 'customer' | 'makeup_artist' | 'other';
    referredByCustomerId?: string;
    makeupArtistDetails?: {
        name: string;
        phone: string;
    };
    createdAt: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    permanentAddress: string;
    createdAt: string;
    referralSource?: 'instagram' | 'customer' | 'makeup_artist' | 'other';
    referredByCustomerId?: string; // ID of the customer who referred
    makeupArtistDetails?: {
        name: string;
        phone: string;
        instagram?: string;
    };
}
