import React, { useState } from 'react';
import { AppScreen, DraftClaim, Claim, ClaimStatus, Issue, InvoiceDetails, FollowUp } from './types';
import Dashboard from './screens/Dashboard';
import InvoiceStep from './screens/InvoiceStep';
import IssueManagerStep from './screens/IssueManagerStep';
import ReviewStep from './screens/ReviewStep';
import SuccessStep from './screens/SuccessStep';
import ClaimDetailsStep from './screens/ClaimDetailsStep';
import { ArrowLeft } from 'lucide-react';

// Enhanced mock data with details
const INITIAL_CLAIMS: Claim[] = [
  {
    id: '1',
    claimNumber: 'RFC#12500',
    status: ClaimStatus.IN_PROGRESS,
    date: 'Oct 24, 2023',
    thumbnailUrl: 'https://picsum.photos/100/100?random=1',
    details: {
      invoice: {
        customerName: 'Sarah Smith',
        invoiceNumber: 'INV-2023-001',
        purchaseDate: '2023-01-15'
      },
      issues: [
        {
          id: 'i1',
          imageUrl: 'https://picsum.photos/100/100?random=1',
          detectedIssue: 'Water Damage',
          remarks: 'Noticed swelling in the corner planks.',
          timestamp: 1698100000000
        }
      ],
      followUps: [
        {
          id: 'f1',
          message: 'When can I expect the surveyor to visit?',
          date: 'Oct 26, 2023',
          status: 'Responded',
          response: 'Our surveyor is scheduled for Oct 30th.'
        }
      ]
    }
  },
  {
    id: '2',
    claimNumber: 'RFC#12492',
    status: ClaimStatus.RESOLVED,
    date: 'Sep 12, 2023',
    thumbnailUrl: 'https://picsum.photos/100/100?random=2',
    details: {
      invoice: {
        customerName: 'Mike Ross',
        invoiceNumber: 'INV-2023-892',
        purchaseDate: '2022-11-20'
      },
      issues: [
        {
          id: 'i2',
          imageUrl: 'https://picsum.photos/100/100?random=2',
          detectedIssue: 'Cracked Tile',
          remarks: 'Hairline cracks appeared after installation.',
          timestamp: 1694470000000
        }
      ],
      followUps: []
    }
  },
];

const INITIAL_DRAFT: DraftClaim = {
  invoice: {
    customerName: '',
    invoiceNumber: '',
    purchaseDate: '',
    file: null,
  },
  issues: [],
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DASHBOARD);
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [draft, setDraft] = useState<DraftClaim>(INITIAL_DRAFT);
  const [lastSubmittedClaimId, setLastSubmittedClaimId] = useState<string>('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const resetDraft = () => {
    setDraft({
      invoice: { customerName: '', invoiceNumber: '', purchaseDate: '', file: null },
      issues: [],
    });
  };

  const handleStartClaim = () => {
    resetDraft();
    setCurrentScreen(AppScreen.WIZARD_INVOICE);
  };

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setCurrentScreen(AppScreen.CLAIM_DETAILS);
  };

  const handleSuccessViewDetails = () => {
    // Find the claim that matches lastSubmittedClaimId
    const claim = claims.find(c => c.claimNumber === lastSubmittedClaimId);
    if (claim) {
      handleViewClaim(claim);
    } else {
      // Fallback
      setCurrentScreen(AppScreen.DASHBOARD);
    }
  };

  const updateInvoice = (details: Partial<InvoiceDetails>) => {
    setDraft((prev) => ({ ...prev, invoice: { ...prev.invoice, ...details } }));
  };

  const addIssue = (issue: Issue) => {
    setDraft((prev) => ({ ...prev, issues: [...prev.issues, issue] }));
  };

  const removeIssue = (id: string) => {
    setDraft((prev) => ({ ...prev, issues: prev.issues.filter((i) => i.id !== id) }));
  };

  const handleAddFollowUp = (claimId: string, message: string) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const newFollowUp: FollowUp = {
          id: Date.now().toString(),
          message,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Pending'
        };
        const currentDetails = claim.details || {
          invoice: { customerName: '', invoiceNumber: '', purchaseDate: '' },
          issues: [],
          followUps: []
        };

        const updatedClaim = {
          ...claim,
          details: {
            ...currentDetails,
            followUps: [...(currentDetails.followUps || []), newFollowUp]
          }
        };

        // Also update the selected claim so the view updates immediately
        if (selectedClaim && selectedClaim.id === claimId) {
          setSelectedClaim(updatedClaim);
        }

        return updatedClaim;
      }
      return claim;
    }));
  };

  const submitClaim = () => {
    const newClaimId = `RFC#${Math.floor(Math.random() * 10000) + 10000}`;
    const newClaim: Claim = {
      id: Date.now().toString(),
      claimNumber: newClaimId,
      status: ClaimStatus.PENDING,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      thumbnailUrl: draft.issues[0]?.imageUrl || 'https://picsum.photos/100/100?random=99',
      details: {
        invoice: {
          customerName: draft.invoice.customerName,
          invoiceNumber: draft.invoice.invoiceNumber,
          purchaseDate: draft.invoice.purchaseDate
        },
        issues: draft.issues,
        followUps: []
      }
    };

    setClaims((prev) => [newClaim, ...prev]);
    setLastSubmittedClaimId(newClaimId);
    setCurrentScreen(AppScreen.SUCCESS);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.DASHBOARD:
        return (
          <Dashboard
            claims={claims}
            onRaiseClaim={handleStartClaim}
            onViewClaim={handleViewClaim}
          />
        );
      case AppScreen.WIZARD_INVOICE:
        return (
          <InvoiceStep
            data={draft.invoice}
            onUpdate={updateInvoice}
            onNext={() => setCurrentScreen(AppScreen.WIZARD_ISSUES)}
            onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
          />
        );
      case AppScreen.WIZARD_ISSUES:
        return (
          <IssueManagerStep
            issues={draft.issues}
            onAddIssue={addIssue}
            onRemoveIssue={removeIssue}
            onNext={() => setCurrentScreen(AppScreen.WIZARD_REVIEW)}
            onBack={() => setCurrentScreen(AppScreen.WIZARD_INVOICE)}
          />
        );
      case AppScreen.WIZARD_REVIEW:
        return (
          <ReviewStep
            draft={draft}
            onSubmit={submitClaim}
            onBack={() => setCurrentScreen(AppScreen.WIZARD_ISSUES)}
          />
        );
      case AppScreen.SUCCESS:
        return (
          <SuccessStep
            claimNumber={lastSubmittedClaimId}
            onHome={() => setCurrentScreen(AppScreen.DASHBOARD)}
            onViewDetails={handleSuccessViewDetails}
          />
        );
      case AppScreen.CLAIM_DETAILS:
        return selectedClaim ? (
          <ClaimDetailsStep
            claim={selectedClaim}
            onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
            onAddFollowUp={handleAddFollowUp}
          />
        ) : <Dashboard claims={claims} onRaiseClaim={handleStartClaim} onViewClaim={handleViewClaim} />;
      default:
        return <Dashboard claims={claims} onRaiseClaim={handleStartClaim} onViewClaim={handleViewClaim} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
