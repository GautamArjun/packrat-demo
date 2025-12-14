import React from 'react';
import { motion } from 'framer-motion';
import { Check, Truck, Tag } from 'lucide-react';
import { OfferData } from '@/types/chat';
import { cn } from '@/lib/utils';

interface OfferCardProps {
  offer: OfferData;
  onSelect: (offerId: string) => void;
  className?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onSelect, className }) => {
  // Check if this offer has a discount (features starting with 🎉)
  const hasDiscount = offer.features.some(f => f.startsWith('🎉'));
  const discountFeature = offer.features.find(f => f.startsWith('🎉'));
  const priceFeature = offer.features.find(f => f.startsWith('Was'));
  const regularFeatures = offer.features.filter(f => !f.startsWith('🎉') && !f.startsWith('Was'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "bg-white border rounded-xl shadow-lg overflow-hidden w-full max-w-sm my-2 ring-1",
        offer.recommended ? "border-brand-blue ring-brand-blue/20" : "border-gray-200 ring-transparent",
        className
      )}
    >
      {offer.recommended && (
        <div className="bg-brand-red text-white text-xs font-bold px-3 py-1.5 text-center uppercase tracking-wider">
          Best Value for Your Move
        </div>
      )}
      
      {/* Discount Banner */}
      {hasDiscount && discountFeature && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          <span className="text-sm font-bold">{discountFeature.replace('🎉 ', '')}</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Truck className="w-7 h-7 text-brand-blue" />
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-brand-navy tracking-tight">{offer.price}</span>
            {priceFeature && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">{priceFeature}</p>
            )}
            {!priceFeature && (
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">estimated total</p>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">{offer.title}</h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed border-b border-gray-100 pb-4">{offer.description}</p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <ul className="space-y-3">
            {regularFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <Check className="w-4 h-4 text-brand-red mr-3 mt-0.5 flex-shrink-0 stroke-[3px]" />
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => onSelect(offer.id)}
          className="w-full bg-brand-red hover:bg-[#A61A22] active:bg-[#8B161C] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.98]"
        >
          Select This Offer
        </button>
      </div>
    </motion.div>
  );
};
