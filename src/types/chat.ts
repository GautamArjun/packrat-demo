export interface OfferData {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
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

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'offer' | 'confirmation' | 'inventory' | 'addons';
  offerData?: OfferData;
  confirmationData?: ConfirmationData;
  timestamp: Date;
}
