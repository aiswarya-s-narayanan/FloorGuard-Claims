import React, { useEffect } from 'react';
import { Check, Home, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessStepProps {
  claimNumber: string;
  onHome: () => void;
  onViewDetails: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ claimNumber, onHome, onViewDetails }) => {
  
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#34d399', '#fcd34d']
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center h-full">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <Check className="w-12 h-12 text-emerald-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Registered!</h1>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        Your warranty claim has been successfully submitted and is now being processed.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 w-full max-w-xs mb-10 border border-gray-100">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Claim Reference ID</p>
        <p className="text-2xl font-mono font-bold text-gray-800">{claimNumber}</p>
      </div>

      <div className="w-full space-y-3">
        <button 
            onClick={onViewDetails}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
        >
            <FileText className="w-5 h-5" />
            View Claim Details
        </button>
        <button 
            onClick={onHome}
            className="w-full py-4 bg-white text-gray-600 rounded-xl font-bold border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
            <Home className="w-5 h-5" />
            Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessStep;
