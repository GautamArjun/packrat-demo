import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sofa, Bed, Tv, Refrigerator, WashingMachine, Bike, 
  Package, ChevronRight, Minus, Plus, LayoutGrid, Check
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  spaceUnits: number; // How much space this takes (1 unit = ~50 cubic feet)
}

interface RoomCategory {
  id: string;
  name: string;
  items: InventoryItem[];
}

const INVENTORY_CATEGORIES: RoomCategory[] = [
  {
    id: 'living',
    name: 'Living Room',
    items: [
      { id: 'sofa', name: 'Sofa/Couch', icon: <Sofa className="w-5 h-5" />, spaceUnits: 3 },
      { id: 'loveseat', name: 'Loveseat', icon: <Sofa className="w-5 h-5" />, spaceUnits: 2 },
      { id: 'tv', name: 'TV (50"+)', icon: <Tv className="w-5 h-5" />, spaceUnits: 1 },
      { id: 'tv-stand', name: 'TV Stand', icon: <LayoutGrid className="w-5 h-5" />, spaceUnits: 1 },
      { id: 'coffee-table', name: 'Coffee Table', icon: <LayoutGrid className="w-5 h-5" />, spaceUnits: 1 },
      { id: 'bookshelf', name: 'Bookshelf', icon: <LayoutGrid className="w-5 h-5" />, spaceUnits: 2 },
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    items: [
      { id: 'king-bed', name: 'King Bed', icon: <Bed className="w-5 h-5" />, spaceUnits: 4 },
      { id: 'queen-bed', name: 'Queen Bed', icon: <Bed className="w-5 h-5" />, spaceUnits: 3 },
      { id: 'twin-bed', name: 'Twin Bed', icon: <Bed className="w-5 h-5" />, spaceUnits: 2 },
      { id: 'dresser', name: 'Dresser', icon: <LayoutGrid className="w-5 h-5" />, spaceUnits: 2 },
      { id: 'nightstand', name: 'Nightstand', icon: <LayoutGrid className="w-5 h-5" />, spaceUnits: 0.5 },
      { id: 'wardrobe', name: 'Wardrobe/Armoire', icon: <LayoutGrid className="w-5 h-5" />, spaceUnits: 3 },
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Dining',
    items: [
      { id: 'fridge', name: 'Refrigerator', icon: <Refrigerator className="w-5 h-5" />, spaceUnits: 3 },
      { id: 'dining-table', name: 'Dining Table', icon: <LayoutGrid className="w-5 h-5" />, spaceUnits: 2 },
      { id: 'dining-chairs', name: 'Dining Chairs (set of 4)', icon: <LayoutGrid className="w-5 h-5" />, spaceUnits: 1 },
      { id: 'microwave', name: 'Microwave', icon: <Package className="w-5 h-5" />, spaceUnits: 0.5 },
    ]
  },
  {
    id: 'other',
    name: 'Other Items',
    items: [
      { id: 'washer', name: 'Washer', icon: <WashingMachine className="w-5 h-5" />, spaceUnits: 2 },
      { id: 'dryer', name: 'Dryer', icon: <WashingMachine className="w-5 h-5" />, spaceUnits: 2 },
      { id: 'bike', name: 'Bicycle', icon: <Bike className="w-5 h-5" />, spaceUnits: 1 },
      { id: 'boxes-small', name: 'Small Boxes (10)', icon: <Package className="w-5 h-5" />, spaceUnits: 1 },
      { id: 'boxes-medium', name: 'Medium Boxes (10)', icon: <Package className="w-5 h-5" />, spaceUnits: 2 },
      { id: 'boxes-large', name: 'Large Boxes (10)', icon: <Package className="w-5 h-5" />, spaceUnits: 3 },
    ]
  }
];

// Container capacities in space units
const CONTAINER_SIZES = [
  { id: '8ft', name: '8-Foot Container', maxUnits: 15, description: 'Studio / 1 Room' },
  { id: '12ft', name: '12-Foot Container', maxUnits: 25, description: '2-3 Rooms' },
  { id: '16ft', name: '16-Foot Container', maxUnits: 40, description: '3-4 Rooms' },
];

interface InventoryEstimatorProps {
  onComplete: (recommendation: string, totalUnits: number) => void;
}

export const InventoryEstimator: React.FC<InventoryEstimatorProps> = ({ onComplete }) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState(INVENTORY_CATEGORIES[0].id);

  const updateItemCount = (itemId: string, delta: number) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || 0;
      const newCount = Math.max(0, current + delta);
      if (newCount === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newCount };
    });
  };

  const getTotalUnits = () => {
    let total = 0;
    INVENTORY_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        const count = selectedItems[item.id] || 0;
        total += count * item.spaceUnits;
      });
    });
    return total;
  };

  const getRecommendedContainer = () => {
    const total = getTotalUnits();
    // Add 20% buffer for packing inefficiency
    const adjustedTotal = total * 1.2;
    
    for (const container of CONTAINER_SIZES) {
      if (adjustedTotal <= container.maxUnits) {
        return container;
      }
    }
    return CONTAINER_SIZES[CONTAINER_SIZES.length - 1]; // Return largest if exceeds
  };

  const totalUnits = getTotalUnits();
  const recommended = getRecommendedContainer();
  const fillPercentage = Math.min(100, (totalUnits * 1.2 / recommended.maxUnits) * 100);
  const totalItems = Object.values(selectedItems).reduce((a, b) => a + b, 0);

  const handleComplete = () => {
    onComplete(recommended.description, totalUnits);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-full max-w-md my-2"
    >
      {/* Header */}
      <div className="bg-brand-blue text-white px-5 py-4">
        <h3 className="font-bold text-lg">📦 Inventory Estimator</h3>
        <p className="text-blue-100 text-sm mt-1">Select your items for an accurate size recommendation</p>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50">
        {INVENTORY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'text-brand-blue border-b-2 border-brand-blue bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {INVENTORY_CATEGORIES.find(c => c.id === activeCategory)?.items.map(item => (
          <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                {item.icon}
              </div>
              <span className="text-sm text-gray-700 font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateItemCount(item.id, -1)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-8 text-center font-semibold text-gray-800">
                {selectedItems[item.id] || 0}
              </span>
              <button
                onClick={() => updateItemCount(item.id, 1)}
                className="w-8 h-8 rounded-lg bg-brand-blue/10 hover:bg-brand-blue/20 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-brand-blue" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation Preview */}
      <div className="bg-gray-50 p-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Recommended Size:</span>
          <span className="font-bold text-brand-navy">{recommended.name}</span>
        </div>
        
        {/* Fill Indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{totalItems} items selected</span>
            <span>{Math.round(fillPercentage)}% capacity</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPercentage}%` }}
              className={`h-full rounded-full transition-colors ${
                fillPercentage < 70 ? 'bg-green-500' :
                fillPercentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
          {fillPercentage > 90 && (
            <p className="text-xs text-amber-600 mt-1">⚠️ Consider a larger container for easier packing</p>
          )}
        </div>

        <button
          onClick={handleComplete}
          disabled={totalItems === 0}
          className="w-full bg-brand-red hover:bg-[#A61A22] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Use This Estimate
        </button>
      </div>
    </motion.div>
  );
};

