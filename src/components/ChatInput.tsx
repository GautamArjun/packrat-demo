import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Calendar } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  inputType?: 'text' | 'date';
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, inputType = 'text' }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target instanceof HTMLTextAreaElement) {
      // Auto-resize
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (inputType === 'date' && dateInputRef.current) {
      // Focus the date input when it appears
      dateInputRef.current.focus();
    }
  }, [inputType]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-gray-200 p-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-3xl mx-auto w-full relative">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-blue/20 focus-within:border-brand-blue transition-all shadow-inner">
          {inputType === 'date' ? (
             <div className="w-full relative flex items-center">
              <Calendar className="absolute left-3 w-5 h-5 text-gray-500 pointer-events-none" />
              <input
                ref={dateInputRef}
                type="date"
                value={input}
                onChange={handleChange}
                disabled={disabled}
                className="w-full bg-transparent border-none focus:ring-0 outline-none h-[44px] py-2.5 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 text-[15px]"
                required
              />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Type your message..."
              className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none max-h-32 min-h-[44px] py-2.5 px-4 text-gray-800 placeholder:text-gray-400 text-[15px]"
              rows={1}
            />
          )}
          
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="p-3 bg-brand-red hover:bg-[#A61A22] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 mb-0.5 shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </form>
        <div className="flex justify-center items-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
            Powered by 1-800-PACK-RAT AI
          </p>
        </div>
      </div>
    </div>
  );
};
