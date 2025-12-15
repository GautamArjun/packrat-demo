import { useState, useCallback, useEffect } from "react";
import {
  Message,
  OfferData,
  ConfirmationData,
  FacilityData,
} from "@/types/chat";

export type ChatState =
  | "GREETING"
  | "READY_TO_START"
  | "ASK_ZIP"
  | "CHECKING_AVAILABILITY"
  | "CONFIRM_DATE_PICKER"
  | "ASK_DATE"
  | "ASK_SIZE_METHOD"
  | "ASK_INVENTORY"
  | "ASK_SIZE"
  | "CONFIRM_QUOTE"
  | "OFFER_PRESENTED"
  | "CONFIRM_ADDONS"
  | "ASK_ADDONS"
  | "CONFIRMATION"
  | "COLLECT_CONTACT"
  | "COMPLETED";

// Generate a unique Quote ID
function generateQuoteId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PR-${timestamp.slice(-4)}${random}`;
}

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
  "275": {
    name: "Raleigh-Durham Service Center",
    city: "Raleigh",
    state: "NC",
    phone: "(919) 555-7228",
  },
  "276": {
    name: "Raleigh-Durham Service Center",
    city: "Raleigh",
    state: "NC",
    phone: "(919) 555-7228",
  },
  "277": {
    name: "Raleigh-Durham Service Center",
    city: "Raleigh",
    state: "NC",
    phone: "(919) 555-7228",
  },
  "278": {
    name: "Charlotte Distribution Hub",
    city: "Charlotte",
    state: "NC",
    phone: "(704) 555-7228",
  },
  "279": {
    name: "Charlotte Distribution Hub",
    city: "Charlotte",
    state: "NC",
    phone: "(704) 555-7228",
  },
  "280": {
    name: "Charlotte Distribution Hub",
    city: "Charlotte",
    state: "NC",
    phone: "(704) 555-7228",
  },
  "281": {
    name: "Charlotte Distribution Hub",
    city: "Charlotte",
    state: "NC",
    phone: "(704) 555-7228",
  },

  // Georgia
  "300": {
    name: "Atlanta Metro Center",
    city: "Atlanta",
    state: "GA",
    phone: "(404) 555-7228",
  },
  "303": {
    name: "Atlanta Metro Center",
    city: "Atlanta",
    state: "GA",
    phone: "(404) 555-7228",
  },
  "305": {
    name: "Atlanta Metro Center",
    city: "Atlanta",
    state: "GA",
    phone: "(404) 555-7228",
  },

  // Florida
  "320": {
    name: "Jacksonville Service Center",
    city: "Jacksonville",
    state: "FL",
    phone: "(904) 555-7228",
  },
  "321": {
    name: "Orlando Distribution Hub",
    city: "Orlando",
    state: "FL",
    phone: "(407) 555-7228",
  },
  "327": {
    name: "Orlando Distribution Hub",
    city: "Orlando",
    state: "FL",
    phone: "(407) 555-7228",
  },
  "331": {
    name: "Miami-Dade Service Center",
    city: "Miami",
    state: "FL",
    phone: "(305) 555-7228",
  },
  "332": {
    name: "Miami-Dade Service Center",
    city: "Miami",
    state: "FL",
    phone: "(305) 555-7228",
  },
  "333": {
    name: "Miami-Dade Service Center",
    city: "Miami",
    state: "FL",
    phone: "(305) 555-7228",
  },
  "336": {
    name: "Tampa Bay Distribution Hub",
    city: "Tampa",
    state: "FL",
    phone: "(813) 555-7228",
  },

  // Texas
  "750": {
    name: "Dallas-Fort Worth Hub",
    city: "Dallas",
    state: "TX",
    phone: "(214) 555-7228",
  },
  "751": {
    name: "Dallas-Fort Worth Hub",
    city: "Dallas",
    state: "TX",
    phone: "(214) 555-7228",
  },
  "752": {
    name: "Dallas-Fort Worth Hub",
    city: "Dallas",
    state: "TX",
    phone: "(214) 555-7228",
  },
  "770": {
    name: "Houston Metro Center",
    city: "Houston",
    state: "TX",
    phone: "(713) 555-7228",
  },
  "773": {
    name: "Houston Metro Center",
    city: "Houston",
    state: "TX",
    phone: "(713) 555-7228",
  },
  "782": {
    name: "San Antonio Service Center",
    city: "San Antonio",
    state: "TX",
    phone: "(210) 555-7228",
  },
  "787": {
    name: "Austin Distribution Hub",
    city: "Austin",
    state: "TX",
    phone: "(512) 555-7228",
  },

  // California
  "900": {
    name: "Los Angeles Metro Hub",
    city: "Los Angeles",
    state: "CA",
    phone: "(213) 555-7228",
  },
  "902": {
    name: "Los Angeles Metro Hub",
    city: "Los Angeles",
    state: "CA",
    phone: "(213) 555-7228",
  },
  "906": {
    name: "Los Angeles Metro Hub",
    city: "Los Angeles",
    state: "CA",
    phone: "(213) 555-7228",
  },
  "921": {
    name: "San Diego Service Center",
    city: "San Diego",
    state: "CA",
    phone: "(619) 555-7228",
  },
  "941": {
    name: "San Francisco Bay Hub",
    city: "San Francisco",
    state: "CA",
    phone: "(415) 555-7228",
  },
  "945": {
    name: "San Francisco Bay Hub",
    city: "Oakland",
    state: "CA",
    phone: "(510) 555-7228",
  },
  "951": {
    name: "Inland Empire Center",
    city: "Riverside",
    state: "CA",
    phone: "(951) 555-7228",
  },

  // New York/New Jersey
  "100": {
    name: "New York Metro Hub",
    city: "New York",
    state: "NY",
    phone: "(212) 555-7228",
  },
  "101": {
    name: "New York Metro Hub",
    city: "New York",
    state: "NY",
    phone: "(212) 555-7228",
  },
  "070": {
    name: "Northern New Jersey Center",
    city: "Newark",
    state: "NJ",
    phone: "(973) 555-7228",
  },
  "071": {
    name: "Northern New Jersey Center",
    city: "Newark",
    state: "NJ",
    phone: "(973) 555-7228",
  },

  // Pennsylvania
  "190": {
    name: "Philadelphia Service Center",
    city: "Philadelphia",
    state: "PA",
    phone: "(215) 555-7228",
  },
  "191": {
    name: "Philadelphia Service Center",
    city: "Philadelphia",
    state: "PA",
    phone: "(215) 555-7228",
  },
  "152": {
    name: "Pittsburgh Distribution Hub",
    city: "Pittsburgh",
    state: "PA",
    phone: "(412) 555-7228",
  },

  // Massachusetts
  "021": {
    name: "Boston Metro Center",
    city: "Boston",
    state: "MA",
    phone: "(617) 555-7228",
  },
  "022": {
    name: "Boston Metro Center",
    city: "Boston",
    state: "MA",
    phone: "(617) 555-7228",
  },

  // Illinois
  "606": {
    name: "Chicago Metro Hub",
    city: "Chicago",
    state: "IL",
    phone: "(312) 555-7228",
  },
  "607": {
    name: "Chicago Metro Hub",
    city: "Chicago",
    state: "IL",
    phone: "(312) 555-7228",
  },
  "600": {
    name: "Chicago Metro Hub",
    city: "Chicago",
    state: "IL",
    phone: "(312) 555-7228",
  },

  // Virginia/DC
  "220": {
    name: "Northern Virginia Center",
    city: "Alexandria",
    state: "VA",
    phone: "(703) 555-7228",
  },
  "221": {
    name: "Northern Virginia Center",
    city: "Alexandria",
    state: "VA",
    phone: "(703) 555-7228",
  },
  "200": {
    name: "Washington DC Hub",
    city: "Washington",
    state: "DC",
    phone: "(202) 555-7228",
  },

  // Colorado
  "802": {
    name: "Denver Metro Center",
    city: "Denver",
    state: "CO",
    phone: "(303) 555-7228",
  },
  "803": {
    name: "Denver Metro Center",
    city: "Denver",
    state: "CO",
    phone: "(303) 555-7228",
  },

  // Arizona
  "850": {
    name: "Phoenix Service Center",
    city: "Phoenix",
    state: "AZ",
    phone: "(602) 555-7228",
  },
  "852": {
    name: "Phoenix Service Center",
    city: "Phoenix",
    state: "AZ",
    phone: "(602) 555-7228",
  },

  // Washington
  "980": {
    name: "Seattle Metro Hub",
    city: "Seattle",
    state: "WA",
    phone: "(206) 555-7228",
  },
  "981": {
    name: "Seattle Metro Hub",
    city: "Seattle",
    state: "WA",
    phone: "(206) 555-7228",
  },

  // Michigan
  "481": {
    name: "Detroit Service Center",
    city: "Detroit",
    state: "MI",
    phone: "(313) 555-7228",
  },
  "482": {
    name: "Detroit Service Center",
    city: "Detroit",
    state: "MI",
    phone: "(313) 555-7228",
  },
};

// Fallback facilities by region (first digit of ZIP)
const REGIONAL_FACILITIES: Record<string, Facility> = {
  "0": {
    name: "Northeast Regional Hub",
    city: "Newark",
    state: "NJ",
    phone: "(973) 555-7228",
  },
  "1": {
    name: "Northeast Regional Hub",
    city: "Newark",
    state: "NJ",
    phone: "(973) 555-7228",
  },
  "2": {
    name: "Southeast Regional Hub",
    city: "Charlotte",
    state: "NC",
    phone: "(704) 555-7228",
  },
  "3": {
    name: "Southeast Regional Hub",
    city: "Atlanta",
    state: "GA",
    phone: "(404) 555-7228",
  },
  "4": {
    name: "Great Lakes Regional Hub",
    city: "Detroit",
    state: "MI",
    phone: "(313) 555-7228",
  },
  "5": {
    name: "Central Regional Hub",
    city: "Dallas",
    state: "TX",
    phone: "(214) 555-7228",
  },
  "6": {
    name: "Midwest Regional Hub",
    city: "Chicago",
    state: "IL",
    phone: "(312) 555-7228",
  },
  "7": {
    name: "South Central Regional Hub",
    city: "Houston",
    state: "TX",
    phone: "(713) 555-7228",
  },
  "8": {
    name: "Mountain West Regional Hub",
    city: "Denver",
    state: "CO",
    phone: "(303) 555-7228",
  },
  "9": {
    name: "Pacific Regional Hub",
    city: "Los Angeles",
    state: "CA",
    phone: "(213) 555-7228",
  },
};

function getFacilityForZip(zip: string): Facility {
  const prefix3 = zip.slice(0, 3);

  // First try exact 3-digit prefix match
  if (FACILITIES_BY_ZIP_PREFIX[prefix3]) {
    return FACILITIES_BY_ZIP_PREFIX[prefix3];
  }

  // Fall back to regional facility based on first digit
  const firstDigit = zip.charAt(0);
  return REGIONAL_FACILITIES[firstDigit] || REGIONAL_FACILITIES["0"];
}

const CONTAINER_OPTIONS: Record<string, ContainerOffer> = {
  small: {
    base: {
      id: "offer-8ft",
      title: "8-Foot Container",
      price: "$300",
      deliveryPrice: "$300",
      monthlyPrice: "$179",
      description:
        "Perfect for studio apartments or 1-2 rooms. Compact yet spacious.",
      features: [
        "No-contact delivery & pickup",
        "Keep it as long as you need",
        "$5,000 content protection included",
        "15 free moving blankets",
      ],
      recommended: true,
    },
    discount: {
      code: "FIRSTMOVE15",
      percentage: 15,
      description: "first-time customer discount",
    },
  },
  medium: {
    base: {
      id: "offer-12ft",
      title: "12-Foot Container",
      price: "$340",
      deliveryPrice: "$340",
      monthlyPrice: "$219",
      description: "Ideal for 2-3 rooms. Our most versatile option.",
      features: [
        "No-contact delivery & pickup",
        "Keep it as long as you need",
        "$7,500 content protection included",
        "20 free moving blankets",
      ],
      recommended: true,
    },
    discount: {
      code: "SAVE10NOW",
      percentage: 10,
      description: "seasonal savings",
    },
  },
  large: {
    base: {
      id: "offer-16ft",
      title: "16-Foot Container",
      price: "$370",
      deliveryPrice: "$370",
      monthlyPrice: "$249",
      description:
        "Perfect for 3-4 rooms. Weather-proof, steel construction with barn-style doors.",
      features: [
        "No-contact delivery & pickup",
        "Keep it as long as you need",
        "$10,000 content protection included",
        "30 free moving blankets",
      ],
      recommended: true,
    },
    discount: {
      code: "BIGMOVE20",
      percentage: 20,
      description: "large move special",
    },
  },
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
      const hash = (i * 7 + parseInt(originZip.slice(0, 2) || "10")) % 10;
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
    roomCount = Math.max(...numbers.map((n) => parseInt(n)));
  } else if (normalized.includes("studio")) {
    roomCount = 1;
  } else if (normalized.includes("one") || normalized.includes("single")) {
    roomCount = 1;
  } else if (normalized.includes("two") || normalized.includes("couple")) {
    roomCount = 2;
  } else if (normalized.includes("three")) {
    roomCount = 3;
  } else if (normalized.includes("four")) {
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

function applyDiscount(
  offer: OfferData,
  discount: { code: string; percentage: number; description: string }
): OfferData {
  const deliveryMatch = offer.deliveryPrice.match(/\$?([\d,]+)/);
  const monthlyMatch = offer.monthlyPrice.match(/\$?([\d,]+)/);

  if (deliveryMatch && monthlyMatch) {
    const originalDelivery = parseInt(deliveryMatch[1].replace(",", ""));
    const originalMonthly = parseInt(monthlyMatch[1].replace(",", ""));
    const discountedDelivery = Math.round(
      originalDelivery * (1 - discount.percentage / 100)
    );
    const discountedMonthly = Math.round(
      originalMonthly * (1 - discount.percentage / 100)
    );

    return {
      ...offer,
      price: `$${discountedDelivery}`,
      deliveryPrice: `$${discountedDelivery}`,
      monthlyPrice: `$${discountedMonthly}`,
      originalDeliveryPrice: `$${originalDelivery}`,
      originalMonthlyPrice: `$${originalMonthly}`,
      discount: `${discount.percentage}% OFF — Code ${discount.code}`,
      features: [
        `🎉 ${discount.percentage}% OFF — Code ${discount.code} auto-applied!`,
        ...offer.features,
      ],
    };
  }
  return offer;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<ChatState>("GREETING");
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [selectedOffer, setSelectedOffer] = useState<OfferData | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [quoteId, setQuoteId] = useState<string>("");
  const [pendingOffer, setPendingOffer] = useState<{
    offer: OfferData;
    description: string;
  } | null>(null);

  const addMessage = useCallback(
    (
      content: string,
      role: "user" | "assistant",
      type:
        | "text"
        | "offer"
        | "confirmation"
        | "inventory"
        | "addons"
        | "facility"
        | "greeting"
        | "datePrompt"
        | "quotePrompt"
        | "addonsPrompt" = "text",
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
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    []
  );

  const simulateBotResponse = useCallback(
    async (
      response: string,
      nextState: ChatState,
      delay = 1000,
      offer?: OfferData,
      confirmation?: ConfirmationData,
      msgType?:
        | "text"
        | "offer"
        | "confirmation"
        | "inventory"
        | "addons"
        | "facility"
        | "greeting"
        | "datePrompt"
        | "quotePrompt"
        | "addonsPrompt",
      facilityData?: FacilityData
    ) => {
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, delay));
      const type =
        msgType || (offer ? "offer" : confirmation ? "confirmation" : "text");
      addMessage(
        response,
        "assistant",
        type,
        offer,
        confirmation,
        facilityData
      );
      setChatState(nextState);
      setIsTyping(false);
    },
    [addMessage]
  );

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      simulateBotResponse(
        "Hi there! 👋 Welcome to 1-800-PACK-RAT. I'm here to help make your move as smooth and stress-free as possible. Whether you're moving across town or across the country, I've got you covered!\n\nAre you ready to get started?",
        "READY_TO_START",
        500,
        undefined,
        undefined,
        "greeting"
      );
    }
  }, [messages.length, simulateBotResponse]);

  const presentOffer = useCallback(
    async (sizeDescription: string, containerOffer: ContainerOffer) => {
      let finalOffer = containerOffer.base;
      let discountMessage = "";

      if (containerOffer.discount) {
        finalOffer = applyDiscount(
          containerOffer.base,
          containerOffer.discount
        );
        discountMessage = ` I found a **${containerOffer.discount.description}** that saves you **${containerOffer.discount.percentage}%** — I've already applied the code **${containerOffer.discount.code}** to your quote.`;
      }

      // Generate Quote ID
      const newQuoteId = generateQuoteId();
      setQuoteId(newQuoteId);

      // Add quoteId to the offer
      finalOffer = { ...finalOffer, quoteId: newQuoteId };

      // Store the offer for later
      setPendingOffer({ offer: finalOffer, description: sizeDescription });
      setSelectedOffer(finalOffer);

      // Show the "found best deal" message first
      await simulateBotResponse(
        `🎯 Based on your ${sizeDescription} move, I've found the best deal for you!${discountMessage}\n\nYour personalized quote is ready. Would you like to see it?`,
        "CONFIRM_QUOTE",
        1500,
        undefined,
        undefined,
        "quotePrompt"
      );
    },
    [simulateBotResponse]
  );

  const showQuote = useCallback(async () => {
    if (!pendingOffer) return;

    const { offer, description } = pendingOffer;

    await simulateBotResponse(
      `Here's your personalized quote for your ${description} move:`,
      "OFFER_PRESENTED",
      1200,
      offer
    );
  }, [pendingOffer, simulateBotResponse]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      addMessage(content, "user");

      switch (chatState) {
        case "READY_TO_START":
          if (
            content.toLowerCase().includes("more") ||
            content.toLowerCase().includes("tell")
          ) {
            await simulateBotResponse(
              "Of course! Here's what makes 1-800-PACK-RAT special:\n\n📦 **Flexible Storage** — Keep your container as long as you need\n🚚 **Door-to-Door Service** — We deliver and pick up at your convenience\n🔒 **Secure & Protected** — Weather-resistant steel containers with content protection\n💰 **Transparent Pricing** — No hidden fees, and I can often find you discounts!\n\nWhenever you're ready, just let me know and we'll get started! 🎉",
              "READY_TO_START",
              800,
              undefined,
              undefined,
              "greeting"
            );
          } else {
            await simulateBotResponse(
              "Wonderful! Let's find the best moving solution for you. 🚚\n\nFirst, I'll need to know where you're moving from and to — just enter both ZIP codes below:",
              "ASK_ZIP",
              600
            );
          }
          break;

        case "CONFIRM_DATE_PICKER":
          await simulateBotResponse(
            "Here's the calendar — available dates are highlighted. Just click on the date that works best for you:",
            "ASK_DATE",
            1500
          );
          break;

        case "CONFIRM_QUOTE":
          await showQuote();
          break;

        case "ASK_DATE":
          setUserData((prev) => ({ ...prev, date: content }));
          await simulateBotResponse(
            `${content} — great choice! 📅 That gives us plenty of time to make sure everything is ready for you.

Now, to recommend the perfect container size, I have two options:

• **Inventory Estimator** — takes about a minute and gives you the most accurate recommendation

• **Quick estimate** — just tell me roughly how many rooms you're moving

What would you prefer?`,
            "ASK_SIZE_METHOD",
            800,
            undefined,
            undefined,
            "inventory"
          );
          break;

        case "ASK_SIZE_METHOD":
          const lowerContent = content.toLowerCase();
          if (
            lowerContent.includes("inventory") ||
            lowerContent.includes("estimator") ||
            lowerContent.includes("precise") ||
            lowerContent.includes("exact")
          ) {
            setIsTyping(true);
            await new Promise((resolve) => setTimeout(resolve, 800));
            addMessage(
              "Absolutely! I love when customers use this — it really helps ensure you get exactly the right size. Take your time going through each room. If you're not sure about something, it's always better to include it! 😊",
              "assistant"
            );
            setChatState("ASK_INVENTORY");
            setIsTyping(false);
          } else {
            await simulateBotResponse(
              "No problem at all! Just give me a rough idea — how many rooms worth of stuff are you moving? For example: studio, 1-2 rooms, 3-4 rooms, or more?",
              "ASK_SIZE"
            );
          }
          break;

        case "ASK_SIZE":
          setUserData((prev) => ({ ...prev, size: content }));
          const containerOffer = getContainerForRoomCount(content);
          await presentOffer(content, containerOffer);
          break;

        case "OFFER_PRESENTED":
          await simulateBotResponse(
            "I totally understand wanting to know more! This container size was specifically chosen based on what you told me about your move. It gives you enough room to pack comfortably without paying for space you won't use.\n\nThe best part? If you find you need more space, we can always adjust. Would you like to go ahead with this option, or do you have any other questions? I'm happy to help!",
            "OFFER_PRESENTED"
          );
          break;

        case "CONFIRM_ADDONS":
          const addonsChoice = content.toLowerCase();
          if (
            addonsChoice.includes("skip") ||
            addonsChoice.includes("no") ||
            addonsChoice.includes("later")
          ) {
            // Skip add-ons and go directly to confirmation
            setSelectedAddOns([]);
            await simulateBotResponse(
              `No problem! Sometimes you just need the container and that's totally fine. 😊\n\nSo here's the summary: Your **${
                selectedOffer?.title
              }** is ready to go for **${
                userData.date || "your selected date"
              }**, with your discount already applied.\n\nShall we finalize your reservation?`,
              "CONFIRMATION"
            );
          } else {
            // Show add-ons
            await simulateBotResponse(
              "Great! Here are some popular add-ons that customers find really helpful. Take your time and select any that you'd like — no pressure! 😊",
              "ASK_ADDONS",
              800,
              undefined,
              undefined,
              "addons"
            );
          }
          break;

        case "ASK_ADDONS":
          await simulateBotResponse(
            "Take your time looking through the options above! These are some of our most popular add-ons that customers find really helpful. No pressure though — just pick what makes sense for your move, or skip if you're all set. 😊",
            "ASK_ADDONS"
          );
          break;

        case "CONFIRMATION":
          const confirmContent = content.toLowerCase();
          if (
            confirmContent.includes("yes") ||
            confirmContent.includes("proceed") ||
            confirmContent.includes("checkout") ||
            confirmContent.includes("ok") ||
            confirmContent.includes("sure")
          ) {
            await simulateBotResponse(
              "Wonderful! 🎉 You're almost there! Just need a few details to finalize your reservation. Don't worry — your information is secure and we'll only use it to coordinate your move and send you important updates.",
              "COLLECT_CONTACT"
            );
          } else {
            await simulateBotResponse(
              "Of course! I want you to feel 100% confident about your choice. What questions can I answer for you? I'm here to help with anything — pricing, container features, scheduling flexibility, you name it!",
              "CONFIRMATION"
            );
          }
          break;

        case "COLLECT_CONTACT":
          await simulateBotResponse(
            "Just fill out the form above whenever you're ready! I'll wait right here. 😊",
            "COLLECT_CONTACT"
          );
          break;

        case "COMPLETED":
          await simulateBotResponse(
            "Of course! I'm still here if you need anything else. Whether it's questions about your upcoming move, making changes to your reservation, or anything else — just let me know!",
            "COMPLETED"
          );
          break;

        default:
          await simulateBotResponse(
            "I'm sorry, I didn't quite catch that. Could you tell me a bit more about what you're looking for? I'm here to help!",
            chatState
          );
      }
    },
    [
      chatState,
      addMessage,
      simulateBotResponse,
      presentOffer,
      showQuote,
      selectedOffer,
      userData.date,
    ]
  );

  const handleZipSubmit = useCallback(
    async (origin: string, destination: string) => {
      addMessage(`Moving from ${origin} to ${destination}`, "user");
      setUserData((prev) => ({ ...prev, origin, destination }));

      // Immediately change state to prevent ZIP form from reappearing
      setChatState("CHECKING_AVAILABILITY");

      // Get facility information
      const assignedFacility = getFacilityForZip(origin);
      setFacility(assignedFacility);

      // Check availability - give time for "thinking"
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      addMessage(
        `Thanks! Let me check availability for your route... 🔍`,
        "assistant"
      );

      const dates = getAvailableDates(origin, destination);
      setAvailableDates(dates);

      // Simulate checking - longer pause for realism
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setIsTyping(false);

      // Show facility card - give time to read
      addMessage(
        `Wonderful news! ✅ I found availability for your move. Your booking will be handled by our local team who knows your area well:`,
        "assistant",
        "facility",
        undefined,
        undefined,
        assignedFacility
      );

      // Longer pause to let user read facility info
      await new Promise((resolve) => setTimeout(resolve, 2500));

      await simulateBotResponse(
        `I found **${dates.length} available delivery dates** over the next few weeks. 📅\n\nWhenever you're ready, I'll show you the calendar to pick the date that works best for your schedule.`,
        "CONFIRM_DATE_PICKER",
        1200,
        undefined,
        undefined,
        "datePrompt"
      );
    },
    [addMessage, simulateBotResponse]
  );

  const handleSelectOffer = useCallback(
    async (offerId: string) => {
      const offerTitle = selectedOffer?.title || "container";
      addMessage(`I'd like to select the ${offerTitle}`, "user");

      await simulateBotResponse(
        `Excellent choice! The ${offerTitle} is perfect for your move. 🎉\n\nBefore we wrap up, I wanted to show you a few popular add-ons that other customers moving similar distances have found really helpful. Would you like to take a look?`,
        "CONFIRM_ADDONS",
        1000,
        undefined,
        undefined,
        "addonsPrompt"
      );
    },
    [addMessage, simulateBotResponse, selectedOffer]
  );

  const handleInventoryComplete = useCallback(
    async (recommendation: string, totalUnits: number) => {
      addMessage(
        `Inventory complete: ${recommendation} worth of items`,
        "user"
      );
      setUserData((prev) => ({
        ...prev,
        size: recommendation,
        inventoryUnits: totalUnits.toString(),
      }));

      // Immediately change state to prevent inventory form from reappearing
      setChatState("CONFIRM_QUOTE");

      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      addMessage(
        "Thanks for taking the time to go through that! Based on your inventory, I can now give you a really accurate recommendation. 👍",
        "assistant"
      );
      setIsTyping(false);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const containerOffer = getContainerBySpaceUnits(totalUnits);
      await presentOffer(recommendation, containerOffer);
    },
    [addMessage, presentOffer]
  );

  const handleAddOnsComplete = useCallback(
    async (addOns: string[]) => {
      setSelectedAddOns(addOns);

      if (addOns.length > 0) {
        addMessage(
          `Selected ${addOns.length} add-on${addOns.length > 1 ? "s" : ""}`,
          "user"
        );
        await simulateBotResponse(
          `Great picks! Those will definitely come in handy. 👍\n\nAlright, here's where we're at: Your **${
            selectedOffer?.title
          }** is reserved for **${
            userData.date || "your selected date"
          }**, and I've noted your add-ons. Your discount has been pre-applied to give you the best price.\n\nReady to lock this in? Just say the word and we'll get you set up!`,
          "CONFIRMATION"
        );
      } else {
        addMessage("No add-ons needed", "user");
        await simulateBotResponse(
          `No problem! Sometimes you just need the container and that's totally fine. 😊\n\nSo here's the summary: Your **${
            selectedOffer?.title
          }** is ready to go for **${
            userData.date || "your selected date"
          }**, with your discount already applied.\n\nShall we finalize your reservation?`,
          "CONFIRMATION"
        );
      }
    },
    [addMessage, simulateBotResponse, selectedOffer, userData.date]
  );

  const handleContactSubmit = useCallback(
    async (contactData: { name: string; email: string; phone: string }) => {
      setUserData((prev) => ({
        ...prev,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
      }));

      addMessage(`${contactData.name}, ${contactData.email}`, "user");

      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const confirmationData: ConfirmationData = {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        containerType: selectedOffer?.title || "Container",
        deliveryDate: userData.date || "TBD",
        originZip: userData.origin || "",
        destinationZip: userData.destination || "",
        addOns: selectedAddOns,
        quoteId: quoteId,
      };

      addMessage(
        `You're all set, ${contactData.name}! 🎉`,
        "assistant",
        "confirmation",
        undefined,
        confirmationData
      );
      setChatState("COMPLETED");
      setIsTyping(false);

      await new Promise((resolve) => setTimeout(resolve, 1200));
      await simulateBotResponse(
        `It was my pleasure helping you today, ${
          contactData.name
        }! Our team at the ${facility?.name || "local facility"} in ${
          facility?.city || "your area"
        } will reach out if they need anything.\n\nYour **Quote ID is ${quoteId}** — please save this for your records.\n\n📞 If you have any questions before your move date, call us at **1-800-PACK-RAT (1-800-722-5728)** and mention your Quote ID for quick assistance.\n\nGood luck with your move! 🏠✨\n\n📹 **Pro Tip:** Want to make the most of your container space? Check out our helpful video guide on how to load your container like a pro: [Watch Loading Tips Video](https://www.youtube.com/watch?v=re5ay2BTGz4)`,
        "COMPLETED",
        500
      );
    },
    [
      addMessage,
      simulateBotResponse,
      selectedOffer,
      userData,
      selectedAddOns,
      facility,
      quoteId,
    ]
  );

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
    completeAddOns: handleAddOnsComplete,
  };
};
