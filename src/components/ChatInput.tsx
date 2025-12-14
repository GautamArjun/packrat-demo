import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  inputType?: 'text' | 'date';
  availableDates?: Date[];
}

// Custom Date Picker Component
const DatePicker: React.FC<{
  availableDates: Date[];
  onSelect: (date: string) => void;
}> = ({ availableDates, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start with the month of the first available date
    if (availableDates.length > 0) {
      return new Date(availableDates[0].getFullYear(), availableDates[0].getMonth(), 1);
    }
    return new Date();
  });

  const availableDateStrings = new Set(
    availableDates.map(d => d.toISOString().split('T')[0])
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (availableDateStrings.has(dateStr)) {
      const selectedDate = new Date(year, month, day);
      const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      onSelect(formattedDate);
    }
  };

  const isDateAvailable = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availableDateStrings.has(dateStr);
  };

  const today = new Date();
  const isToday = (day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  // Check if there are any available dates in adjacent months
  const hasAvailableInPrevMonth = availableDates.some(d => 
    d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() < month)
  );
  const hasAvailableInNextMonth = availableDates.some(d => 
    d.getFullYear() > year || (d.getFullYear() === year && d.getMonth() > month)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          disabled={!hasAvailableInPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-bold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          disabled={!hasAvailableInNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const available = isDateAvailable(day);
          const todayDate = isToday(day);
          
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={!available}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                available
                  ? "bg-green-50 text-green-700 hover:bg-green-100 hover:ring-2 hover:ring-green-500 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed",
                todayDate && available && "ring-2 ring-brand-blue",
                todayDate && !available && "ring-1 ring-gray-300"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-50 border border-green-200" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, inputType = 'text', availableDates = [] }) => {
  const [input, setInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      setShowDatePicker(false);
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
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleDateSelect = (formattedDate: string) => {
    setInput(formattedDate);
    setShowDatePicker(false);
    // Auto-submit after selecting a date
    setTimeout(() => {
      onSend(formattedDate);
      setInput('');
    }, 100);
  };

  useEffect(() => {
    if (inputType === 'date' && availableDates.length > 0) {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  }, [inputType, availableDates.length]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-gray-200 p-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-3xl mx-auto w-full relative">
        {/* Date Picker Popup */}
        {showDatePicker && inputType === 'date' && availableDates.length > 0 && (
          <div className="mb-4 flex justify-center">
            <DatePicker 
              availableDates={availableDates} 
              onSelect={handleDateSelect}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-blue/20 focus-within:border-brand-blue transition-all shadow-inner">
          {inputType === 'date' ? (
            <div className="w-full relative flex items-center">
              <Calendar className="absolute left-3 w-5 h-5 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={input}
                onChange={handleChange}
                onFocus={() => availableDates.length > 0 && setShowDatePicker(true)}
                disabled={disabled}
                placeholder="Select a date from the calendar above"
                className="w-full bg-transparent border-none focus:ring-0 outline-none h-[44px] py-2.5 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 text-[15px]"
                readOnly
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
