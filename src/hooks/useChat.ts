import { useState, useCallback, useEffect } from 'react';
import { Message, OfferData, ConfirmationData } from '@/types/chat';

export type ChatState = 
  | 'GREETING'
  | 'ASK_ORIGIN'
  | 'ASK_DESTINATION'
  | 'CHECKING_AVAILABILITY'
  | 'ASK_DATE'
  | 'ASK_SIZE'
  | 'OFFER_PRESENTED'
  | 'CONFIRMATION'
  | 'COLLECT_CONTACT'
  | 'COMPLETED';

interface ContainerOffer {
  base: OfferData;
  discount?: {
    code: string;
    percentage: number;
    description: string;
  };
}

const CONTAINER_OPTIONS: Record<string, ContainerOffer> = {
  small: {
    base: {
      id: 'offer-8ft',
      title: '8-Foot Container',
      price: '$1,650',
      description: 'Perfect for studio apartments or 1-2 rooms. Compact yet spacious.',
      features: [
        'No-contact delivery & pickup',
        'Keep it as long as you need',
        '$5,000 content protection included',
        '15 free moving blankets'
      ],
      recommended: true
    },
    discount: {
      code: 'FIRSTMOVE15',
      percentage: 15,
      description: 'First-time customer discount'
    }
  },
  medium: {
    base: {
      id: 'offer-12ft',
      title: '12-Foot Container',
      price: '$1,950',
      description: 'Ideal for 2-3 rooms. Our most versatile option.',
      features: [
        'No-contact delivery & pickup',
        'Keep it as long as you need',
        '$7,500 content protection included',
        '20 free moving blankets'
      ],
      recommended: true
    },
    discount: {
      code: 'SAVE10NOW',
      percentage: 10,
      description: 'Limited time seasonal offer'
    }
  },
  large: {
    base: {
      id: 'offer-16ft',
      title: '16-Foot Container',
      price: '$2,450',
      description: 'Perfect for 3-4 rooms. Weather-proof, steel construction with barn-style doors.',
      features: [
        'No-contact delivery & pickup',
        'Keep it as long as you need',
        '$10,000 content protection included',
        '30 free moving blankets'
      ],
      recommended: true
    },
    discount: {
      code: 'BIGMOVE20',
      percentage: 20,
      description: 'Large move special discount'
    }
  }
};

// Simulated availability check - returns available dates based on ZIP codes
export function getAvailableDates(originZip: string, destZip: string): Date[] {
  const availableDates: Date[] = [];
  const today = new Date();
  
  for (let i = 3; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (i < 14) {
      if (!isWeekend) {
        availableDates.push(date);
      }
    } else {
      const hash = (i * 7 + parseInt(originZip.slice(0, 2) || '10')) % 10;
      if (hash > 1) {
        availableDates.push(date);
      }
    }
  }
  
  return availableDates;
}

function getContainerForRoomCount(input: string): ContainerOffer {
  const normalized = input.toLowerCase();
  
  const numbers = normalized.match(/\d+/g);
  let roomCount = 0;
  
  if (numbers && numbers.length > 0) {
    roomCount = Math.max(...numbers.map(n => parseInt(n)));
  } else if (normalized.includes('studio')) {
    roomCount = 1;
  } else if (normalized.includes('one') || normalized.includes('single')) {
    roomCount = 1;
  } else if (normalized.includes('two') || normalized.includes('couple')) {
    roomCount = 2;
  } else if (normalized.includes('three')) {
    roomCount = 3;
  } else if (normalized.includes('four')) {
    roomCount = 4;
  }

  if (roomCount <= 1) {
    return CONTAINER_OPTIONS.small;
  } else if (roomCount <= 2) {
    return CONTAINER_OPTIONS.medium;
  } else {
    return CONTAINER_OPTIONS.large;
  }
}

function applyDiscount(offer: OfferData, discount: { code: string; percentage: number; description: string }): OfferData {
  const priceMatch = offer.price.match(/\$?([\d,]+)/);
  if (priceMatch) {
    const originalPrice = parseInt(priceMatch[1].replace(',', ''));
    const discountedPrice = Math.round(originalPrice * (1 - discount.percentage / 100));
    
    return {
      ...offer,
      price: `$${discountedPrice.toLocaleString()}`,
      description: `${offer.description}`,
      features: [
        `🎉 ${discount.percentage}% OFF with code ${discount.code}`,
        `Was $${originalPrice.toLocaleString()} → Now $${discountedPrice.toLocaleString()}`,
        ...offer.features
      ]
    };
  }
  return offer;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('GREETING');
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [selectedOffer, setSelectedOffer] = useState<OfferData | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  const addMessage = useCallback((
    content: string, 
    role: 'user' | 'assistant', 
    type: 'text' | 'offer' | 'confirmation' = 'text', 
    offerData?: OfferData,
    confirmationData?: ConfirmationData
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      type,
      offerData,
      confirmationData,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const simulateBotResponse = useCallback(async (
    response: string, 
    nextState: ChatState, 
    delay = 1000, 
    offer?: OfferData,
    confirmation?: ConfirmationData
  ) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    const msgType = offer ? 'offer' : confirmation ? 'confirmation' : 'text';
    addMessage(response, 'assistant', msgType, offer, confirmation);
    setChatState(nextState);
    setIsTyping(false);
  }, [addMessage]);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      simulateBotResponse(
        "Hi! I'm your PACKRAT booking assistant. I can help you get a quote and book your move in minutes. To start, what is the ZIP code you're moving FROM?", 
        'ASK_ORIGIN', 
        500
      );
    }
  }, [messages.length, simulateBotResponse]);

  const handleSendMessage = useCallback(async (content: string) => {
    addMessage(content, 'user');

    switch (chatState) {
      case 'ASK_ORIGIN':
        setUserData(prev => ({ ...prev, origin: content }));
        await simulateBotResponse(
          "Thanks! And what is the ZIP code you're moving TO?",
          'ASK_DESTINATION'
        );
        break;

      case 'ASK_DESTINATION':
        setUserData(prev => {
          const newData = { ...prev, destination: content };
          
          const dates = getAvailableDates(prev.origin || '', content);
          setAvailableDates(dates);
          
          return newData;
        });
        
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        addMessage("Checking availability for your route...", 'assistant');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await simulateBotResponse(
          "Great news! We have containers available for your move. Please select your preferred delivery date from the available options:",
          'ASK_DATE',
          500
        );
        break;

      case 'ASK_DATE':
        setUserData(prev => ({ ...prev, date: content }));
        await simulateBotResponse(
          "Perfect! Roughly how many rooms are you moving? (e.g., 1-2 rooms, 3-4 rooms)",
          'ASK_SIZE'
        );
        break;

      case 'ASK_SIZE':
        setUserData(prev => ({ ...prev, size: content }));
        
        const containerOffer = getContainerForRoomCount(content);
        
        let finalOffer = containerOffer.base;
        if (containerOffer.discount) {
          finalOffer = applyDiscount(containerOffer.base, containerOffer.discount);
        }
        
        setSelectedOffer(finalOffer);
        
        const discountMessage = containerOffer.discount 
          ? `Great news! You qualify for our ${containerOffer.discount.description} — ${containerOffer.discount.percentage}% off with code **${containerOffer.discount.code}**! Here's the perfect option for your ${content} move:`
          : `I've found the perfect option for your ${content} move:`;
        
        await simulateBotResponse(
          discountMessage,
          'OFFER_PRESENTED',
          1500,
          finalOffer
        );
        break;

      case 'OFFER_PRESENTED':
        await simulateBotResponse(
          "That's a great question! This container size is specifically chosen based on your room count to ensure you have enough space without overpaying. The discount has already been applied to your quote. Would you like to proceed with this option, or do you have other questions?",
          'OFFER_PRESENTED'
        );
        break;
        
      case 'CONFIRMATION':
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('yes') || lowerContent.includes('proceed') || lowerContent.includes('checkout') || lowerContent.includes('ok') || lowerContent.includes('sure')) {
          await simulateBotResponse(
            "Perfect! Please fill out your contact information below to complete your reservation:",
            'COLLECT_CONTACT'
          );
        } else {
          await simulateBotResponse(
            "No problem! Is there anything else you'd like to know about the offer, or would you like to make any changes?",
            'CONFIRMATION'
          );
        }
        break;

      case 'COLLECT_CONTACT':
        await simulateBotResponse(
          "Please use the form above to enter your contact details.",
          'COLLECT_CONTACT'
        );
        break;

      case 'COMPLETED':
        await simulateBotResponse(
          "Is there anything else I can help you with today?",
          'COMPLETED'
        );
        break;

      default:
        await simulateBotResponse(
          "I'm sorry, I didn't quite catch that. Could you please clarify?",
          chatState
        );
    }
  }, [chatState, addMessage, simulateBotResponse]);

  const handleSelectOffer = useCallback(async (offerId: string) => {
    const offerTitle = selectedOffer?.title || 'container';
    addMessage(`I'd like to select the ${offerTitle}`, 'user');
    await simulateBotResponse(
      `Excellent choice! The ${offerTitle} has been reserved for your move on ${userData.date || 'your requested date'}. Your promotional discount will be applied automatically. Shall we proceed to checkout?`,
      'CONFIRMATION'
    );
  }, [addMessage, simulateBotResponse, userData.date, selectedOffer]);

  const handleContactSubmit = useCallback(async (contactData: { name: string; email: string; phone: string }) => {
    setUserData(prev => ({ 
      ...prev, 
      name: contactData.name,
      email: contactData.email, 
      phone: contactData.phone 
    }));
    
    addMessage(`Contact info submitted: ${contactData.name}, ${contactData.email}, ${contactData.phone}`, 'user');
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const confirmationData: ConfirmationData = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      containerType: selectedOffer?.title || 'Container',
      deliveryDate: userData.date || 'TBD',
      originZip: userData.origin || '',
      destinationZip: userData.destination || ''
    };
    
    addMessage(
      `Thank you, ${contactData.name}! Your reservation is confirmed!`,
      'assistant',
      'confirmation',
      undefined,
      confirmationData
    );
    setChatState('COMPLETED');
    setIsTyping(false);
    
    // Follow-up message
    await new Promise(resolve => setTimeout(resolve, 1000));
    await simulateBotResponse(
      "Is there anything else I can help you with today?",
      'COMPLETED',
      500
    );
  }, [addMessage, simulateBotResponse, selectedOffer, userData]);

  return {
    messages,
    isTyping,
    chatState,
    availableDates,
    sendMessage: handleSendMessage,
    selectOffer: handleSelectOffer,
    submitContact: handleContactSubmit
  };
};
