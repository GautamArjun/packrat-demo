import React, { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

interface ZipCodeFormProps {
  onSubmit: (origin: string, destination: string) => void;
}

export const ZipCodeForm: React.FC<ZipCodeFormProps> = ({ onSubmit }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateZip = (zip: string) => {
    return /^\d{5}$/.test(zip);
  };

  const handleZipChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    // Only allow digits and limit to 5 characters
    const digits = value.replace(/\D/g, '').slice(0, 5);
    setter(digits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!origin.trim()) {
      newErrors.origin = 'Origin ZIP is required';
    } else if (!validateZip(origin)) {
      newErrors.origin = 'Please enter a valid 5-digit ZIP code';
    }

    if (!destination.trim()) {
      newErrors.destination = 'Destination ZIP is required';
    } else if (!validateZip(destination)) {
      newErrors.destination = 'Please enter a valid 5-digit ZIP code';
    }

    if (origin === destination && origin.length === 5) {
      newErrors.destination = 'Destination must be different from origin';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(origin, destination);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-7 h-7 text-brand-blue" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Where are you moving?</h3>
        <p className="text-sm text-gray-500">Enter your ZIP codes to check availability</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin ZIP */}
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1.5">
            Moving From
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs font-bold">FROM</span>
            </div>
            <input
              type="text"
              id="origin"
              value={origin}
              onChange={(e) => {
                handleZipChange(e.target.value, setOrigin);
                if (errors.origin) setErrors(prev => ({ ...prev, origin: '' }));
              }}
              placeholder="Enter ZIP code"
              className={`w-full pl-14 pr-4 py-3.5 border rounded-xl text-gray-800 text-lg font-semibold tracking-wider placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all ${
                errors.origin ? 'border-red-500' : 'border-gray-200'
              }`}
              inputMode="numeric"
              maxLength={5}
            />
          </div>
          {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
        </div>

        {/* Arrow indicator */}
        <div className="flex justify-center py-1">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
          </div>
        </div>

        {/* Destination ZIP */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1.5">
            Moving To
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-blue/10 rounded-full flex items-center justify-center">
              <span className="text-brand-blue text-xs font-bold">TO</span>
            </div>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => {
                handleZipChange(e.target.value, setDestination);
                if (errors.destination) setErrors(prev => ({ ...prev, destination: '' }));
              }}
              placeholder="Enter ZIP code"
              className={`w-full pl-14 pr-4 py-3.5 border rounded-xl text-gray-800 text-lg font-semibold tracking-wider placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all ${
                errors.destination ? 'border-red-500' : 'border-gray-200'
              }`}
              inputMode="numeric"
              maxLength={5}
            />
          </div>
          {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
        </div>

        <button
          type="submit"
          disabled={origin.length < 5 || destination.length < 5}
          className="w-full bg-brand-red hover:bg-[#A61A22] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.98] mt-6"
        >
          Check Availability
        </button>
      </form>
    </div>
  );
};

