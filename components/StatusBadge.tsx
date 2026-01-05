import React from 'react';
import { ClaimStatus } from '../types';

interface StatusBadgeProps {
  status: ClaimStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-600';

  switch (status) {
    case ClaimStatus.PENDING:
      colorClass = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      break;
    case ClaimStatus.IN_PROGRESS:
      colorClass = 'bg-blue-100 text-blue-700 border border-blue-200';
      break;
    case ClaimStatus.RESOLVED:
      colorClass = 'bg-green-100 text-green-700 border border-green-200';
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
