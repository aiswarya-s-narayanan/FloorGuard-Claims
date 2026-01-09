import React from 'react';
import { Claim } from '../types';
import StatusBadge from './StatusBadge';
import { ChevronRight, Calendar } from 'lucide-react';

interface ClaimCardProps {
  claim: Claim;
  onClick: () => void;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onClick }) => {
  return (
    <div 
        onClick={onClick}
        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] transition-transform"
    >
      <img
        src={claim.thumbnailUrl}
        alt="Claim Thumbnail"
        className="w-16 h-16 rounded-lg object-cover bg-gray-200"
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 truncate">{claim.claimNumber}</h3>
          <StatusBadge status={claim.status} />
        </div>
        <div className="flex items-center text-gray-500 text-xs mt-2">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Submitted on {claim.date}</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300" />
    </div>
  );
};

export default ClaimCard;
