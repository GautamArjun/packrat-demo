import { useState, useCallback, useEffect } from 'react';
import { Message, OfferData, ConfirmationData, FacilityData } from '@/types/chat';

export type ChatState = 
  | 'GREETING'
  | 'ASK_ZIP'
  | 'CHECKING_AVAILABILITY'
  | 'ASK_DATE'
  | 'ASK_SIZE_METHOD'
  | 'ASK_INVENTORY'
  | 'ASK_SIZE'
  | 'OFFER_PRESENTED'
  | 'ASK_ADDONS'
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

// Realistic facility data based on ZIP code prefixes (first 3 digits)
// Based on actual 1-800-PACK-RAT service areas
interface Facility extends FacilityData {}

const FACILITIES_BY_ZIP_PREFIX: Record<string, Facility> = {
  // North Carolina (Raleigh-Durham area)
  '275': { name: 'Raleigh-Durham Service Center', city: 'Raleigh', state: 'NC', phone: '(919) 555-7228' },
  '276': { name: 'Raleigh-Durham Service Center', city: 'Raleigh', state: 'NC', phone: '(919) 555-7228' },
  '277': { name: 'Raleigh-Durham Service Center', city: 'Raleigh', state: 'NC', phone: '(919) 555-7228' },
  '278': { name: 'Charlotte Distribution Hub', city: 'Charlotte', state: 'NC', phone: '(704) 555-7228' },
  '279': { name: 'Charlotte Distribution Hub', city: 'Charlotte', state: 'NC', phone: '(704) 555-7228' },
  '280': { name: 'Charlotte Distribution Hub', city: 'Charlotte', state: 'NC', phone: '(704) 555-7228' },
  '281': { name: 'Charlotte Distribution Hub', city: 'Charlotte', state: 'NC', phone: '(704) 555-7228' },
  
  // Georgia
  '300': { name: 'Atlanta Metro Center', city: 'Atlanta', state: 'GA', phone: '(404) 555-7228' },
  '303': { name: 'Atlanta Metro Center', city: 'Atlanta', state: 'GA', phone: '(404) 555-7228' },
  '305': { name: 'Atlanta Metro Center', city: 'Atlanta', state: 'GA', phone: '(404) 555-7228' },
  
  // Florida
  '320': { name: 'Jacksonville Service Center', city: 'Jacksonville', state: 'FL', phone: '(904) 555-7228' },
  '321': { name: 'Orlando Distribution Hub', city: 'Orlando', state: 'FL', phone: '(407) 555-7228' },
  '327': { name: 'Orlando Distribution Hub', city: 'Orlando', state: 'FL', phone: '(407) 555-7228' },
  '331': { name: 'Miami-Dade Service Center', city: 'Miami', state: 'FL', phone: '(305) 555-7228' },
  '332': { name: 'Miami-Dade Service Center', city: 'Miami', state: 'FL', phone: '(305) 555-7228' },
  '333': { name: 'Miami-Dade Service Center', city: 'Miami', state: 'FL', phone: '(305) 555-7228' },
  '336': { name: 'Tampa Bay Distribution Hub', city: 'Tampa', state: 'FL', phone: '(813) 555-7228' },
  
  // Texas
  '750': { name: 'Dallas-Fort Worth Hub', city: 'Dallas', state: 'TX', phone: '(214) 555-7228' },
  '751': { name: 'Dallas-Fort Worth Hub', city: 'Dallas', state: 'TX', phone: '(214) 555-7228' },
  '752': { name: 'Dallas-Fort Worth Hub', city: 'Dallas', state: 'TX', phone: '(214) 555-7228' },
  '770': { name: 'Houston Metro Center', city: 'Houston', state: 'TX', phone: '(713) 555-7228' },
  '773': { name: 'Houston Metro Center', city: 'Houston', state: 'TX', phone: '(713) 555-7228' },
  '782': { name: 'San Antonio Service Center', city: 'San Antonio', state: 'TX', phone: '(210) 555-7228' },
  '787': { name: 'Austin Distribution Hub', city: 'Austin', state: 'TX', phone: '(512) 555-7228' },
  
  // California
  '900': { name: 'Los Angeles Metro Hub', city: 'Los Angeles', state: 'CA', phone: '(213) 555-7228' },
  '902': { name: 'Los Angeles Metro Hub', city: 'Los Angeles', state: 'CA', phone: '(213) 555-7228' },
  '906': { name: 'Los Angeles Metro Hub', city: 'Los Angeles', state: 'CA', phone: '(213) 555-7228' },
  '921': { name: 'San Diego Service Center', city: 'San Diego', state: 'CA', phone: '(619) 555-7228' },
  '941': { name: 'San Francisco Bay Hub', city: 'San Francisco', state: 'CA', phone: '(415) 555-7228' },
  '945': { name: 'San Francisco Bay Hub', city: 'Oakland', state: 'CA', phone: '(510) 555-7228' },
  '951': { name: 'Inland Empire Center', city: 'Riverside', state: 'CA', phone: '(951) 555-7228' },
  
  // New York/New Jersey
  '100': { name: 'New York Metro Hub', city: 'New York', state: 'NY', phone: '(212) 555-7228' },
  '101': { name: 'New York Metro Hub', city: 'New York', state: 'NY', phone: '(212) 555-7228' },
  '070': { name: 'Northern New Jersey Center', city: 'Newark', state: 'NJ', phone: '(973) 555-7228' },
  '071': { name: 'Northern New Jersey Center', city: 'Newark', state: 'NJ', phone: '(973) 555-7228' },
  
  // Pennsylvania
  '190': { name: 'Philadelphia Service Center', city: 'Philadelphia', state: 'PA', phone: '(215) 555-7228' },
  '191': { name: 'Philadelphia Service Center', city: 'Philadelphia', state: 'PA', phone: '(215) 555-7228' },
  '152': { name: 'Pittsburgh Distribution Hub', city: 'Pittsburgh', state: 'PA', phone: '(412) 555-7228' },
  
  // Massachusetts
  '021': { name: 'Boston Metro Center', city: 'Boston', state: 'MA', phone: '(617) 555-7228' },
  '022': { name: 'Boston Metro Center', city: 'Boston', state: 'MA', phone: '(617) 555-7228' },
  
  // Illinois
  '606': { name: 'Chicago Metro Hub', city: 'Chicago', state: 'IL', phone: '(312) 555-7228' },
  '607': { name: 'Chicago Metro Hub', city: 'Chicago', state: 'IL', phone: '(312) 555-7228' },
  '600': { name: 'Chicago Metro Hub', city: 'Chicago', state: 'IL', phone: '(312) 555-7228' },
  
  // Virginia/DC
  '220': { name: 'Northern Virginia Center', city: 'Alexandria', state: 'VA', phone: '(703) 555-7228' },
  '221': { name: 'Northern Virginia Center', city: 'Alexandria', state: 'VA', phone: '(703) 555-7228' },
  '200': { name: 'Washington DC Hub', city: 'Washington', state: 'DC', phone: '(202) 555-7228' },
  
  // Colorado
  '802': { name: 'Denver Metro Center', city: 'Denver', state: 'CO', phone: '(303) 555-7228' },
  '803': { name: 'Denver Metro Center', city: 'Denver', state: 'CO', phone: '(303) 555-7228' },
  
  // Arizona
  '850': { name: 'Phoenix Service Center', city: 'Phoenix', state: 'AZ', phone: '(602) 555-7228' },
  '852': { name: 'Phoenix Service Center', city: 'Phoenix', state: 'AZ', phone: '(602) 555-7228' },
  
  // Washington
  '980': { name: 'Seattle Metro Hub', city: 'Seattle', state: 'WA', phone: '(206) 555-7228' },
  '981': { name: 'Seattle Metro Hub', city: 'Seattle', state: 'WA', phone: '(206) 555-7228' },
  
  // Michigan
  '481': { name: 'Detroit Service Center', city: 'Detroit', state: 'MI', phone: '(313) 555-7228' },
  '482': { name: 'Detroit Service Center', city: 'Detroit', state: 'MI', phone: '(313) 555-7228' },
};

// Fallback facilities by region (first digit of ZIP)
const REGIONAL_FACILITIES: Record<string, Facility> = {
  '0': { name: 'Northeast Regional Hub', city: 'Newark', state: 'NJ', phone: '(973) 555-7228' },
  '1': { name: 'Northeast Regional Hub', city: 'Newark', state: 'NJ', phone: '(973) 555-7228' },
  '2': { name: 'Southeast Regional Hub', city: 'Charlotte', state: 'NC', phone: '(704) 555-7228' },
  '3': { name: 'Southeast Regional Hub', city: 'Atlanta', state: 'GA', phone: '(404) 555-7228' },
  '4': { name: 'Great Lakes Regional Hub', city: 'Detroit', state: 'MI', phone: '(313) 555-7228' },
  '5': { name: 'Central Regional Hub', city: 'Dallas', state: 'TX', phone: '(214) 555-7228' },
  '6': { name: 'Midwest Regional Hub', city: 'Chicago', state: 'IL', phone: '(312) 555-7228' },
  '7': { name: 'South Central Regional Hub', city: 'Houston', state: 'TX', phone: '(713) 555-7228' },
  '8': { name: 'Mountain West Regional Hub', city: 'Denver', state: 'CO', phone: '(303) 555-7228' },
  '9': { name: 'Pacific Regional Hub', city: 'Los Angeles', state: 'CA', phone: '(213) 555-7228' },
};

function getFacilityForZip(zip: string): Facility {
  const prefix3 = zip.slice(0, 3);
  
  // First try exact 3-digit prefix match
  if (FACILITIES_BY_ZIP_PREFIX[prefix3]) {
    return FACILITIES_BY_ZIP_PREFIX[prefix3];
  }
  
  // Fall back to regional facility based on first digit
  const firstDigit = zip.charAt(0);
  return REGIONAL_FACILITIES[firstDigit] || REGIONAL_FACILITIES['0'];
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
      description: 'first-time customer discount'
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
      description: 'seasonal savings'
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
      description: 'large move special'
    }
  }
};

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

function getContainerBySpaceUnits(units: number): ContainerOffer {
  const adjustedUnits = units * 1.2;
  if (adjustedUnits <= 15) {
    return CONTAINER_OPTIONS.small;
  } else if (adjustedUnits <= 25) {
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
        `🎉 ${discount.percentage}% OFF — Code ${discount.code} auto-applied!`,
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
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [facility, setFacility] = useState<Facility | null>(null);

  const addMessage = useCallback((
    content: string, 
    role: 'user' | 'assistant', 
    type: 'text' | 'offer' | 'confirmation' | 'inventory' | 'addons' | 'facility' = 'text', 
    offerData?: OfferData,
    confirmationData?: ConfirmationData,
    facilityData?: FacilityData
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      type,
      offerData,
      confirmationData,
      facilityData,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const simulateBotResponse = useCallback(async (
    response: string, 
    nextState: ChatState, 
    delay = 1000, 
    offer?: OfferData,
    confirmation?: ConfirmationData,
    msgType?: 'text' | 'offer' | 'confirmation' | 'inventory' | 'addons' | 'facility',
    facilityData?: FacilityData
  ) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    const type = msgType || (offer ? 'offer' : confirmation ? 'confirmation' : 'text');
    addMessage(response, 'assistant', type, offer, confirmation, facilityData);
    setChatState(nextState);
    setIsTyping(false);
  }, [addMessage]);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      simulateBotResponse(
        "Hi there! 👋 Welcome to 1-800-PACK-RAT. I'm here to help make your move as smooth and stress-free as possible. Whether you're moving across town or across the country, I've got you covered!\n\nLet's get started — just enter your move details below and I'll find the best options for you:", 
        'ASK_ZIP', 
        500
      );
    }
  }, [messages.length, simulateBotResponse]);

  const presentOffer = useCallback(async (sizeDescription: string, containerOffer: ContainerOffer) => {
    let finalOffer = containerOffer.base;
    let discountMessage = '';
    
    if (containerOffer.discount) {
      finalOffer = applyDiscount(containerOffer.base, containerOffer.discount);
      discountMessage = `\n\n🎁 **Great news!** I checked your eligibility and you qualify for our **${containerOffer.discount.description}**! I've already applied the code **${containerOffer.discount.code}** to save you ${containerOffer.discount.percentage}% — no need to do anything extra.`;
    }
    
    setSelectedOffer(finalOffer);
    
    const baseMessage = `Based on your ${sizeDescription} move, I think this option would be perfect for you:${discountMessage}`;
    
    await simulateBotResponse(
      baseMessage,
      'OFFER_PRESENTED',
      1500,
      finalOffer
    );
  }, [simulateBotResponse]);

  const handleSendMessage = useCallback(async (content: string) => {
    addMessage(content, 'user');

    switch (chatState) {
      case 'ASK_DATE':
        setUserData(prev => ({ ...prev, date: content }));
        await simulateBotResponse(
          `${content} — great choice! 📅 That gives us plenty of time to make sure everything is ready for you.

Now, to recommend the perfect container size, I have two options:

• **Inventory Estimator** — takes about a minute and gives you the most accurate recommendation

• **Quick estimate** — just tell me roughly how many rooms you're moving

What would you prefer?`,
          'ASK_SIZE_METHOD',
          800,
          undefined,
          undefined,
          'inventory'
        );
        break;

      case 'ASK_SIZE_METHOD':
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('inventory') || lowerContent.includes('estimator') || lowerContent.includes('precise') || lowerContent.includes('exact')) {
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 800));
          addMessage("Absolutely! I love when customers use this — it really helps ensure you get exactly the right size. Take your time going through each room. If you're not sure about something, it's always better to include it! 😊", 'assistant');
          setChatState('ASK_INVENTORY');
          setIsTyping(false);
        } else {
          await simulateBotResponse(
            "No problem at all! Just give me a rough idea — how many rooms worth of stuff are you moving? For example: studio, 1-2 rooms, 3-4 rooms, or more?",
            'ASK_SIZE'
          );
        }
        break;

      case 'ASK_SIZE':
        setUserData(prev => ({ ...prev, size: content }));
        const containerOffer = getContainerForRoomCount(content);
        await presentOffer(content, containerOffer);
        break;

      case 'OFFER_PRESENTED':
        await simulateBotResponse(
          "I totally understand wanting to know more! This container size was specifically chosen based on what you told me about your move. It gives you enough room to pack comfortably without paying for space you won't use.\n\nThe best part? If you find you need more space, we can always adjust. Would you like to go ahead with this option, or do you have any other questions? I'm happy to help!",
          'OFFER_PRESENTED'
        );
        break;

      case 'ASK_ADDONS':
        await simulateBotResponse(
          "Take your time looking through the options above! These are some of our most popular add-ons that customers find really helpful. No pressure though — just pick what makes sense for your move, or skip if you're all set. 😊",
          'ASK_ADDONS'
        );
        break;
        
      case 'CONFIRMATION':
        const confirmContent = content.toLowerCase();
        if (confirmContent.includes('yes') || confirmContent.includes('proceed') || confirmContent.includes('checkout') || confirmContent.includes('ok') || confirmContent.includes('sure')) {
          await simulateBotResponse(
            "Wonderful! 🎉 You're almost there! Just need a few details to finalize your reservation. Don't worry — your information is secure and we'll only use it to coordinate your move and send you important updates.",
            'COLLECT_CONTACT'
          );
        } else {
          await simulateBotResponse(
            "Of course! I want you to feel 100% confident about your choice. What questions can I answer for you? I'm here to help with anything — pricing, container features, scheduling flexibility, you name it!",
            'CONFIRMATION'
          );
        }
        break;

      case 'COLLECT_CONTACT':
        await simulateBotResponse(
          "Just fill out the form above whenever you're ready! I'll wait right here. 😊",
          'COLLECT_CONTACT'
        );
        break;

      case 'COMPLETED':
        await simulateBotResponse(
          "Of course! I'm still here if you need anything else. Whether it's questions about your upcoming move, making changes to your reservation, or anything else — just let me know!",
          'COMPLETED'
        );
        break;

      default:
        await simulateBotResponse(
          "I'm sorry, I didn't quite catch that. Could you tell me a bit more about what you're looking for? I'm here to help!",
          chatState
        );
    }
  }, [chatState, addMessage, simulateBotResponse, presentOffer]);

  const handleZipSubmit = useCallback(async (origin: string, destination: string) => {
    addMessage(`Moving from ${origin} to ${destination}`, 'user');
    setUserData(prev => ({ ...prev, origin, destination }));
    
    // Get facility information
    const assignedFacility = getFacilityForZip(origin);
    setFacility(assignedFacility);
    
    // Check availability
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    addMessage(`Thanks! Let me check availability for your route... 🔍`, 'assistant');
    
    const dates = getAvailableDates(origin, destination);
    setAvailableDates(dates);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsTyping(false);
    
    // Show facility card
    addMessage(
      `Wonderful news! ✅ I found availability for your move. Your booking will be handled by our local team who knows your area well:`,
      'assistant',
      'facility',
      undefined,
      undefined,
      assignedFacility
    );
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await simulateBotResponse(
      "Now let's pick a date! I found several available slots for container delivery. Go ahead and select the one that works best for your schedule:",
      'ASK_DATE',
      500
    );
  }, [addMessage, simulateBotResponse]);

  const handleSelectOffer = useCallback(async (offerId: string) => {
    const offerTitle = selectedOffer?.title || 'container';
    addMessage(`I'd like to select the ${offerTitle}`, 'user');
    
    await simulateBotResponse(
      `Excellent choice! The ${offerTitle} is perfect for your move. 🎉\n\nBefore we wrap up, I wanted to show you a few popular add-ons that other customers moving similar distances have found really helpful. No obligation — just want to make sure you have everything you need!`,
      'ASK_ADDONS',
      1000,
      undefined,
      undefined,
      'addons'
    );
  }, [addMessage, simulateBotResponse, selectedOffer]);

  const handleInventoryComplete = useCallback(async (recommendation: string, totalUnits: number) => {
    addMessage(`Inventory complete: ${recommendation} worth of items`, 'user');
    setUserData(prev => ({ ...prev, size: recommendation, inventoryUnits: totalUnits.toString() }));
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    addMessage("Thanks for taking the time to go through that! Based on your inventory, I can now give you a really accurate recommendation. 👍", 'assistant');
    setIsTyping(false);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const containerOffer = getContainerBySpaceUnits(totalUnits);
    await presentOffer(recommendation, containerOffer);
  }, [addMessage, presentOffer]);

  const handleAddOnsComplete = useCallback(async (addOns: string[]) => {
    setSelectedAddOns(addOns);
    
    if (addOns.length > 0) {
      addMessage(`Selected ${addOns.length} add-on${addOns.length > 1 ? 's' : ''}`, 'user');
      await simulateBotResponse(
        `Great picks! Those will definitely come in handy. 👍\n\nAlright, here's where we're at: Your **${selectedOffer?.title}** is reserved for **${userData.date || 'your selected date'}**, and I've noted your add-ons. Your discount has been pre-applied to give you the best price.\n\nReady to lock this in? Just say the word and we'll get you set up!`,
        'CONFIRMATION'
      );
    } else {
      addMessage("No add-ons needed", 'user');
      await simulateBotResponse(
        `No problem! Sometimes you just need the container and that's totally fine. 😊\n\nSo here's the summary: Your **${selectedOffer?.title}** is ready to go for **${userData.date || 'your selected date'}**, with your discount already applied.\n\nShall we finalize your reservation?`,
        'CONFIRMATION'
      );
    }
  }, [addMessage, simulateBotResponse, selectedOffer, userData.date]);

  const handleContactSubmit = useCallback(async (contactData: { name: string; email: string; phone: string }) => {
    setUserData(prev => ({ 
      ...prev, 
      name: contactData.name,
      email: contactData.email, 
      phone: contactData.phone 
    }));
    
    addMessage(`${contactData.name}, ${contactData.email}`, 'user');
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const confirmationData: ConfirmationData = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      containerType: selectedOffer?.title || 'Container',
      deliveryDate: userData.date || 'TBD',
      originZip: userData.origin || '',
      destinationZip: userData.destination || '',
      addOns: selectedAddOns
    };
    
    addMessage(
      `You're all set, ${contactData.name}! 🎉`,
      'assistant',
      'confirmation',
      undefined,
      confirmationData
    );
    setChatState('COMPLETED');
    setIsTyping(false);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    await simulateBotResponse(
      `It was my pleasure helping you today, ${contactData.name}! Our team at the ${facility?.name || 'local facility'} in ${facility?.city || 'your area'} will reach out if they need anything.\n\nIf you have any questions before your move date, don't hesitate to reach out — we're always here to help. Good luck with your move! 🏠✨`,
      'COMPLETED',
      500
    );
  }, [addMessage, simulateBotResponse, selectedOffer, userData, selectedAddOns, facility]);

  return {
    messages,
    isTyping,
    chatState,
    availableDates,
    selectedOffer,
    sendMessage: handleSendMessage,
    selectOffer: handleSelectOffer,
    submitContact: handleContactSubmit,
    submitZip: handleZipSubmit,
    completeInventory: handleInventoryComplete,
    completeAddOns: handleAddOnsComplete
  };
};
