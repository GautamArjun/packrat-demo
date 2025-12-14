import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Message } from '@/types/chat';
import { OfferCard } from './OfferCard';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  onSelectOffer?: (offerId: string) => void;
}

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

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectOffer }) => {
  const isBot = message.role === 'assistant';

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
          {message.content}
        </div>
        <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};
