export interface OfferData {
  id: string;
  title: string;
  price: string;
  deliveryPrice: string;
  monthlyPrice: string;
  originalDeliveryPrice?: string;
  originalMonthlyPrice?: string;
  discount?: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface ConfirmationData {
  name: string;
  email: string;
  phone: string;
  containerType: string;
  deliveryDate: string;
  originZip: string;
  destinationZip: string;
  addOns?: string[];
}

export interface FacilityData {
  name: string;
  city: string;
  state: string;
  phone: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'offer' | 'confirmation' | 'inventory' | 'addons' | 'facility' | 'greeting' | 'datePrompt';
  offerData?: OfferData;
  confirmationData?: ConfirmationData;
  facilityData?: FacilityData;
  timestamp: Date;
}
