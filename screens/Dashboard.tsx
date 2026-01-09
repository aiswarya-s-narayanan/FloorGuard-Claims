import React from 'react';
import { Claim } from '../types';
import ClaimCard from '../components/ClaimCard';
import { Plus, LogOut } from 'lucide-react';

interface DashboardProps {
  claims: Claim[];
  onRaiseClaim: () => void;
  onViewClaim: (claim: Claim) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ claims, onRaiseClaim, onViewClaim, onLogout }) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-emerald-600 px-6 pt-12 pb-8 text-white rounded-b-3xl shadow-lg relative z-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">My Claims</h1>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-emerald-500 rounded-full transition-colors flex items-center justify-center"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
        <p className="text-emerald-100 text-sm">Track and manage your flooring warranty claims</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 -mt-4 relative z-10 pb-24 overflow-y-auto no-scrollbar">
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>No claims found.</p>
              <p className="text-sm">Start a new one below.</p>
            </div>
          ) : (
            claims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                onClick={() => onViewClaim(claim)}
              />
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={onRaiseClaim}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl rounded-full px-6 py-4 flex items-center gap-2 font-semibold transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Raise Claim
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
