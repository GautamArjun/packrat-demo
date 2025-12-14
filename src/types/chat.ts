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

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'offer';
  offerData?: OfferData;
  timestamp: Date;
}
