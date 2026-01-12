import React from 'react';
import { DraftClaim } from '../types';
import ProgressStepper from '../components/ProgressStepper';
import { ArrowLeft, FileText, Calendar, User, CheckCircle } from 'lucide-react';

interface ReviewStepProps {
    draft: DraftClaim;
    onSubmit: () => void;
    onBack: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ draft, onSubmit, onBack }) => {
    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            <div className="bg-white p-4 flex items-center gap-2 shadow-sm z-20">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="font-bold text-gray-800">Final Review</h2>
            </div>

            <ProgressStepper currentStep={3} totalSteps={3} label="Summary" />

            <div className="flex-1 p-6 overflow-y-auto">

                {/* Invoice Summary */}
                <section className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Invoice Details
                    </h3>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                        <div className="flex justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <span className="text-gray-500 text-sm">Customer</span>
                            <span className="font-semibold text-gray-900 text-sm">{draft.invoice.customerName}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <span className="text-gray-500 text-sm">Invoice #</span>
                            <span className="font-semibold text-gray-900 text-sm">{draft.invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between pb-0">
                            <span className="text-gray-500 text-sm">Purchase Date</span>
                            <span className="font-semibold text-gray-900 text-sm">{draft.invoice.purchaseDate}</span>
                        </div>
                    </div>
                </section>

                {/* Issues Summary */}
                <section className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Reported Issues ({draft.issues.length})
                    </h3>
                    <div className="space-y-4">
                        {draft.issues.map((issue, idx) => (
                            <div key={issue.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <div className="h-32 bg-gray-200 w-full relative">
                                    <img src={issue.imageUrls[0]} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                        Issue #{idx + 1}
                                    </div>
                                    {issue.imageUrls.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                            +{issue.imageUrls.length - 1} more
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400 font-bold uppercase">Detected Type</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${issue.severity === 'severe' ? 'bg-red-500 text-white' :
                                                issue.severity === 'moderate' ? 'bg-orange-500 text-white' :
                                                    issue.severity === 'minor' ? 'bg-yellow-500 text-white' :
                                                        'bg-gray-400 text-white'
                                                }`}>
                                                {issue.severity?.toUpperCase() || 'N/A'}
                                            </span>
                                            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{issue.detectedIssue}</span>
                                        </div>
                                    </div>
                                    {issue.remarks && (
                                        <div className="mt-2 pt-2 border-t border-gray-50">
                                            <p className="text-xs text-gray-500 font-semibold mb-1">Description:</p>
                                            <p className="text-xs text-gray-600 leading-relaxed">"{issue.remarks}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <button
                    onClick={onSubmit}
                    className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-colors text-lg"
                >
                    Submit Claim
                </button>
            </div>
        </div>
    );
};

export default ReviewStep;
