import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone } from 'lucide-react';

interface FacilityCardProps {
  facilityName: string;
  city: string;
  state: string;
  phone: string;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facilityName,
  city,
  state,
  phone
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-brand-blue/5 to-brand-blue/10 border border-brand-blue/20 rounded-xl p-4 w-full max-w-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-brand-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-brand-blue font-semibold uppercase tracking-wide mb-1">Your Assigned Facility</p>
          <h4 className="font-bold text-gray-900 text-base">{facilityName}</h4>
          <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{city}, {state}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-brand-blue hover:underline">{phone}</a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

