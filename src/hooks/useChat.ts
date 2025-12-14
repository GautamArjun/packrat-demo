import { useState, useCallback, useEffect } from 'react';
import { Message, OfferData } from '@/types/chat';

export type ChatState = 
  | 'GREETING'
  | 'ASK_DATE'
  | 'ASK_ORIGIN'
  | 'ASK_DESTINATION'
  | 'ASK_SIZE'
  | 'OFFER_PRESENTED'
  | 'CONFIRMATION'
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

function getContainerForRoomCount(input: string): ContainerOffer {
  const normalized = input.toLowerCase();
  
  // Extract numbers from the input
  const numbers = normalized.match(/\d+/g);
  let roomCount = 0;
  
  if (numbers && numbers.length > 0) {
    // If there's a range like "2-3", take the higher number
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

  // Recommend based on room count
  if (roomCount <= 1) {
    return CONTAINER_OPTIONS.small;
  } else if (roomCount <= 2) {
    return CONTAINER_OPTIONS.medium;
  } else {
    return CONTAINER_OPTIONS.large;
  }
}

function applyDiscount(offer: OfferData, discount: { code: string; percentage: number; description: string }): OfferData {
  // Parse the price and apply discount
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

  const addMessage = useCallback((content: string, role: 'user' | 'assistant', type: 'text' | 'offer' = 'text', offerData?: OfferData) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      type,
      offerData,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const simulateBotResponse = useCallback(async (response: string, nextState: ChatState, delay = 1000, offer?: OfferData) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    addMessage(response, 'assistant', offer ? 'offer' : 'text', offer);
    setChatState(nextState);
    setIsTyping(false);
  }, [addMessage]);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      simulateBotResponse(
        "Hi! I'm your PACKRAT booking assistant. I can help you get a quote and book your move in minutes. To start, when are you planning to move?", 
        'ASK_DATE', 
        500
      );
    }
  }, [messages.length, simulateBotResponse]);

  const handleSendMessage = useCallback(async (content: string) => {
    addMessage(content, 'user');

    // Simple State Machine
    switch (chatState) {
      case 'ASK_DATE':
        setUserData(prev => ({ ...prev, date: content }));
        await simulateBotResponse(
          "Got it. And what is the zip code you are moving FROM?",
          'ASK_ORIGIN'
        );
        break;
      
      case 'ASK_ORIGIN':
        setUserData(prev => ({ ...prev, origin: content }));
        await simulateBotResponse(
          "Thanks! Where are you moving TO (zip code)?",
          'ASK_DESTINATION'
        );
        break;

      case 'ASK_DESTINATION':
        setUserData(prev => ({ ...prev, destination: content }));
        await simulateBotResponse(
          "Understood. Roughly how many rooms are you moving? (e.g., 1-2 rooms, 3-4 rooms)",
          'ASK_SIZE'
        );
        break;

      case 'ASK_SIZE':
        setUserData(prev => ({ ...prev, size: content }));
        
        // Get the right container based on room count
        const containerOffer = getContainerForRoomCount(content);
        
        // Apply any available discount
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
        // Handle generic questions about the offer
        await simulateBotResponse(
          "That's a great question! This container size is specifically chosen based on your room count to ensure you have enough space without overpaying. The discount has already been applied to your quote. Would you like to proceed with this option, or do you have other questions?",
          'OFFER_PRESENTED'
        );
        break;
        
      case 'CONFIRMATION':
         await simulateBotResponse(
          "Great! I'm redirecting you to our secure checkout to finalize the details. Your discount will be automatically applied at checkout.",
          'COMPLETED'
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

  return {
    messages,
    isTyping,
    chatState,
    sendMessage: handleSendMessage,
    selectOffer: handleSelectOffer
  };
};
