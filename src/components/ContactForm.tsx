import React, { useState } from 'react';
import { Mail, Phone, Send, User } from 'lucide-react';

interface ContactFormProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ name: name.trim(), email: email.trim(), phone });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Mail className="w-7 h-7 text-brand-blue" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Almost there!</h3>
        <p className="text-sm text-gray-500">Enter your contact details to complete your reservation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="John Smith"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder="john@example.com"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all ${
                errors.phone ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-brand-red hover:bg-[#A61A22] active:bg-[#8B161C] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.98] mt-6"
        >
          <Send className="w-5 h-5" />
          Complete Reservation
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          By submitting, you agree to receive booking confirmations and updates via email and SMS.
        </p>
      </form>
    </div>
  );
};

