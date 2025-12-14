'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ContactForm } from './ContactForm';
import { ZipCodeForm } from './ZipCodeForm';
import { InventoryEstimator } from './InventoryEstimator';
import { AddOnSelector } from './AddOnSelector';
import { Message, OfferData } from '@/types/chat';
import { ChatState } from '@/hooks/useChat';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onSelectOffer: (offerId: string) => void;
  onContactSubmit: (data: { name: string; email: string; phone: string }) => void;
  onZipSubmit: (origin: string, destination: string) => void;
  onInventoryComplete: (recommendation: string, totalUnits: number) => void;
  onAddOnsComplete: (addOns: string[]) => void;
  chatState: ChatState;
  availableDates?: Date[];
  selectedOffer?: OfferData | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isTyping, 
  onSendMessage,
  onSelectOffer,
  onContactSubmit,
  onZipSubmit,
  onInventoryComplete,
  onAddOnsComplete,
  chatState,
  availableDates = [],
  selectedOffer
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, chatState]);

  // Handle quick reply button clicks
  const handleQuickReply = (reply: string) => {
    onSendMessage(reply);
  };

  // Determine if we should show the text input
  const showTextInput = !['COLLECT_CONTACT', 'ASK_ZIP', 'ASK_INVENTORY', 'ASK_ADDONS'].includes(chatState);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="1-800-PACK-RAT Logo" 
              className="h-10 w-auto object-contain" 
            />
            <div className="hidden sm:flex flex-col border-l border-gray-300 pl-4 h-10 justify-center">
              <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                Booking Assistant
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <a href="tel:1-800-722-5728" className="text-brand-blue font-bold text-lg hover:underline flex items-center gap-2">
              <span className="text-brand-red">Call Now:</span> 1-800-722-5728
            </a>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 w-full pb-32 pt-6">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            onSelectOffer={onSelectOffer}
            onQuickReply={handleQuickReply}
          />
        ))}
        
        {/* ZIP Code Form */}
        {chatState === 'ASK_ZIP' && !isTyping && (
          <div className="w-full max-w-3xl mx-auto px-4 mb-6">
            <ZipCodeForm onSubmit={onZipSubmit} />
          </div>
        )}

        {/* Inventory Estimator */}
        {chatState === 'ASK_INVENTORY' && !isTyping && (
          <div className="w-full max-w-3xl mx-auto px-4 mb-6 flex gap-3">
            <div className="w-10 flex-shrink-0" />
            <InventoryEstimator onComplete={onInventoryComplete} />
          </div>
        )}

        {/* Add-On Selector */}
        {chatState === 'ASK_ADDONS' && !isTyping && (
          <div className="w-full max-w-3xl mx-auto px-4 mb-6 flex gap-3">
            <div className="w-10 flex-shrink-0" />
            <AddOnSelector 
              onComplete={onAddOnsComplete} 
              containerSize={selectedOffer?.title}
            />
          </div>
        )}
        
        {/* Contact Form */}
        {chatState === 'COLLECT_CONTACT' && !isTyping && (
          <div className="w-full max-w-3xl mx-auto px-4 mb-6">
            <ContactForm onSubmit={onContactSubmit} />
          </div>
        )}
        
        {isTyping && (
          <div className="flex gap-3 mb-6 w-full max-w-3xl mx-auto px-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
              <div className="w-4 h-4 bg-brand-blue/30 rounded-full" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      {showTextInput && (
        <ChatInput 
          onSend={onSendMessage} 
          disabled={isTyping} 
          inputType={chatState === 'ASK_DATE' ? 'date' : 'text'}
          availableDates={availableDates}
        />
      )}
    </div>
  );
};
