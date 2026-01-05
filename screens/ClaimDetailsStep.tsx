import React, { useState } from 'react';
import { Claim, ClaimStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Calendar, FileText, CheckCircle2, User, Clock, AlertCircle, MessageCircle, Send, Plus } from 'lucide-react';

interface ClaimDetailsStepProps {
    claim: Claim;
    onBack: () => void;
    onAddFollowUp: (claimId: string, message: string) => void;
}

const ClaimDetailsStep: React.FC<ClaimDetailsStepProps> = ({ claim, onBack, onAddFollowUp }) => {
    const [isAddingRequest, setIsAddingRequest] = useState(false);
    const [requestText, setRequestText] = useState('');

    const handleSendRequest = () => {
        if (requestText.trim()) {
            onAddFollowUp(claim.id, requestText);
            setRequestText('');
            setIsAddingRequest(false);
        }
    };

    // Mock data if details are missing (for legacy initial state items)
    const invoice = claim.details?.invoice || {
        customerName: 'Customer',
        invoiceNumber: 'INV-Unknown',
        purchaseDate: 'N/A'
    };

    const issues = claim.details?.issues || [
        {
            id: 'mock1',
            imageUrls: [claim.thumbnailUrl],
            detectedIssue: 'Visual Defect',
            remarks: 'No details available for this historic claim.',
            timestamp: Date.now()
        }
    ];

    const followUps = claim.details?.followUps || [];

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-2 shadow-sm z-20 sticky top-0">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="font-bold text-gray-800">Claim Details</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-20">

                {/* Header Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{claim.claimNumber}</h1>
                            <div className="flex items-center text-gray-500 text-xs mt-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>Submitted {claim.date}</span>
                            </div>
                        </div>
                        <StatusBadge status={claim.status} />
                    </div>

                    {/* Simple Timeline */}
                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center text-center">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">Submitted</span>
                        </div>
                        <div className="h-[1px] bg-gray-300 flex-1 mx-2"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${claim.status !== ClaimStatus.PENDING ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                            <span className={`text-[10px] font-bold uppercase ${claim.status !== ClaimStatus.PENDING ? 'text-emerald-700' : 'text-gray-400'}`}>Review</span>
                        </div>
                        <div className="h-[1px] bg-gray-300 flex-1 mx-2"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${claim.status === ClaimStatus.RESOLVED ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                            <span className={`text-[10px] font-bold uppercase ${claim.status === ClaimStatus.RESOLVED ? 'text-emerald-700' : 'text-gray-400'}`}>Resolved</span>
                        </div>
                    </div>
                </div>

                {/* Invoice Info */}
                <section className="mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Invoice Information</h3>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-full">
                                <User className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Customer Name</p>
                                <p className="text-sm font-semibold text-gray-900">{invoice.customerName}</p>
                            </div>
                        </div>
                        <div className="w-full h-[1px] bg-gray-100"></div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Invoice Number</p>
                                <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                            </div>
                        </div>
                        <div className="w-full h-[1px] bg-gray-100"></div>
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                                <Calendar className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Purchase Date</p>
                                <p className="text-sm font-semibold text-gray-900">{invoice.purchaseDate}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Issues List */}
                <section className="mb-8">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Detected Issues ({issues.length})</h3>
                    <div className="space-y-4">
                        {issues.map((issue, idx) => (
                            <div key={issue.id || idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="flex flex-col">
                                    <div className="h-32 bg-gray-200 w-full relative">
                                        {/* For simplicity in details view, maybe a carousel or grid? Let's do a scrollable row if multiple */}
                                        <div className="w-full h-full flex overflow-x-auto snap-x">
                                            {issue.imageUrls && issue.imageUrls.length > 0 ? (
                                                issue.imageUrls.map((url, i) => (
                                                    <img key={i} src={url} className="h-full w-auto object-cover flex-shrink-0 snap-center border-r border-white/20" alt={`Issue view ${i + 1}`} />
                                                ))
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                            )}
                                        </div>
                                        {issue.imageUrls && issue.imageUrls.length > 1 && (
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                {issue.imageUrls.length} Images
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                {issue.detectedIssue}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(issue.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {issue.remarks ? (
                                            <p className="text-xs text-gray-500 line-clamp-2 italic">"{issue.remarks}"</p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No remarks provided.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Follow Up Requests */}
                <section className="mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1 flex items-center justify-between">
                        <span>Follow-up Requests</span>
                        <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md text-[10px]">{followUps.length}</span>
                    </h3>

                    <div className="space-y-3 mb-4">
                        {followUps.length === 0 ? (
                            <div className="text-center py-6 bg-gray-100 rounded-xl border border-dashed border-gray-300">
                                <p className="text-xs text-gray-500">No follow-up requests yet.</p>
                            </div>
                        ) : (
                            followUps.map((req) => (
                                <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-gray-400">{req.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium mb-2">{req.message}</p>
                                    {req.response && (
                                        <div className="bg-gray-50 p-3 rounded-lg border-l-2 border-emerald-500 mt-2">
                                            <p className="text-xs text-gray-500 font-bold mb-1">Support Team Response:</p>
                                            <p className="text-sm text-gray-700">{req.response}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {!isAddingRequest ? (
                        <button
                            onClick={() => setIsAddingRequest(true)}
                            className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Request Follow-up
                        </button>
                    ) : (
                        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-md animate-fade-in">
                            <p className="text-xs font-bold text-emerald-600 mb-2 uppercase">New Request</p>
                            <textarea
                                value={requestText}
                                onChange={(e) => setRequestText(e.target.value)}
                                placeholder="Type your question or request here..."
                                className="w-full text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[80px] p-2 bg-gray-50 mb-3 outline-none resize-none"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSendRequest}
                                    disabled={!requestText.trim()}
                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-3 h-3" />
                                    Send Request
                                </button>
                                <button
                                    onClick={() => setIsAddingRequest(false)}
                                    className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default ClaimDetailsStep;
