import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Shield, Clock, Wrench, Check, Plus,
  Boxes, Truck
} from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const AVAILABLE_ADDONS: AddOn[] = [
  {
    id: 'packing-kit',
    name: 'Premium Packing Kit',
    price: '$49',
    originalPrice: '$79',
    description: '20 boxes, tape, bubble wrap & markers',
    icon: <Boxes className="w-5 h-5" />,
    popular: true
  },
  {
    id: 'protection-upgrade',
    name: 'Enhanced Protection',
    price: '$29',
    description: 'Upgrade to $25,000 content coverage',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'extended-rental',
    name: 'Extra Month Rental',
    price: '$99',
    originalPrice: '$149',
    description: 'Extend your rental by 30 days',
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: 'loading-help',
    name: 'Loading Assistance',
    price: '$199',
    description: '2 movers for 2 hours to help load',
    icon: <Truck className="w-5 h-5" />
  },
  {
    id: 'furniture-pads',
    name: 'Extra Furniture Pads',
    price: '$25',
    description: '20 additional moving blankets',
    icon: <Package className="w-5 h-5" />
  },
  {
    id: 'mattress-covers',
    name: 'Mattress & Sofa Covers',
    price: '$35',
    description: 'Protect your furniture from dust & dirt',
    icon: <Wrench className="w-5 h-5" />
  }
];

interface AddOnSelectorProps {
  onComplete: (selectedAddOns: string[]) => void;
  containerSize?: string;
}

export const AddOnSelector: React.FC<AddOnSelectorProps> = ({ onComplete, containerSize }) => {
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getTotalPrice = () => {
    let total = 0;
    selectedAddOns.forEach(id => {
      const addon = AVAILABLE_ADDONS.find(a => a.id === id);
      if (addon) {
        total += parseInt(addon.price.replace('$', ''));
      }
    });
    return total;
  };

  const handleContinue = () => {
    onComplete(Array.from(selectedAddOns));
  };

  // Recommend add-ons based on container size
  const getRecommendedAddOns = () => {
    if (containerSize?.includes('16') || containerSize?.includes('large')) {
      return ['packing-kit', 'loading-help'];
    } else if (containerSize?.includes('12') || containerSize?.includes('medium')) {
      return ['packing-kit', 'protection-upgrade'];
    }
    return ['packing-kit'];
  };

  const recommendedIds = getRecommendedAddOns();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-full max-w-md my-2"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-4">
        <h3 className="font-bold text-lg">✨ Enhance Your Move</h3>
        <p className="text-purple-100 text-sm mt-1">Optional add-ons to make moving easier</p>
      </div>

      {/* Add-ons List */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {AVAILABLE_ADDONS.map(addon => {
          const isSelected = selectedAddOns.has(addon.id);
          const isRecommended = recommendedIds.includes(addon.id);
          
          return (
            <motion.button
              key={addon.id}
              onClick={() => toggleAddOn(addon.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              {isRecommended && !isSelected && (
                <span className="absolute -top-2 right-3 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Recommended
                </span>
              )}
              
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isSelected ? <Check className="w-5 h-5" /> : addon.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 truncate">{addon.name}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {addon.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">{addon.originalPrice}</span>
                      )}
                      <span className="font-bold text-brand-navy">{addon.price}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{addon.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 border-t border-gray-100">
        <AnimatePresence mode="wait">
          {selectedAddOns.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200"
            >
              <span className="text-sm text-gray-600">{selectedAddOns.size} add-on{selectedAddOns.size > 1 ? 's' : ''} selected</span>
              <span className="font-bold text-lg text-brand-navy">+${getTotalPrice()}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <button
            onClick={() => onComplete([])}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 bg-brand-red hover:bg-[#A61A22] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {selectedAddOns.size > 0 ? (
              <>
                <Plus className="w-4 h-4" />
                Add to Order
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

