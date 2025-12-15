import React from 'react';
import { motion } from 'framer-motion';
import { User, Package, Sparkles, Rocket, HelpCircle, Calendar } from 'lucide-react';
import { Message } from '@/types/chat';
import { OfferCard } from './OfferCard';
import { BookingConfirmation } from './BookingConfirmation';
import { FacilityCard } from './FacilityCard';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  onSelectOffer?: (offerId: string) => void;
  onQuickReply?: (reply: string) => void;
}

// Helper function to parse simple markdown (bold, links, and line breaks) into React elements
const parseMarkdown = (text: string): React.ReactNode => {
  // Split by newlines first
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // First parse links [text](url), then bold text (**text**)
    const linkPattern = /(\[.*?\]\(.*?\))/g;
    const boldPattern = /(\*\*.*?\*\*)/g;
    
    // Split by links first
    const linkParts = line.split(linkPattern);
    
    const parsedLine = linkParts.map((part, partIndex) => {
      // Check if this is a link
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a 
            key={`link-${partIndex}`}
            href={linkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-brand-blue hover:text-brand-navy underline font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }
      
      // Parse bold text within non-link parts
      const boldParts = part.split(boldPattern);
      return boldParts.map((boldPart, boldIndex) => {
        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
          return <strong key={`bold-${partIndex}-${boldIndex}`} className="font-semibold">{boldPart.slice(2, -2)}</strong>;
        }
        return boldPart;
      });
    });
    
    return (
      <React.Fragment key={lineIndex}>
        {parsedLine}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

// Reusable Bot Avatar component for consistency
const BotAvatar = () => (
  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm bg-white border-gray-200">
    <img 
      src="/logo.png" 
      alt="PACKRAT Assistant" 
      className="w-8 h-8 object-contain opacity-90" 
    />
  </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectOffer, onQuickReply }) => {
  const isBot = message.role === 'assistant';

  // Render offer card
  if (message.type === 'offer' && message.offerData && onSelectOffer) {
    return (
      <div className="flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4">
        <BotAvatar />
        <div className="flex-1">
          <OfferCard offer={message.offerData} onSelect={onSelectOffer} />
        </div>
      </div>
    );
  }

  // Render booking confirmation card
  if (message.type === 'confirmation' && message.confirmationData) {
    return (
      <div className="flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4">
        <BotAvatar />
        <div className="flex-1">
          <BookingConfirmation {...message.confirmationData} />
        </div>
      </div>
    );
  }

  // Render facility card
  if (message.type === 'facility' && message.facilityData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4"
      >
        <BotAvatar />
        <div className="flex flex-col max-w-[80%]">
          <div className="px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm bg-white border border-gray-100 text-gray-800 rounded-tl-none mb-3">
            {parseMarkdown(message.content)}
          </div>
          <FacilityCard 
            facilityName={message.facilityData.name}
            city={message.facilityData.city}
            state={message.facilityData.state}
            phone={message.facilityData.phone}
          />
          <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    );
  }

  // Render greeting with quick reply buttons
  if (message.type === 'greeting' && onQuickReply) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4"
      >
        <BotAvatar />
        <div className="flex flex-col max-w-[80%]">
          <div className="px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm bg-white border border-gray-100 text-gray-800 rounded-tl-none">
            <p className="mb-3">{parseMarkdown(message.content)}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button 
                onClick={() => onQuickReply("Yes, let's get started!")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white rounded-full text-sm font-medium hover:bg-brand-navy transition-colors shadow-sm"
              >
                <Rocket className="w-4 h-4" />
                Yes, let's get started!
              </button>
              <button 
                onClick={() => onQuickReply('Tell me more')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Tell me more
              </button>
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    );
  }

  // Render date prompt with quick reply button
  if (message.type === 'datePrompt' && onQuickReply) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4"
      >
        <BotAvatar />
        <div className="flex flex-col max-w-[80%]">
          <div className="px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm bg-white border border-gray-100 text-gray-800 rounded-tl-none">
            <p className="mb-3">{parseMarkdown(message.content)}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button 
                onClick={() => onQuickReply("Show me the calendar")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white rounded-full text-sm font-medium hover:bg-brand-navy transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                Show me the calendar
              </button>
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    );
  }

  // Render inventory prompt with clickable buttons
  if (message.type === 'inventory' && onQuickReply) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4"
      >
        <BotAvatar />
        <div className="flex flex-col max-w-[80%]">
          <div className="px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm bg-white border border-gray-100 text-gray-800 rounded-tl-none">
            <p className="mb-3">{parseMarkdown(message.content)}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button 
                onClick={() => onQuickReply('Use Inventory Estimator')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-medium hover:bg-brand-blue/20 transition-colors border border-brand-blue/20"
              >
                <Package className="w-4 h-4" />
                Use Inventory Estimator
              </button>
              <button 
                onClick={() => onQuickReply('Just tell you rooms')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Just tell you rooms
              </button>
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    );
  }

  // Render add-ons prompt with special styling
  if (message.type === 'addons') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4"
      >
        <BotAvatar />
        <div className="flex flex-col max-w-[80%]">
          <div className="px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-gray-800 rounded-tl-none">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-purple-700">Special Offers Available!</span>
            </div>
            <p>{parseMarkdown(message.content)}</p>
          </div>
          <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4",
        !isBot && "flex-row-reverse"
      )}
    >
      {isBot ? (
        <BotAvatar />
      ) : (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm bg-brand-blue border-brand-blue">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        !isBot && "items-end"
      )}>
        <div className={cn(
          "px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm",
          isBot ? "bg-white border border-gray-100 text-gray-800 rounded-tl-none" : "bg-brand-blue text-white rounded-tr-none shadow-md"
        )}>
          {parseMarkdown(message.content)}
        </div>
        <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};
