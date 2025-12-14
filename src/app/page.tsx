'use client';

import { ChatInterface } from '@/components/ChatInterface';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const { messages, isTyping, sendMessage, selectOffer, submitContact, chatState, availableDates } = useChat();

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatInterface 
        messages={messages} 
        isTyping={isTyping} 
        onSendMessage={sendMessage}
        onSelectOffer={selectOffer}
        onContactSubmit={submitContact}
        chatState={chatState}
        availableDates={availableDates}
      />
    </div>
  );
}
