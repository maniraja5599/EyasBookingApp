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

export interface Order {
    id: string;
    customerName: string;
    phone: string;
    address: string;
    serviceType: 'pre-pleat' | 'drape' | 'both';
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
    createdAt: string;
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
