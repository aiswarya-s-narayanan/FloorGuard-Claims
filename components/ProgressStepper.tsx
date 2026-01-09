import React from 'react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  label: string;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep, totalSteps, label }) => {
  return (
    <div className="w-full px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-emerald-600">Step {currentStep} of {totalSteps}</span>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressStepper;
