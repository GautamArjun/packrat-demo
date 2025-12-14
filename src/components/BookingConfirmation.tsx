import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Package, MapPin, Mail, Phone, User, Sparkles } from 'lucide-react';

interface BookingConfirmationProps {
  name: string;
  email: string;
  phone: string;
  containerType: string;
  deliveryDate: string;
  originZip: string;
  destinationZip: string;
  addOns?: string[];
}

const ADD_ON_NAMES: Record<string, string> = {
  'packing-kit': 'Premium Packing Kit',
  'protection-upgrade': 'Enhanced Protection',
  'extended-rental': 'Extra Month Rental',
  'loading-help': 'Loading Assistance',
  'furniture-pads': 'Extra Furniture Pads',
  'mattress-covers': 'Mattress & Sofa Covers'
};

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  name,
  email,
  phone,
  containerType,
  deliveryDate,
  originZip,
  destinationZip,
  addOns = []
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-green-200 rounded-xl shadow-lg overflow-hidden w-full max-w-md my-2"
    >
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Reservation Confirmed!</h3>
            <p className="text-green-100 text-sm">Booking #{Date.now().toString().slice(-8)}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Customer Info */}
        <div className="pb-4 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Customer Details</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gray-700">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{phone}</span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="pb-4 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Booking Details</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Container</p>
                <p className="font-semibold text-gray-900">{containerType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Date</p>
                <p className="font-semibold text-gray-900">{deliveryDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Route</p>
                <p className="font-semibold text-gray-900">{originZip} → {destinationZip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add-ons (if any) */}
        {addOns.length > 0 && (
          <div className="pb-4 border-b border-gray-100">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Add-ons Included
            </p>
            <div className="space-y-2">
              {addOns.map(addOnId => (
                <div key={addOnId} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>{ADD_ON_NAMES[addOnId] || addOnId}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-brand-blue font-semibold mb-2">What's Next?</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Confirmation email sent to <strong>{email}</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Text reminder will be sent to <strong>{phone}</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Driver will call 30 mins before delivery</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
